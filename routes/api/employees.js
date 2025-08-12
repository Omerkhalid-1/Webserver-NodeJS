const express = require('express');
const router = express.Router();
const path = require('path');
const employeesController = require('../../controllers/employeesController');
const { create } = require('domain');
const data = {}

data.employees = require('../../data/employee.json');

router.route('/')
    .get(employeesController.getAllEmployees)
    .post(employeesController.createNewEmployee)
    .put(employeesController.updateEmployee)
    .delete(employeesController.deleteEmployee)
    .patch(employeesController.modifyEmployee);
    
    router.route('/:id')
    .get(employeesController.getEmployeeById)
    .get(employeesController.getEmployeesByDesignation);

module.exports = router;