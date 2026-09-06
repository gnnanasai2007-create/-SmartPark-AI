const http = require('http');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

dotenv.config();

const { connectDB } = require('./config/db');
const setupSocket = require('./socket/socketHandler');
const seedDatabase = require('./data/seed');

// Routes
const authRoutes = require('./routes/authRoutes');
const slotRoutes = require('./routes/slotRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const server = http.createServer(app);

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Attach io to express app instance for controllers to access
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Setup WebSockets
setupSocket(io);

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date(),
    service: 'SmartPark AI Express Backend'
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  // Connect to DB and seed initial data
  await connectDB();
  await seedDatabase();

  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 SmartPark AI Backend Server running on port ${PORT}`);
    console.log(`📡 WebSocket Socket.IO server ready for live events`);
    console.log(`🌐 API Base: http://localhost:${PORT}/api`);
    console.log(`====================================================`);
  });
}

startServer();
