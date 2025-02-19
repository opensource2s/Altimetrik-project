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
**GET** `/hotels?location=<city>&page=<page>`
- Fetch all hotels (optional filter by `location` and `page`).
- **Response:**
```json
returns the first 10 hotels
[
    {
        "name": "ITC Grand Central",
        "rooms": 160,
        "rating": 4.7,
        "bookings": []
    },
    {
        "name": "Taj Santacruz",
        "rooms": 150,
        "rating": 4.6,
        "bookings": []
    }
]
```
### 2 Book a room
**POST** `/book?userId=<userId>`
- **Request Body:**
- **Checks if checkin date is Valid**
- **Checks if rooms are available**
- **Once a room is booked it decrements the no of available rooms in the Hotel collection as well**
```json
{
    "hotelId" : "67b4bde3af39b03d01d9b02c",
    "rooms": 2 ,
    "checkIn":"2025-02-19",
    "checkOut": "2025-02-20"
}
```
- **Response:**
```json
{
    "hotelId": "67b4bde3af39b03d01d9b02c",
    "userId": "bunny",
    "rooms": 2,
    "checkIn": "2025-02-19T00:00:00.000Z",
    "checkOut": "2025-02-20T00:00:00.000Z",
    "_id": "67b562aba977f69a38e0cc8b",
    "__v": 0
}
```

### 3 View all bookings
**GET** `/bookings?userId=<userId>`
- Returns a list of bookings for a particular user.
- **Response:**
```json
{
    "hotelId": "67b4bde3af39b03d01d9b02c",
    "rooms": 2,
    "checkIn": "2025-02-19T00:00:00.000Z",
    "checkOut": "2025-02-20T00:00:00.000Z"
}
```

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
    "_id": "67b4b618ab86d51070f70a09",
    "hotelId": "67b47f0297261ec20ee726e4",
    "userId": "shiva",
    "rooms": 2,
    "checkIn": "2025-02-19T00:00:00.000Z",
    "checkOut": "2025-02-20T00:00:00.000Z",
    "__v": 0
}
```

### 5 Cancel a booking
**POST** `/deletebooking?userId=<userId>`
- Deletes a booking.
- Updates the room count for that particular hotel

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
    "cron": "^3.5.0",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "mongoose": "^8.10.1",
    "node-cron": "^3.0.3"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.6.0",
    "supertest": "^6.3.3"
  }
}
```

---

## 🔮 Enhancements
- Change Schema by **Adding Booking Array to keep track of multiple users and booking**.
- Implement **authentication and user roles**.
- Add **payment integration**.
- Build a **frontend** to interact with the API.
