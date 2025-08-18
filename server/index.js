import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { registerRoutes } from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Register API routes
await registerRoutes(app);

// Serve static files from client build directory
const clientPath = path.join(__dirname, '../client/build');
app.use(express.static(clientPath));

// Catch-all handler: send back index.html file for client-side routing
app.get('*', (req, res) => {
  // Only return 404 for API routes that don't exist
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ success: false, message: 'API endpoint not found' });
  } else {
    // For all non-API routes, serve index.html to let Vue Router handle routing
    res.sendFile(path.join(clientPath, 'index.html'));
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`VueTonner Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API available at: http://0.0.0.0:${PORT}/api`);
});