const userDB = {
    users: require('../models/user.json'),
    setUsers: function(data) { this.users = data; }
}
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
require('dotenv').config(); 
const fspromises = require('fs').promises;

const handlelogin = async (req, res, next) => {
    const { user, pwd } = req.body;

    // Validate user input
    if (!user || !pwd) { return res.status(400).json({ message: 'Username and password are required' });}

    const foundUser = userDB.users.find(person => person.username === user);
    if(!foundUser){ return res.status(401).json({ message: 'Unauthorized' }); } // unauthorized

    //evaluate password 
    const match = await bcrypt.compare(pwd , foundUser.password);
    if (match) {
        // if authorize the signin then 
        //JWT token.
        // send the payload
        const accessToken = jwt.sign(
            { "username": foundUser.username },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '45s' }
        );

        const refreshToken = jwt.sign(
            { "username": foundUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );

        // saving refresh token with current users
        const otherUsers = userDB.users.filter(person => person.username !== foundUser.username);
        const currentUser = { ...foundUser, refreshToken }; 
        userDB.setUsers([...otherUsers, currentUser]);
        await fspromises.writeFile(
            path.join(__dirname, '..', 'models', 'user.json'),
            JSON.stringify(userDB.users)
        );
        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            secure: true, // set to true if using https
            sameSite: 'None' // set to 'None' if using cross-site cookies
        });


        res.json({ acessToken });

    } else {
        res.status(401);  
    } 
}


module.exports = { handlelogin };