const path = require('path');//??
const express = require('express');
const PORT = process.env.PORT || 3500;
const app = express();


// Middleware
// build in data. to handle urlencoded
app.use(express.json()); // this will convert the json to javascript objects
app.use(express.urlencoded({ extended: false })); // parse the data from URL also make it avaliable in the req.body
app.use('/employees', require('./routes/api/employees'));

app.use('/', require('./routes/root'));
app.use((req, res, next) => {
    logEvents(`${req.method}\t${req.header.origin}\t${req.url}`, 'reqLog.txt');
    console.log(`${req.method} ${req.path}`);
    next();
});

app.use(express.json());  
app.use(express.static(path.join(__dirname, 'public')));



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