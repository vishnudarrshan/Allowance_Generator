import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // For rich text with images

// Routes
app.use('/api/auth', (await import('./routes/auth.js')).default);
app.use('/api/allowance', (await import('./routes/allowance.js')).default);
app.use('/api/admin', (await import('./routes/admin.js')).default);
app.use('/api/manager', (await import('./routes/manager.js')).default);
app.use('/api/setup', (await import('./routes/firstTime.js')).default);

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Allowance Management System API',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Add this after other route imports in server.js


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});