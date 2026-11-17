
const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

require('dotenv').config();

const connectDB = require('./config/db');
const User = require('./models/User');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const skillRoutes = require('./routes/skillRoutes');
const projectRoutes = require('./routes/projectRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const helpRoutes = require('./routes/helpRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const server = http.createServer(app);

const allowedOrigin = process.env.CLIENT_URL ||
  (process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173');

app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));

app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  dotfiles: 'deny',
  index: false,
  maxAge: '7d'
}));

const clientIndex = path.join(__dirname, '..', 'client', 'dist', 'index.html');

// API routes
app.get('/', (req, res) => {
  if (require('fs').existsSync(clientIndex)) {
    return res.sendFile(clientIndex);
  }
  return res.json({
    success: true,
    message: 'CampusConnect AI Backend is running!'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    project: 'CampusConnect AI',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/help', helpRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found.'
  });
});

app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  return res.sendFile(clientIndex, (error) => {
    if (error) next(error);
  });
});

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Authenticate socket connection using JWT
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error('Authentication required.'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return next(new Error('User not authorized.'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Invalid or expired token.'));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user._id}`);

  // Join personal notification/message room
  socket.join(`user:${socket.user._id}`);

  // Join a conversation after checking membership
  socket.on('join_conversation', async (conversationId, callback) => {
    try {
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: socket.user._id
      });

      if (!conversation) {
        if (typeof callback === 'function') {
          callback({
            success: false,
            message: 'Conversation not found or access denied.'
          });
        }
        return;
      }

      socket.join(`conversation:${conversationId}`);

      if (typeof callback === 'function') {
        callback({ success: true });
      }
    } catch (error) {
      if (typeof callback === 'function') {
        callback({ success: false, message: 'Could not join conversation.' });
      }
    }
  });

  // Send a real-time message
  socket.on('send_message', async (data, callback) => {
    try {
      const { conversationId, content } = data || {};

      if (!conversationId || !content || !content.trim()) {
        if (typeof callback === 'function') {
          callback({
            success: false,
            message: 'Conversation and message content are required.'
          });
        }
        return;
      }

      const room = `conversation:${conversationId}`;

      if (!socket.rooms.has(room)) {
        if (typeof callback === 'function') {
          callback({
            success: false,
            message: 'Join the conversation before sending a message.'
          });
        }
        return;
      }

      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: socket.user._id
      });

      if (!conversation) {
        if (typeof callback === 'function') {
          callback({
            success: false,
            message: 'Conversation access denied.'
          });
        }
        return;
      }

      const message = await Message.create({
        conversation: conversation._id,
        sender: socket.user._id,
        content: content.trim(),
        readBy: [socket.user._id]
      });

      conversation.lastMessage = message._id;
      await conversation.save();

      await message.populate('sender', 'name profilePhoto');

      io.to(room).emit('new_message', message);

      if (typeof callback === 'function') {
        callback({
          success: true,
          message
        });
      }
    } catch (error) {
      if (typeof callback === 'function') {
        callback({
          success: false,
          message: 'Message could not be sent.'
        });
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user._id}`);
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`CampusConnect AI server running on port ${PORT}`);
      console.log('Socket.IO real-time messaging is ready!');
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();
