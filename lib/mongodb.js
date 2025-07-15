const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('⚠️ Please define the MONGODB_URI environment variable in .env.local');
}

let cached = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

async function connectMongo() {
  if (cached.conn) {
    console.log('Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('Establishing new MongoDB connection');
    cached.promise = mongoose
      .connect(MONGODB_URI) // ✅ Removed deprecated options
      .then((conn) => {
        console.log('MongoDB connected successfully');
        return conn;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error.message);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    throw error;
  }
}

module.exports = connectMongo;
