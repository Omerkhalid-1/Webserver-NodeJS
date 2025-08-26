const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');


router.post('/' , authController.handlelogin); 
// according to zod
//router.post('/', validateLogin, handleLogin);


module.exports = router;

