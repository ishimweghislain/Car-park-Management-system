# SmartPark - Parking Management System

A comprehensive web-based parking management system for SmartPark company located in Rubavu District, West Province, Rwanda.

## Features

- **Digital Car Entry/Exit Management**: Replace manual paper-based system
- **Real-time Slot Availability**: Track parking space status in real-time
- **Automatic Fee Calculation**: Calculate parking fees based on duration
- **CRUD Operations**: Full CRUD on parking records only, all other entities are view-only
- **Admin Authentication**: Secure login system with hardcoded admin user
- **Responsive Design**: Built with Tailwind CSS 3.4.16

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing

### Frontend
- **React** with Vite
- **Tailwind CSS 3.4.16** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Lucide React** for icons

## Project Structure

```
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── scripts/         # Utility scripts
│   ├── server.js        # Main server file
│   └── .env            # Environment variables
└── frontend/
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── pages/       # Page components
    │   ├── hooks/       # Custom hooks
    │   ├── services/    # API services
    │   ├── utils/       # Utility functions
    │   └── App.jsx      # Main app component
    └── .env            # Environment variables
```

## Database Schema

### Entities and Relationships

1. **ParkingSlot**
   - slotNumber (Primary Key)
   - slotStatus (available, occupied, maintenance)
   - location
   - isActive

2. **Car**
   - plateNumber (Primary Key)
   - driverName
   - phoneNumber
   - carModel
   - carColor

3. **ParkingRecord**
   - entryTime
   - exitTime
   - duration (calculated)
   - car (Foreign Key to Car)
   - parkingSlot (Foreign Key to ParkingSlot)
   - totalAmount (calculated)
   - status (active, completed)

4. **Payment**
   - amountPaid
   - paymentDate
   - parkingRecord (Foreign Key to ParkingRecord)
   - paymentMethod
   - status

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # .env file is already created with default values
   # Update MONGODB_URI if using a different MongoDB instance
   ```

4. Initialize the database with sample data:
   ```bash
   npm run init
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173`

## Default Admin Credentials

- **Username**: admin
- **Password**: 123

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/init` - Initialize admin user

### Parking Records (Full CRUD)
- `GET /api/parking-records` - Get all records
- `POST /api/parking-records` - Create new record (car entry)
- `PUT /api/parking-records/:id` - Update record
- `PUT /api/parking-records/:id/exit` - Process car exit
- `DELETE /api/parking-records/:id` - Delete record

### Parking Slots (View Only)
- `GET /api/parking-slots` - Get all slots
- `GET /api/parking-slots/stats/summary` - Get slot statistics

### Cars (View Only)
- `GET /api/cars` - Get all cars
- `GET /api/cars/plate/:plateNumber` - Get car by plate number

### Payments (View Only)
- `GET /api/payments` - Get all payments
- `GET /api/payments/stats/summary` - Get payment statistics

## CRUD Operations Policy

### Parking Records (Full CRUD)
- **CREATE**: Add new car entries to parking slots
- **READ**: View all parking records with search and filters
- **UPDATE**: Edit parking record details (entry time, exit time, notes)
- **DELETE**: Remove parking records (automatically frees up slots)

### Other Entities (View Only)
- **Cars**: Automatically created when adding parking records. No direct create/update/delete.
- **Parking Slots**: View availability and status. Management restricted to admin users.
- **Payments**: View payment history. Payments are created through parking record completion.

## Key Features

### Automatic Calculations
- **Duration**: Automatically calculated when car exits
- **Parking Fees**: 1000 RWF per hour (minimum 1 hour)
- **Real-time Updates**: Slot status updates automatically

### Business Logic
- Cars cannot enter if already parked (active record exists)
- Slots must be available for new entries
- Exit processing automatically frees up slots
- Payment tracking with multiple methods (cash, mobile money, card)

### User Interface
- **Dashboard**: Overview with statistics and quick actions
- **Parking Records**: Full CRUD operations with search and filters
- **Parking Slots**: Visual grid showing slot availability
- **Cars**: View registered cars with driver information
- **Payments**: Payment history and transaction details

## Company Information

**SmartPark**
- Location: Rubavu District, West Province, Rwanda
- Services: Multiple car-related services
- Challenge: Manual paper-based parking management
- Solution: Digital parking management system

## Development Notes

- Uses Tailwind CSS 3.4.16 to prevent styling errors
- MongoDB for scalable data storage
- JWT authentication for secure access
- Responsive design for mobile and desktop
- Real-time slot availability tracking
- Automatic fee calculation based on parking duration

## License

This project is developed for SmartPark company in Rwanda.
