const userDB = {
    users: require('../models/user.json'),
    setUsers: function(data) { this.users = data; }
}
const fspromises = require('fs').promises;
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const handleLogout = async (req, res) => {
    const cookies = req.cookies;
    console.log(' Logout request received');
    
    // Clear cookie regardless of what happens below
    res.clearCookie('jwt', { 
        httpOnly: true, 
        sameSite: 'Lax',
        secure: false 
    });
    
    // If no JWT cookie, just return success
    if (!cookies?.jwt) {
        console.log(' No JWT cookie found, but clearing anyway');
        return res.sendStatus(204);
    }
    
    try {
        // Decode the access token to get username (don't verify, just decode)
        const decoded = jwt.decode(cookies.jwt);
        
        if (decoded && decoded.username) {
            console.log(' Clearing refresh token for user:', decoded.username);
            
            // Find user and clear their refresh token
            const foundUser = userDB.users.find(person => person.username === decoded.username);
            
            if (foundUser) {
                // Clear refresh token from database
                const otherUsers = userDB.users.filter(person => person.username !== foundUser.username);
                const updatedUser = { ...foundUser, refreshToken: '' };
                userDB.setUsers([...otherUsers, updatedUser]);
                
                await fspromises.writeFile(
                    path.join(__dirname, '..', 'models', 'user.json'),
                    JSON.stringify(userDB.users)
                );
                
                console.log(' Refresh token cleared from database');
            }
        }
    } catch (error) {
        console.log(' Could not decode token, but cookie cleared:', error.message);
    }
    
    console.log(' Logout successful');
    return res.sendStatus(204);
}

module.exports = { handleLogout };