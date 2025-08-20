const express = require('express');
const router = express.Router();
const employeesController = require('../../controllers/employeesController');

//app.use(verifyJWT);

// Main route for employees
router.route('/')
    //.get(verifyJWT, employeesController.getAllEmployees)
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