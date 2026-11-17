# 🎓 CampusConnect AI

### Connecting Students. Sharing Skills. Building Together.

CampusConnect AI is a student collaboration and networking platform designed to connect students across different colleges and universities. It helps students discover like-minded people, exchange skills, collaborate on projects, ask questions, and build meaningful academic connections.

The platform aims to make collaboration easier by bringing students together in one digital community.

## 🌟 Key Features

- **Student Authentication** – Secure student registration and login.
- **Student Profiles** – Create profiles with academic details, skills, interests, and profile information.
- **Community** – Share posts, ideas, and interact with other students.
- **Project Collaboration** – Discover projects and collaborate with other students.
- **Skill Exchange** – Connect with students to share and learn different skills.
- **Help & Doubts** – Ask questions and help fellow students.
- **AI Team Matcher** – Skill- and interest-based matching logic to help students discover potential teammates.
- **Real-Time Messaging** – Communicate with other students using Socket.IO.
- **Notifications** – Stay updated with platform activities.
- **Admin & Reports** – Supporting modules for administration and content reporting.

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Socket.IO Client
- Lucide React

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- bcryptjs
- Socket.IO
- Multer

### Deployment
- Render – Frontend and Backend Hosting
- MongoDB Atlas – Cloud Database

## 🏗️ Project Structure

text
CampusConnect-AI/
│
├── client/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
└── README.md


## 🚀 Getting Started

Follow these steps to run CampusConnect AI locally.

### 1. Clone the Repository


git clone https://github.com/Simar-dev502/Campusconnect-AI.git

cd Campusconnect-AI

### 2. Setup Backend


cd server
npm install


Create a `.env` file inside the `server` folder:

.env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=https://campusconnect-frontend-7m5k.onrender.com


Start the backend:
npm run
