# 🚂  — Online Reservation System

A full-stack railway reservation system built with Node.js, Express, SQLite, and vanilla HTML/CSS/JS.

## Features

- **User Authentication** — JWT-based login with secure password hashing
- **Train Lookup** — Auto-fill train details when entering train number
- **Ticket Booking** — Create reservations with PNR number generation
- **Ticket Cancellation** — Look up ticket by PNR and cancel bookings
- **Dashboard** — View all bookings with stats (total, confirmed, cancelled)

## Tech Stack

| Layer    | Technology              |
|----------|------------------------|
| Frontend | HTML5, CSS3, Vanilla JS |
| Backend  | Node.js, Express.js    |
| Database | SQLite (via sql.js)    |
| Auth     | JWT + bcryptjs         |

## Getting Started

```bash
# 1. Install dependencies
cd server
npm install

# 2. Seed the database
npm run seed

# 3. Start the server
npm start
```

Then open **http://localhost:3000** in your browser.

## Demo Credentials

| Username | Password  | Name          |
|----------|-----------|---------------|
| admin    | admin123  | Admin User    |
| rahul    | rahul123  | Rahul Sharma  |
| priya    | priya123  | Priya Patel   |
| amit     | amit123   | Amit Kumar    |
| sneha    | sneha123  | Sneha Reddy   |

## Available Trains

| Number | Train Name           | Route                       |
|--------|---------------------|-----------------------------|
| 12301  | Rajdhani Express    | New Delhi → Howrah           |
| 12951  | Mumbai Rajdhani     | New Delhi → Mumbai Central   |
| 12259  | Sealdah Duronto     | New Delhi → Sealdah          |
| 12802  | Purushottam Express | New Delhi → Puri             |
| 12627  | Karnataka Express   | New Delhi → Bangalore        |
| 12903  | Golden Temple Mail  | Mumbai Central → Amritsar    |
| 12723  | Telangana Express   | New Delhi → Hyderabad        |
| 12431  | Trivandrum Rajdhani | New Delhi → Trivandrum       |
| 12245  | Shatabdi Express    | New Delhi → Lucknow          |
| 12002  | Bhopal Shatabdi     | New Delhi → Bhopal           |

## API Endpoints

| Method | Endpoint                     | Description            |
|--------|------------------------------|------------------------|
| POST   | `/api/auth/login`            | User login             |
| GET    | `/api/trains`                | List all trains        |
| GET    | `/api/trains/:number`        | Get train by number    |
| POST   | `/api/reservations`          | Book a ticket          |
| GET    | `/api/reservations`          | User's reservations    |
| GET    | `/api/reservations/pnr/:pnr` | Lookup by PNR         |
| POST   | `/api/reservations/cancel`   | Cancel by PNR          |

## Project Structure

```
├── server/
│   ├── server.js              # Express entry point
│   ├── db/
│   │   ├── database.js        # SQLite connection
│   │   └── seed.js            # Seed data
│   ├── routes/
│   │   ├── auth.js            # Authentication
│   │   ├── trains.js          # Train lookup
│   │   └── reservations.js    # Bookings & cancellation
│   └── middleware/
│       └── auth.js            # JWT middleware
├── client/
│   ├── index.html             # Login page
│   ├── dashboard.html         # Dashboard
│   ├── reservation.html       # Book ticket
│   ├── cancellation.html      # Cancel ticket
│   ├── css/style.css          # Design system
│   └── js/
│       ├── api.js             # Shared API helper
│       ├── auth.js            # Login logic
│       ├── dashboard.js       # Dashboard logic
│       ├── reservation.js     # Booking logic
│       └── cancellation.js    # Cancellation logic
└── README.md
```
