const express = require('express');
const router = express.Router();
const path = require('path');

const data = {}

data.employees = require('../../data/employee.json');

router.route('/')
    .get((req, res) => {
        res.json(data.employees);
    })
    .post((req, res) => {
        const newEmployee = {
            id: data.employees.length + 1,
            name: req.body.name,
            position: req.body.position,
            department: req.body.department
        };
        data.employees.push(newEmployee);
        res.status(201).json(newEmployee);
    })
    .put((req, res) => {
        const { id } = req.body;
        const employee = data.employees.find(emp => emp.id === id);
        if (employee) {
            employee.name = req.body.name || employee.name;
            employee.position = req.body.position || employee.position;
            employee.department = req.body.department || employee.department;
            res.json(employee);
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
    })
    .delete((req, res) => {
        const { id } = req.body;
        const index = data.employees.findIndex(emp => emp.id === id);
        if (index !== -1) {
            const deletedEmployee = data.employees.splice(index, 1);
            res.json(deletedEmployee);
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
    });

    router.route('/:id')
    .get((req, res) => {
        const employee = data.employees.find(emp => emp.id === parseInt(req.params.id));
        if (employee) {
            res.json(employee);
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
    })


module.exports = router;