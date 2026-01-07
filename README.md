# Event Management System (MERN Stack)

This is a full-stack Event Management application built using the **MERN stack** as part of an assignment.  
The project focuses on clean architecture, backend-driven data flow, and a simple, responsive UI.

---

## 🔗 Live Links

- **Frontend (Vercel):** https://event-management-ten-nu.vercel.app/
- **Backend API (Render):** https://event-management-fxtq.onrender.com/

MongoDB is hosted on **MongoDB Atlas** and used as the single source of truth.

---

## 🛠 Tech Stack

### Frontend
- React (Vite)
- JavaScript
- CSS

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)

### Deployment
- Frontend: Vercel  
- Backend: Render  
- Database: MongoDB Atlas


## 📁 Project Structure

```text
event_management/
├── backend/
│   ├── config/        # Database connection
│   ├── middleware/   # Centralized error handling
│   ├── models/       # Mongoose schemas
│   ├── routes/       # Express routes
│   └── server.js     # Backend entry point
│
├── frontend/
│   ├── src/
│   │   ├── api/        # Axios API calls
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page-level components
│   │   ├── store/      # Global state management
│   │   └── utils/      # Time & timezone helpers
│   └── main.jsx
│
└── README.md
```
## Design & Ideology

- All data is handled by the backend (no localStorage).
- MongoDB is the single source of truth.
- Clear separation between frontend and backend.
- Code is modular, readable, and easy to scale.
- Focus on simplicity and maintainability.

---

## 🗃 Database Schema Overview

### User
- Stores user name and timezone.
- Timezone is used to render events correctly for different users.

### Event
- Supports multiple users per event.
- Stores start and end time as Date objects.
- Stores timezone separately to avoid time conversion issues.

### EventLog
- Tracks every update made to an event.
- Stores old and new values for each change.
- Helps in debugging and history tracking.

---

## ✨ Features

- Create and manage users
- Create events with multiple profiles
- Timezone-safe event handling
- Update events with visible change logs
- Fully responsive UI
- Live deployment (frontend + backend)

---

## ⚙️ DSA & Optimization

- Used map, filter, and reduce for clean data handling
- Avoided unnecessary loops and API calls
- Kept state structured for predictable rendering
- Focused on readable and efficient logic

---

## 🚀 Local Setup

### Backend
cd backend  
npm install  
npm start  

### Frontend
cd frontend  
npm install  
npm run dev  

Create a `.env` file in backend with:
MONGO_URI=your_mongodb_connection_string  
PORT=your_port  

---

## 📌 Final Notes

This project was built like a real-world application with focus on:
- Clean code
- Scalable structure
- Backend-driven logic
- Simple and usable UI
