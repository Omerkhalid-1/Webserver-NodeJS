const http = require('http');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');
const EventEmitter = require('events');

const PORT = process.env.PORT || 3500;
const logEvents = require('./logEvents'); 
class Emitter extends EventEmitter {}
const myEmitter = new Emitter();

// myEmitter.on('log', (msg) => logEvents(msg));

const server = http.createServer(async (req, res) => {
    console.log(req.url, req.method);

    let path;

    if (req.url === '/' || req.url === '/index.html') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        path = path.join(__dirname, 'views', 'index.html');
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                res.statusCode = 500;
                res.end('Server Error');
            } else {
                res.end(data);
            }
        });
    
    }
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
