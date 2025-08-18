const jwt = require('jsonwebtoken');
require('dotenv').config(); 

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.sendStatus(401); // Unauthorized
    console.log(authHeader);// bearer token
    const token = authHeader.split(' ')[1]; // token will be in one position after 'Bearer'
    if (!token) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = decoded; // Save the decoded user info in the request object
        next(); // Call the next middleware or route handler
    });
}

module.exports = verifyJWT;