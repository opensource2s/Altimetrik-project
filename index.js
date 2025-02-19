import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
//import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hotel_booking', {
  //useNewUrlParser: true,
  //useUnifiedTopology: true,
}).then(function(res){
    console.log("Connected to database")
})
.catch(err => console.log(err));


const hotelSchema = new mongoose.Schema({
  name: String,
  location: String,
  rooms: Number,
  rating: Number,

});

const bookingSchema = new mongoose.Schema({
  hotelId: String,
  userId: String,
  rooms: Number,
  checkIn: Date,
  checkOut: Date,
});

const Hotel = mongoose.model('Hotel', hotelSchema);
const Booking = mongoose.model('Booking', bookingSchema);


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

app.get('/hotels', async (req, res) => {
  try {
    const { location,page } = req.query;
    const options = {
        skip : (page-1)*10,
     }
    let hotels = await Hotel.find(location ? { location: location } : {},{_id:0, __v:0,location:0},options).limit(10);
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/book', async (req, res) => {
  try {
    const { hotelId, rooms, checkIn, checkOut } = req.body;
    const { userId } = req.query;
    if (!hotelId || !rooms || !checkIn || !checkOut) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if(!isFutureOrToday(checkIn)){
        return res.status(400).json({ error: 'Invalid Checkin Date' });
    }
    let no_of_rooms = await getNoOfHotelRooms(hotelId);

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
    await Hotel.findByIdAndUpdate({ _id: hotelId },{ $set: { rooms: new_count }},{returnDocument :'after'})
    res.status(201).json(newBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/bookings', async (req, res) => {
  try {
    const { userId } = req.query;
    let bookings = await Booking.findOne({ userId: userId },{_id:0, __v:0,userId:0});
    console.log(bookings)
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut } = req.body;
    const updatedBooking = await Booking.findOneAndUpdate({'userId' :id}, { checkIn, checkOut }, { new: true });
    if (!updatedBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/deletebooking', async (req, res) => {
  try {
    const { id } = req.query;
    let s = await Booking.findOne({'userId' :id},'hotelId rooms');
    let value = s['rooms'];
    await Hotel.updateOne({ _id: s['hotelId'] },{ $inc: { 'rooms': value }},{returnDocument :'after'})
    await Booking.findOneAndDelete({'userId' :id});
    res.status(201).send("Your booking has been cancelled");
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

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

function isFutureOrToday(dateStr) {
    const inputDate = new Date(dateStr);
    const today = new Date();

    // Normalize today's date to remove time part
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    return inputDate >= today;
}