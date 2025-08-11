const data = {};
data.employees = require('../data/employee.json');

const getAllEmployees = (req, res) => {
    res.json(data.employees);
}

const createNewEmployee = (req, res) => {
    const newEmployee = {
        id: data.employees.length + 1,
        name: req.body.name,
        position: req.body.position,
        department: req.body.department
    };
    data.employees.push(newEmployee);
    res.status(201).json(newEmployee);
}

const updateEmployee = (req, res) => {
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

module.exports = {
    getAllEmployees,
    createNewEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeById
};