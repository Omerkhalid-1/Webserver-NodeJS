const usersDB = {
    users: require('../models/user.json'),
    setUsers: function(data) {
        this.users = data;
    }
}

const fsPromises = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');

const handleNewUser = async (req, res, next) => {
    const { user, pwd } = req.body;

    // Validate user input
    if (!user || !pwd) { return res.status(400).json({ message: 'Username and password are required' });}

    // Check for duplicate usernames
    const duplicate = usersDB.users.find(person => person.username === user);
    if (duplicate) {return res.status(409).json({ message: 'Username already exists' });}// conflict

    try {
        // Hash the password
        const hashedPwd = await bcrypt.hash(pwd, 10); // hash the pasword and add the salt to it. 

        // store new user object
        const newUser = { username: user, password: hashedPwd };
        usersDB.setUsers([...usersDB.users, newUser]);
        await fsPromises.writeFile(path.join(__dirname, '..', 'models', 'user.json'), JSON.stringify(usersDB.users));
        console.log(usersDB.users);
        res.status(201).json({ message: `New user ${user} created successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': err.message });
    }
}

module.exports = { handleNewUser };


