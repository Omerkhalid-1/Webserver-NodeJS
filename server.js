const path = require('path');
const express = require('express');
const PORT = process.env.PORT || 3500;
const app = express();
const {logger , logEvents} = require('./middleware/logEvents');

// Middleware
app.use(express.json()); // 
app.use(express.static(path.join(__dirname, 'public')));
// build in data. to handle urlencoded
app.use(express.urlencoded({ extended: false }));
app.use('/employees', require('./routes/api/employees'));
app.use('/subdir', require('./routes/subdir'));

app.use('/', require('./routes/root'));
app.use((req, res, next) => {
    logEvents(`${req.method}\t${req.header.origin}\t${req.url}`, 'reqLog.txt');
    console.log(`${req.method} ${req.path}`);
    next();
});

/*
const cors = require('cors');
const whitelist = ['https://www.example.com', 'http://localhost:3500'];
const corsOptions = {
    origin: (origin, callback) => {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200 
};
app.use(cors());

*/

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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));