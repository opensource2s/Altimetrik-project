# 🏨 Hotel Booking API

A **hotel room booking** REST API built using **Node.js, Express, and MongoDB**.  
This API allows users to:
- List all hotels and filter by location.
- Check room availability for given dates.
- Book a room for a hotel.
- View, modify, and cancel bookings.
- Automatically reset availability based on checkout dates.

---

## 📌 Table of Contents
- [Technologies Used](#-technologies-used)
- [Setup Instructions](#-setup-instructions)
- [API Endpoints](#-api-endpoints)
- [Daily Room Reset](#-automatic-daily-room-reset)
- [Testing](#-testing)
- [Dependencies](#-dependencies)
- [Future Enhancements](#-future-enhancements)
- [License](#-license)

---

## 🛠️ Technologies Used
- **Node.js** (v20+)
- **Express.js** (v4.21+)
- **MongoDB** (Mongoose ODM)
- **Cron Jobs** (node-cron) for daily reset of availability
- **dotenv** for environment variables
- **body-parser** for handling JSON requests

---

## 🚀 Setup Instructions

### 1️⃣ Clone the repository
```sh
git clone https://github.com/your-repo/hotel-booking-api.git
cd hotel-booking-api
```

### 2️⃣ Install dependencies
```sh
npm install
```

### 3️⃣ Configure Environment Variables
Create a `.env` file in the root and add:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/hotel_booking
```

### 4️⃣ Start the server
```sh
npm start
```
or in development mode with nodemon:
```sh
npm run dev
```

The server will run on: **http://localhost:3000**

---

## 🔥 API Endpoints

### 1 List all hotels
**GET** `/hotels?location=<city>`
- Fetch all hotels (optional filter by `location`).
- **Response:**
```json
[
  {
    "_id": "hotel123",
    "name": "Grand Palace",
    "location": "New York",
    "totalRooms": 100,
    "bookings": []
  }
]
```
### 2 Book a room
**POST** `/book`
- **Request Body:**
```json
{
  "hotelId": "hotel123",
  "rooms": 2,
  "checkIn": "2024-06-10",
  "checkOut": "2024-06-15"
}
```
- **Response:**
```json
{
  "_id": "booking789",
  "hotelId": "hotel123",
  "userId": "test-user",
  "rooms": 2,
  "checkIn": "2024-06-10",
  "checkOut": "2024-06-15"
}
```

### 3 View all bookings
**GET** `/bookings`
- Returns a list of bookings for the user.

### 4 Modify a booking
**PUT** `/bookings/:id`
- **Request Body:**
```json
{
  "checkIn": "2024-06-12",
  "checkOut": "2024-06-18"
}
```
- **Response:**
```json
{
  "_id": "booking789",
  "checkIn": "2024-06-12",
  "checkOut": "2024-06-18"
}
```

### 5 Cancel a booking
**DELETE** `/bookings/:id`
- Deletes a booking.
- Updates the 

---

## ✅ Testing
You can test the API using **Postman**, **cURL**, or directly through a **frontend**.

For automated testing:
```sh
npm test
```

---

## 📦 Dependencies
```json
{
  "dependencies": {
    "express": "^4.21.0",
    "mongoose": "^6.0.0",
    "body-parser": "^1.20.2",
    "dotenv": "^16.3.1",
    "node-cron": "^3.0.2",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.6.0",
    "supertest": "^6.3.3"
  }
}
```

---

## 🔮 Future Enhancements
- Implement **authentication and user roles**.
- Add **payment integration**.
- Build a **frontend** to interact with the API.
