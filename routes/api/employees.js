const express = require('express');
const router = express.Router();
const employeesController = require('../../controllers/employeesController');

const verifyJWT = require('../../middleware/verifyJWT');
// Debug middleware for this route
router.use((req, res, next) => {
    console.log(`Employee route hit: ${req.method} ${req.path}`);
    next();
});

router.get('/test', (req, res) => {
    console.log(' Test route hit!');
    res.json({ message: 'Test route working!' });
});

// Main route for employees
router.route('/')
    .get(employeesController.getAllEmployees)
    .post(employeesController.createNewEmployee)
    .put(employeesController.updateEmployee)
    .delete(employeesController.deleteEmployee)
    .patch(employeesController.modifyEmployee);

// Route for getting employees by designation
router.route('/designation/:designation')
    .get(employeesController.getEmployeesByDesignation);

// Route for getting employee by ID 
router.route('/:id')
    .get(employeesController.getEmployeeById);

module.exports = router;