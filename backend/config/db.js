const mongoose = require('mongoose');

let isMongoConnected = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartpark_ai';
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2000,
    });
    isMongoConnected = true;
    console.log(`[SmartPark DB] MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (err) {
    isMongoConnected = false;
    console.log(`[SmartPark DB] MongoDB not detected (${err.message}).`);
    console.log(`[SmartPark DB] Automatically activating high-performance embedded JSON database store.`);
  }
};

const getMongoStatus = () => isMongoConnected;

module.exports = { connectDB, getMongoStatus };
