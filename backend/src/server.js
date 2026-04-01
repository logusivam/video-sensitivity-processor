import dns from 'node:dns';
// Force Node 24 to resolve DNS using IPv4 to bypass the ECONNREFUSED error
dns.setDefaultResultOrder('ipv4first');
import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';
 
const PORT = process.env.PORT || 5000;

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.io attached to the HTTP server
initSocket(server);

// Start server only after DB connects
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
});

// Handle unhandled promise rejections (e.g., bad DB credentials) gracefully
process.on('unhandledRejection', (err) => {
    console.error(`💥 Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
});