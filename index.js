import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

// listening on PORT 3000
// make sure nothing is running on 3000 before running the app
// You can read from env 
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// connect to the mongoDB here
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hotel_booking', {
}).then(function(res){
    console.log("Connected to database")
})
.catch(err => console.log(err));

// Provide the schema for mongoDB 
// bookings key is not being used
// bookings can store no of rooms booked for a particular checkin and checkout date 

const hotelSchema = new mongoose.Schema({
  name: String,
  location: String,
  rooms: Number,
  rating: Number,
  bookings:[]
});

// Schema for the bookings collection
// userId is required so that we dont get data of other users
// here hotelId is a _id from Hotel collection : assuming the id will be stored in the frontend

const bookingSchema = new mongoose.Schema({
  hotelId: String,
  userId: String,
  rooms: Number,
  checkIn: Date,
  checkOut: Date,
});

//Initialize the collections here

const Hotel = mongoose.model('Hotel', hotelSchema);
const Booking = mongoose.model('Booking', bookingSchema);


// this is a dummy api for checking the connection to the database
/**
 * How to use
 * request api : *POST* localhost:3000/hotels
 * request body : { "name": "Ibis Bengaluru", "location": "Bengaluru", "rooms": 180, "rating": 4.4 }
 * If the data is stored in db you get 
 * {
    "name": "Ibis Bengaluru",
    "location": "Bengaluru",
    "rooms": 180,
    "rating": 4.4,
    "_id": "67b4bd7ce90c97269a1f8267",
    "bookings": [],
    "__v": 0
}
 */
app.post("/hotels", async (req, res) => {
    try {
      const hotel = new Hotel(req.body);
      let status = await hotel.save();
      console.log(status);
      res.status(201).json(hotel);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
});

// *get* hotels api to get a list of all hotels , based on location ( pagination is included)

app.get('/hotels', async (req, res) => {
  try {
    const { location,page=1 } = req.query;
    const options = {
      skip : (page-1)*10,
    }

    // we are limiting the output to 10 , to optimise performance
    let hotels = await Hotel.find(location ? { location: location } : {},{_id:0, __v:0,location:0},options).limit(10);
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * *Post* book api 
 *  
*/ 
app.post('/book', async (req, res) => {
  try {
    const { hotelId, rooms, checkIn, checkOut } = req.body;
    const { userId } = req.query;
    if (!hotelId || !rooms || !checkIn || !checkOut) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // only checking validity for checkin date assuming checkout date is handled from frontend

    if(!isFutureOrToday(checkIn)){
        return res.status(400).json({ error: 'Invalid Checkin Date' });
    }
    let no_of_rooms = await getNoOfHotelRooms(hotelId);

    // if no of available rooms is 0 , dont proceed with booking

    if(no_of_rooms == 0){
        return res.status(200).json("No rooms available");
    }

    let newBooking = new Booking({
      hotelId : hotelId,
      userId: userId,
      rooms: rooms ,
      checkIn: checkIn,
      checkOut: checkOut,
    });

    await newBooking.save();
    let new_count = no_of_rooms - rooms;

    // decrement the no of rooms 
    // used $set , can also use $inc method

    await Hotel.findByIdAndUpdate({ _id: hotelId },{ $set: { rooms: new_count }},{returnDocument :'after'})
    res.status(201).json(newBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * *GET* bookings api 
 *  
*/ 

app.get('/bookings', async (req, res) => {
  try {
    const { userId } = req.query;
    // we are filtering the keys below in the options ( not showing _id , __v and userId)
    let bookings = await Booking.findOne({ userId: userId },{_id:0, __v:0,userId:0});
    //console.log(bookings)
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * *PUT* bookings api 
 *  
*/ 

app.put('/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut } = req.body;

    // check if the checkIn date is valid here as well

    if(!isFutureOrToday(checkIn)){
      return res.status(400).json({ error: 'Invalid Checkin Date' });
    }
    
    // here the findOneAndUpdate Method returns the updated object with new:True value

    const updatedBooking = await Booking.findOneAndUpdate({'userId' :id}, { checkIn, checkOut }, { new: true });
    if (!updatedBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/* 
* deletebooking api takes userId from params
*/
app.post('/deletebooking', async (req, res) => {
  try {
    const { id } = req.query;
    let s = await Booking.findOne({'userId' :id},'hotelId rooms');
    let value = s['rooms'];

    // increment the rooms available once the booking is deleted
    // can be handled better ( incase the delete operations is failed)

    await Hotel.updateOne({ _id: s['hotelId'] },{ $inc: { 'rooms': value }},{returnDocument :'after'})
    await Booking.findOneAndDelete({'userId' :id});
    res.status(201).send("Your booking has been cancelled");
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// gets no of hotel rooms available given a hotelId
// if there is an error fetching the hotel data return 0 ( to make sure booking throws an error)

async function getNoOfHotelRooms(id){
    try {
        let hotels = await Hotel.find({ _id: id } );
        let count = hotels[0]['rooms'];
        return count;
      } catch (error) {
        console.log(error);
        return 0;
      }
}

// check if date is valid ( should not include yesterdays date)
function isFutureOrToday(dateStr) {
    const inputDate = new Date(dateStr);
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    return inputDate >= today;
}