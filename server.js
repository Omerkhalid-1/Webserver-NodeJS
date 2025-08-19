const path = require('path');
const express = require('express');
const PORT = process.env.PORT || 3500;
const app = express();
require('dotenv').config();
const {logger, logEvents} = require('./middleware/logEvents');
const verifyJWT = require('./middleware/verifyJWT');

// Import database
const { sequelize, testConnection, syncDatabase } = require('./database/connection');

// Initialize database connection
const initializeDatabase = async () => {
    try {
        await testConnection();
        await syncDatabase();
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }
};

// Health check 
app.get('/health', async (req, res) => {
    try {
        // Test database connection 
        // query select 
        // selete to get tables. 
        // 1- connection 
        // 2- database 
        await sequelize.authenticate();
        res.json({ 
            status: 'OK', 
            database: 'Connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'Error', 
            database: 'Disconnected',
            error: error.message 
        });
    }
});

// Custom logging middleware (should be before other routes)


app.use((req, res, next) => {
    console.log(` Request received: ${req.method} ${req.path}`);
    
    logEvents(`${req.method}\t${req.headers.origin || 'undefined'}\t${req.url}`, 'reqLog.txt');
    next();
});

// Built-in middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/auth', require('./routes/api/auth'));
app.use('/employees', require('./routes/api/employees'));
app.use('/register', require('./routes/api/register'));

// Root routes
app.use('/', require('./routes/root'));

/*
// Main routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Redirect routes
app.get('/old-page', (req, res) => {
    res.redirect(301, '/new-page.html');
});

// New page
app.get('/new-page', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'new-page.html'));
});

app.get('/new-page.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'new-page.html'));
});

*/
// 404 handler
app.all('/{*any}', (req, res, next) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ error: "404 Not Found" });
    } else {
        res.type('txt').send("404 Not Found");
    }
});

// Start server
const startServer = async () => {
    await initializeDatabase();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

module.exports = app;

// Only start server if this file is run directly (not imported for testing)
if (require.main === module) {
  const startServer = async () => {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  };

  startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}