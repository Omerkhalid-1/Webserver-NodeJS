const userDB = {
    users: require('../models/user.json'),
    setUsers: function(data) { this.users = data; }
}


const fspromsies = require('fs').promises;
const path = require('path');



const handleLogout =  async (req, res) => {
    // on client, also delete the accessToken
    const cookies = req.cookies;
    

    // Validate user input
    if (!cookies?.jwt)  return res.status(204);
    console.log(cookies.jwt);
    const refreshToken = cookies.jwt;


    // refresh token in db
    const foundUser = userDB.users.find(person => person.refreshToken === refreshToken);
    if(!foundUser) {
        res.clearCokkie('jwt', { httpOnly: true, sameSite: 'None', secure: true });

        return res.status(204)  // forbidden
    }
    
    // delete refreshToken in db
    const otherUsers = userDB.users.filter(person => person.refreshToken !== foundUser.refreshToken);
    const currentPath = {...foundUser, refreshToken: ''};
    userDB.setUsers([...otherUsers, currentuser]);
    await fspromsies.writeFile(
        path.join(__dirname, '..', 'models', 'user.json'),
        JSON.stringify(userDB.users)
    ); 

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    res.status(204).send(); // No Content
    
}


module.exports = { handleLogout }