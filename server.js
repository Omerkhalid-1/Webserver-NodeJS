const path = require('path');
const express = require('express');
const PORT = process.env.PORT || 3500;
const app = express();
const redis = require('redis'); 
const RedisClient = redis.createClient();

require('dotenv').config({ quiet: true });
const {logger, logEvents} = require('./middleware/logEvents');
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');
// Import database
const { sequelize, testConnection, syncDatabase } = require('./database/connection');
const { url } = require('inspector');


const DEFAULT_EXPIRATION = 3600; // 1 hour

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
    //console.log(` Request received: ${req.method} ${req.path}`);
    
    logEvents(`${req.method}\t${req.headers.origin || 'undefined'}\t${req.url}`, 'reqLog.txt');
    next();
});

// Built-in middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));

// middle ware for cookies 
app.use(cookieParser());

app.use((req, res, next) => {
    console.log(' Request:', req.method, req.url);
    console.log(' Cookies received:', req.cookies);
    console.log(' Raw cookie header:', req.headers.cookie);
    console.log('-------------------');
    next();
});


app.use(express.static(path.join(__dirname, 'public')));
//app.use(verifyJWT);
// API Routes
app.use('/auth', require('./routes/api/auth'));
app.use('/refresh', require('./routes/api/refresh'));
app.use('/register', require('./routes/api/register'));
// Root routes
app.use('/', require('./routes/root'));

// all routes under this line will use JWT verification

app.use(verifyJWT); // Apply JWT verification middleware to all routes below this point
app.use('/employees', require('./routes/api/employees'));
app.use('/employees', require('./routes/api/logout'));
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