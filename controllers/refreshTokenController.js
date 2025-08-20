const userDB = {
    users: require('../models/user.json'),
    setUsers: function(data) { this.users = data; }
}


const jwt = require('jsonwebtoken');
require('dotenv').config(); 


const handleRefreshToken =  (req, res) => {
    const cookies = req.cookies;
    

    // Validate user input
    if (!cookies?.jwt)  return res.status(401);
    console.log(cookies.jwt);
    const refreshToken = cookies.jwt;



    const foundUser = userDB.users.find(person => person.refreshToken === refreshToken);
    if(!foundUser) return res.status(403)  // forbidden

    //evaluate jwt 
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if(err || foundUser.username !== decoded.username) return res.status(403); // forbidden

            // if authorize the signin then 
            //JWT token.
            // send the payload
            const accessToken = jwt.sign(
                { "username": decoded.username },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '120s' }
            );

            res.json({ accessToken });
        }
    );
    
}


module.exports = { handleRefreshToken }