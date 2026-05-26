const dns      = require('dns');
const mongoose = require('mongoose');

// Override system DNS with Google + Cloudflare public resolvers so that
// MongoDB Atlas SRV records can be looked up even when the local DNS
// refuses SRV queries (common in sandboxed / corporate environments).
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS:          45000,
            family:                   4,       // force IPv4
        });
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;