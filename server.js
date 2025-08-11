const path = require('path');
const express = require('express');
const PORT = process.env.PORT || 3500;
const app = express();

// Middleware
app.use(express.json()); // 
app.use(express.static(path.join(__dirname, 'public')));
// build in data. to handle urlencoded
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});


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

app.get('/old-page.html', (req, res) => {
    res.redirect(301, '/new-page.html');
});

// Middleware functions for chaining
const one = (req, res, next) => {
    console.log('one');
    next();
}

const two = (req, res, next) => {
    console.log('two');
    next();
}

const three = (req, res) => {
    console.log('three');
    res.send('Finished!');
}


app.get('/chain.html', [one, two, three]);



// New page
app.get('/new-page', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'new-page.html'));
});

app.get('/new-page.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'new-page.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));