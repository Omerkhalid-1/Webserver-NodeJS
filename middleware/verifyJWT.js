const jwt = require('jsonwebtoken');
require('dotenv').config({debug: false}); 

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const cookieToken = req.cookies?.jwt;
    
    console.log(' Checking for JWT token...');
    console.log(' Authorization header:', authHeader);
    console.log(' Cookie JWT:', cookieToken ? 'Present' : 'Not found');
    
    let token;
    
    // Check Authorization header first (Bearer token)
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
        console.log(' Using token from Authorization header');
    } 
    // Fallback to cookie
    else if (cookieToken) {
        token = cookieToken;
        console.log(' Using token from cookie');
    } 
    // No token found
    else {
        console.log(' No token found in Authorization header or cookies');
        return res.sendStatus(401); // Unauthorized
    }

    console.log('Token found, verifying...');
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            console.log(' Token verification failed:', err.message);
            return res.sendStatus(403); // Forbidden
        }
        
        console.log(' Token verified for user:', decoded.username);
        req.user = decoded; // Save the decoded user info in the request object
        next(); // Call the next middleware or route handler
    });
}

module.exports = verifyJWT;