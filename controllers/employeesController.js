const data = {};
data.employees = require('../data/employee.json');
const fs = require('fs');
const path = require('path');

const getAllEmployees = (req, res) => {
    res.json(data.employees);
}

const createNewEmployee = (req, res) => {
    const newEmployee = {
        id: data.employees.length + 1,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        department: req.body.department,
        designation: req.body.designation || 'Not specified'
    };
    try {
        const filePath = path.join(__dirname, '../data/employee.json'); 
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
        res.status(201).json(newEmployee);
      } catch (error) {
        console.error('Error writing to file:', error);
        res.status(500).json({ message: 'Error saving employee data' });
      }
    res.status(201).json(newEmployee);
}


const updateEmployee = (req, res) => {
    
    console.log('req.body:', req.body);
    console.log('req.headers:', req.headers);
    console.log('Content-Type:', req.get('Content-Type'));
    const { id } = req.body;
    const employee = data.employees.find(emp => emp.id === id);
    if (employee) {
      employee.name = req.body.name || employee.name;
      employee.position = req.body.position || employee.position;
      employee.department = req.body.department || employee.department;
      employee.designation = req.body.designation || employee.designation; 
      console.log(employee.id);
      
      res.json(employee);
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  }

const deleteEmployee = (req, res) => {
    const { id } = req.body;
    const index = data.employees.findIndex(emp => emp.id === id);
    if (index !== -1) {
        const deletedEmployee = data.employees.splice(index, 1);
        res.json(deletedEmployee);
    } else {
        res.status(404).json({ message: 'Employee not found' });
    }
}

const getEmployeeById = (req, res) => {
    const employee = data.employees.find(emp => emp.id === parseInt(req.params.id));
    if (employee) {
        res.json(employee);
    } else {
        res.status(404).json({ message: 'Employee not found' });
    }
}

const getEmployeesByDesignation = (req, res) => {
    const deignation = req.params.designation; 
    if (!deignation) {
        return res.status(400).json({ message: 'Designation parameter is required' });
    }
    const employees = data.employees.filter(emp => emp.designation.toLowerCase() === deignation.toLowerCase());
    if (employees.length > 0) {
        res.json(employees);
    } else {
        res.status(404).json({ message: 'No employees found with the specified designation' });
    }
}

module.exports = {
    getAllEmployees,
    createNewEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeById,
    getEmployeesByDesignation
};