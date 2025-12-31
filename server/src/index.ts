import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { authRoutes } from './routes/auth.js';
import { workspaceRoutes } from './routes/workspaces.js';
import { taskRoutes } from './routes/tasks.js';
import { expenseRoutes } from './routes/expenses.js';
import { dashboardRoutes } from './routes/dashboard.js';
import { habitRoutes } from './routes/habits.js';
import { reportRoutes } from './routes/reports.js';
import { adminRoutes } from './routes/admin.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Get directory paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL] 
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from public directory (frontend build)
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// API routes must be before the catch-all route
// Root route - serve frontend for non-API routes
app.get('/', (req, res) => {
  // In production, serve the frontend index.html
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(publicPath, 'index.html'));
  } else {
    res.json({ 
      message: 'Task Management API Server',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth',
        workspaces: '/api/workspaces',
        tasks: '/api/tasks',
        expenses: '/api/expenses',
        dashboard: '/api/dashboard',
        habits: '/api/habits',
        reports: '/api/reports'
      },
      docs: 'Access the frontend at http://localhost:5173'
    });
  }
});

// Catch-all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  // Only serve index.html for non-API routes
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(publicPath, 'index.html'));
  } else {
    res.status(404).json({ error: 'Route not found' });
  }
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

