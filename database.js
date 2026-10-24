const mongoose = require('mongoose');

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('YOUR_DB_USERNAME') || uri.includes('<username>')) {
    throw new Error('Set a valid MONGODB_URI in your local .env file before starting the server.');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000
  });
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
  return mongoose.connection;
}

module.exports = connectDatabase;
