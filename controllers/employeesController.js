const { sequelize } = require('../database/connection');
const { DataTypes, Op } = require('sequelize');

// Initialize Employee model with error handling
let Employee;
try {
    const EmployeeModel = require('../models/employee');
    Employee = EmployeeModel(sequelize, DataTypes);
    //console.log(' Employee model loaded successfully in controller');
} catch (error) {
    console.error(' Failed to load Employee model:', error);
    throw error;
}

// Initialize and sync the model
const initializeModel = async () => {
    try {
        await Employee.sync();
        console.log(' Employee model synced in controller');
    } catch (error) {
        console.error(' Employee model sync failed:', error);
    }
};

// Call initialization
initializeModel();

const getAllEmployees = async (req, res) => {
    try {
        if (!Employee) {
            throw new Error('Employee model not initialized');
        }
        
        const employees = await Employee.findAll({
            order: [['id', 'ASC']]
        });
        
        res.json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ 
            message: 'Internal server error',
            error: error.message 
        });
    }
};

const createNewEmployee = async (req, res) => {
    console.log(' createNewEmployee called');
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Content-Type:', req.get('Content-Type'));
    
    const { firstname, lastname, designation, department } = req.body;
    
    // Validate the request
    if (!firstname || !lastname || !designation || !department) {
        console.log(' Validation failed - missing fields');
        return res.status(400).json({ 
            message: 'All fields (firstname, lastname, designation, department) are required' 
        });
    }
    
    console.log('Validation passed');

    try {
        if (!Employee) {
            throw new Error('Employee model not initialized');
        }
        
        // Create new employee
        const newEmployee = await Employee.create({
            firstname: firstname.trim(),
            lastname: lastname.trim(),
            designation: designation.trim(),
            department: department.trim()
        });

        res.status(201).json({
            message: 'Employee added successfully',
            employee: newEmployee
        });

    } catch (error) {
        console.error('Error in createNewEmployee:', error);
        
        // Handle Sequelize validation errors
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                errors: error.errors.map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }

        // Handle unique constraint errors
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                message: 'Employee already exists',
                error: error.message
            });
        }

        res.status(500).json({ 
            message: 'Failed to create employee',
            error: error.message 
        });
    }
};
// to update the employee designation and department. 
const updateEmployee = async (req, res) => {
    try {
        if (!Employee) {
            throw new Error('Employee model not initialized');
        }
        console.log('req.body:', req.body);

        const { id, firstname, lastname, designation, department } = req.body;
        const employeeId = parseInt(id);
        
        if (!employeeId) {// this employee does not exist. 
            return res.status(400).json({ message: 'Valid employee ID is required' });
        }
        if (!firstname || !lastname || !designation || !department) {
            return res.status(400).json({ 
                message: 'All fields (firstname, lastname, designation, department) are required' 
            });
        }
        
        const employee = await Employee.findByPk(employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const updatedEmployee = await employee.update({
            firstname: firstname.trim(),
            lastname: lastname.trim(),
            designation: designation.trim(),
            department: department.trim()
        });

        return res.status(200).json({
            message: 'Employee updated successfully',
            employee: updatedEmployee
            
        });
        
    } catch (error) {
        console.error('Error updating employee:', error);
        
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                errors: error.errors.map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }

        return res.status(500).json({ 
            message: 'Error updating employee',
            error: error.message 
        });
    }
};

const deleteEmployee = async (req, res) => {
    const { id } = req.body;
    
    if (!id) {
        return res.status(400).json({ message: 'Employee ID is required' });
    }
    
    try {
        if (!Employee) {
            throw new Error('Employee model not initialized');
        }
        
        const employee = await Employee.findByPk(parseInt(id));
        
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const deletedEmployeeData = {
            id: employee.id,
            firstname: employee.firstname,
            lastname: employee.lastname,
            designation: employee.designation,
            department: employee.department
        };

        await employee.destroy();
        
        console.log('Deleted employee:', deletedEmployeeData);
        res.json(deletedEmployeeData);
        
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ 
            message: 'Failed to delete employee',
            error: error.message 
        });
    }
};

const getEmployeeById = async (req, res) => {
    try {
        if (!Employee) {
            throw new Error('Employee model not initialized');
        }
        
        if (!req.params.id) {
            return res.status(400).json({ message: 'Employee ID parameter is required' });
        }
        
        console.log('req.params.id:', req.params.id);
        
        const employee = await Employee.findByPk(parseInt(req.params.id));
        
        if (employee) {
            res.json(employee); // response in case of 200
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
        
        // Check if id is an integer
        if (!Number.isInteger(Number(id))) {
            return res.status(500).json({ error: "ID must be an integer" });
        }
        
    } catch (error) {
        console.error('Error fetching employee by ID:', error);
        res.status(500).json({ 
            message: 'Failed to fetch employee', 
            error: error.message 
        });
    }
};

const getEmployeesByDesignation = async (req, res) => {
    const designation = req.params.designation; 
    
    if (!designation) {
        return res.status(400).json({ message: 'Designation parameter is required' });
    }
    
    try {
        if (!Employee) {
            throw new Error('Employee model not initialized');
        }
        
        const employees = await Employee.findAll({
            where: {
                designation: {
                    [Op.iLike]: `%${designation}%`
                }
            },
            order: [['created_at', 'DESC']]
        });
        
        if (employees.length > 0) {
            res.json(employees);
        } else {
            res.status(404).json({ message: 'No employees found with the specified designation' });
        }
        
    } catch (error) {
        console.error('Error fetching employees by designation:', error);
        res.status(500).json({ 
            message: 'Failed to fetch employees by designation',
            error: error.message 
        });
    }
};


// Runs this to modify the employee designation and department
const modifyEmployee = async (req, res) => {
    const { id, designation, department } = req.body;
    
    if (!designation || !department || !id) {
        return res.status(400).json({ message: 'ID, designation and department are required' });
    }

    try {
        if (!Employee) {
            throw new Error('Employee model not initialized');
        }
        
        const employee = await Employee.findByPk(parseInt(id));
        
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        
        const updatedEmployee = await employee.update({
            designation: designation.trim(),
            department: department.trim()
        });
        
        res.json({
            message: 'Employee modified successfully',
            employee: updatedEmployee
        });

    } catch (error) {
        console.error('Error modifying employee:', error);
        
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                errors: error.errors.map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }

        res.status(500).json({ 
            message: 'Failed to modify employee',
            error: error.message 
        });
    }
};

module.exports = {
    getAllEmployees,
    createNewEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeById,
    getEmployeesByDesignation,
    modifyEmployee
};