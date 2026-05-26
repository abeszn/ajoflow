const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

connectDB();

const app = express();

// CORS — allow the Vite dev server and same-origin requests
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000',
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error('CORS: origin not allowed'));
    },
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check (used by Railway / uptime monitors)
app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));

// API routes
app.use('/api/auth',          require('./routes/authRoutes'));
app.use('/api/groups',        require('./routes/groupRoutes'));
app.use('/api/contributions', require('./routes/contributionRoutes'));
app.use('/api/dashboard',     require('./routes/dashboardRoutes'));

// Serve built React frontend in production (localhost:5000 serves everything)
if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, '../frontend/dist');
    app.use(express.static(distPath));
    app.get('/{*path}', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
} else {
    app.get('/', (req, res) => res.json({ message: 'Ajo API is running in development mode' }));
}

// 404 + centralized error handler (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Ajo server running on http://localhost:${PORT}`);
    console.log(`   Mode: ${process.env.NODE_ENV || 'development'}\n`);
});

require('./utils/cronJobs');
