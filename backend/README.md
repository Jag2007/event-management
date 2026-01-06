# Event Management Backend API

Express.js backend for the Event Management System with MongoDB.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Update `MONGODB_URI` with your MongoDB connection string
   - Update `PORT` if needed (default: 4000)

3. **Start the Server**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
  - Body: `{ name: string, timezone?: string }`
- `PUT /api/users/:userId/timezone` - Update user timezone
  - Body: `{ timezone: string }`

### Events
- `GET /api/events` - Get all events
  - Query: `?userId=<userId>` - Filter events by user
- `POST /api/events` - Create a new event
  - Body: `{ profiles: string[], profileIds: string[], timezone: string, start: ISO string, end: ISO string }`
- `PUT /api/events/:eventId` - Update an event
  - Body: `{ profiles?, profileIds?, timezone?, start?, end? }`
- `GET /api/events/:eventId/logs` - Get update logs for an event

## MongoDB Collections

- **users** - User profiles with timezone preferences
- **events** - Events with profiles, timezone, and dates
- **eventlogs** - Update history for events

## Environment Variables

- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (default: 4000)
