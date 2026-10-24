require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDatabase = require('./src/config/database');
const userRoutes = require('./src/routes/userRoutes');
const taskRoutes = require('./src/routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' }
}));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Task Management API is running.',
    endpoints: {
      health: '/api/health',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      tasks: '/api/tasks'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    database: require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.use('/api/auth', userRoutes);
app.use('/api/tasks', taskRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  console.error(`[${new Date().toISOString()}]`, err.message);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: status === 500 ? 'Internal server error.' : err.message
  });
});

if (require.main === module) {
  connectDatabase()
    .then(() => {
      app.listen(PORT, () => console.log(`Task Management API listening on port ${PORT}`));
    })
    .catch((error) => {
      console.error('Could not start server:', error.message);
      process.exit(1);
    });
}

module.exports = app;
