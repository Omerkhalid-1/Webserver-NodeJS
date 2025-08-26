const { sequelize } = require('../database/connection');
const { DataTypes, Op } = require('sequelize');
const { z } = require("zod");

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

// Zod schemas for validation with user-friendly error messages
const employeeSchema = z.object({
    firstname: z.string()
        .min(1, "Please enter the employee's first name")
        .max(50, "First name cannot be longer than 50 characters")
        .regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, hyphens, and apostrophes"),
    lastname: z.string()
        .min(1, "Please enter the employee's last name")
        .max(50, "Last name cannot be longer than 50 characters")
        .regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes"),
    designation: z.string()
        .min(1, "Please specify the employee's job title or position")
        .max(100, "Job title cannot be longer than 100 characters")
        .trim(),
    department: z.string()
        .min(1, "Please specify which department the employee belongs to")
        .max(100, "Department name cannot be longer than 100 characters")
        .trim(),
});

const updateEmployeeSchema = employeeSchema.extend({
    id: z.number({
        required_error: "Employee ID is required to update an employee",
        invalid_type_error: "Employee ID must be a valid number"
    }).int("Employee ID must be a whole number").positive("Employee ID must be greater than 0"),
});

// Validation functions with user-friendly error formatting
const validateCreateEmployeeData = (data) => {
    try {
        const validatedData = employeeSchema.parse(data);
        return { success: true, data: validatedData };
    } catch (err) {
        console.log('Validation error details:', err);
        
        // Handle case where data is null/undefined
        if (!data || typeof data !== 'object') {
            return {
                success: false,
                message: "Please provide employee information in the request body",
                errors: [{
                    field: "request_body",
                    message: "Request body is missing or invalid",
                    value: data || "not provided"
                }]
            };
        }

        // Handle Zod validation errors
        if (err.errors && Array.isArray(err.errors)) {
            return {
                success: false,
                message: "Please fix the following issues with the employee information:",
                errors: err.errors.map(e => ({
                    field: e.path && e.path.length > 0 ? e.path[0] : "unknown_field",
                    message: e.message || "Invalid value provided",
                    value: (e.path && e.path.length > 0 && data[e.path[0]]) || "not provided"
                })),
            };
        }

        // Handle unexpected error format
        return {
            success: false,
            message: "There was an issue validating the employee information",
            errors: [{
                field: "validation",
                message: "Please check that all required fields (firstname, lastname, designation, department) are provided",
                value: "validation_error"
            }]
        };
    }
};

const validateUpdateEmployeeData = (data) => {
    try {
        const validatedData = updateEmployeeSchema.parse(data);
        return { success: true, data: validatedData };
    } catch (err) {
        console.log('Update validation error details:', err);
        
        // Handle case where data is null/undefined
        if (!data || typeof data !== 'object') {
            return {
                success: false,
                message: "Please provide employee information in the request body",
                errors: [{
                    field: "request_body",
                    message: "Request body is missing or invalid",
                    value: data || "not provided"
                }]
            };
        }

        // Handle Zod validation errors
        if (err.errors && Array.isArray(err.errors)) {
            return {
                success: false,
                message: "Please fix the following issues to update the employee:",
                errors: err.errors.map(e => ({
                    field: e.path && e.path.length > 0 ? e.path[0] : "unknown_field",
                    message: e.message || "Invalid value provided",
                    value: (e.path && e.path.length > 0 && data[e.path[0]]) || "not provided"
                })),
            };
        }

        // Handle unexpected error format
        return {
            success: false,
            message: "There was an issue validating the employee update information",
            errors: [{
                field: "validation",
                message: "Please check that all required fields (id, firstname, lastname, designation, department) are provided",
                value: "validation_error"
            }]
        };
    }
};

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
        
        res.json({
            success: true,
            message: `Retrieved ${employees.length} employee(s) from the system`,
            count: employees.length,
            employees: employees
        });
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ 
            success: false,
            message: 'We encountered an issue while retrieving employee data. Please try again or contact support if the problem persists.',
            error: 'Internal server error'
        });
    }
};

const createNewEmployee = async (req, res) => {
    try {
        // Log the incoming request for debugging
        console.log('Request body received:', req.body);
        console.log('Request body type:', typeof req.body);
        
        // Validate request data
        const validation = validateCreateEmployeeData(req.body);
        if (!validation.success) {
            console.log('Validation failed:', validation);
            return res.status(400).json({
                success: false,
                message: validation.message,
                errors: validation.errors,
                requestReceived: req.body // Help debug what was actually sent
            });
        }

        const { firstname, lastname, designation, department } = validation.data;

        const newEmployee = await Employee.create({
            firstname: firstname.trim(),
            lastname: lastname.trim(),
            designation: designation.trim(),
            department: department.trim(),
        });

        res.status(201).json({
            success: true,
            message: `Successfully added ${firstname} ${lastname} to the system`,
            employee: newEmployee,
        });

    } catch (error) {
        console.error('Error in createNewEmployee:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);

        // Handle different types of database errors
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'The employee information provided has some issues:',
                errors: error.errors ? error.errors.map(err => ({
                    field: err.path || 'unknown',
                    message: `${err.path || 'Field'}: ${err.message || 'Invalid value'}`,
                })) : [{
                    field: 'database',
                    message: 'Database validation failed'
                }],
            });
        }

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                success: false,
                message: 'An employee with this information already exists in the system',
                error: 'Duplicate employee record'
            });
        }

        if (error.name === 'SequelizeDatabaseError') {
            return res.status(500).json({
                success: false,
                message: 'There was a database connection issue. Please try again in a moment.',
                error: 'Database connection error'
            });
        }

        // Generic server error
        res.status(500).json({
            success: false,
            message: 'We encountered an unexpected issue while adding the employee. Please try again or contact support if the problem persists.',
            error: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
};

const updateEmployee = async (req, res) => {
    try {
        if (!Employee) {
            throw new Error('Employee model not initialized');
        }

        // Validate request data
        const validation = validateUpdateEmployeeData(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: validation.message,
                errors: validation.errors,
            });
        }

        console.log('req.body:', req.body);

        const { id, firstname, lastname, designation, department } = validation.data;
        
        const employee = await Employee.findByPk(id);
        if (!employee) {
            return res.status(404).json({ 
                success: false,
                message: `No employee found with ID ${id}. Please check the employee ID and try again.`,
                error: 'Employee not found'
            });
        }

        const updatedEmployee = await employee.update({
            firstname: firstname.trim(),
            lastname: lastname.trim(),
            designation: designation.trim(),
            department: department.trim()
        });

        return res.status(200).json({
            success: true,
            message: `Successfully updated ${updatedEmployee.firstname} ${updatedEmployee.lastname}'s information`,
            employee: updatedEmployee
        });
        
    } catch (error) {
        console.error('Error updating employee:', error);
        
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'The updated employee information has some issues:',
                errors: error.errors.map(err => ({
                    field: err.path,
                    message: `${err.path}: ${err.message}`
                }))
            });
        }

        return res.status(500).json({ 
            success: false,
            message: 'We encountered an issue while updating the employee information. Please try again or contact support if the problem persists.',
            error: 'Internal server error'
        });
    }
};

const deleteEmployee = async (req, res) => {
    const { id } = req.body;
    
    if (!id) {
        return res.status(400).json({ 
            success: false,
            message: 'Please provide the employee ID to delete an employee',
            error: 'Missing employee ID'
        });
    }
    
    try {
        if (!Employee) {
            throw new Error('Employee model not initialized');
        }
        
        const employeeId = parseInt(id);
        if (!Number.isInteger(employeeId) || employeeId <= 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Please provide a valid employee ID (must be a positive number)',
                error: 'Invalid employee ID format'
            });
        }
        
        const employee = await Employee.findByPk(employeeId);
        
        if (!employee) {
            return res.status(404).json({ 
                success: false,
                message: `No employee found with ID ${employeeId}. The employee may have already been deleted or the ID is incorrect.`,
                error: 'Employee not found'
            });
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
        res.json({
            success: true,
            message: `Successfully deleted ${deletedEmployeeData.firstname} ${deletedEmployeeData.lastname} from the system`,
            deletedEmployee: deletedEmployeeData
        });
        
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ 
            success: false,
            message: 'We encountered an issue while deleting the employee. Please try again or contact support if the problem persists.',
            error: 'Internal server error'
        });
    }
};

const getEmployeeById = async (req, res) => {
    try {
        if (!Employee) {
            throw new Error('Employee model not initialized');
        }
        
        if (!req.params.id) {
            return res.status(400).json({ 
                success: false,
                message: 'Please provide an employee ID in the URL (e.g., /employees/123)',
                error: 'Missing employee ID'
            });
        }
        
        console.log('req.params.id:', req.params.id);
        
        // Validate that ID is an integer
        const employeeId = parseInt(req.params.id);
        if (!Number.isInteger(employeeId) || employeeId <= 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Please provide a valid employee ID (must be a positive number)',
                error: 'Invalid employee ID format'
            });
        }
        
        const employee = await Employee.findByPk(employeeId);
        
        if (employee) {
            res.json({
                success: true,
                message: `Found employee: ${employee.firstname} ${employee.lastname}`,
                employee: employee
            });
        } else {
            res.status(404).json({ 
                success: false,
                message: `No employee found with ID ${employeeId}. Please check the ID and try again.`,
                error: 'Employee not found'
            });
        }
        
    } catch (error) {
        console.error('Error fetching employee by ID:', error);
        res.status(500).json({ 
            success: false,
            message: 'We encountered an issue while searching for the employee. Please try again or contact support if the problem persists.',
            error: 'Internal server error'
        });
    }
};

const getEmployeesByDesignation = async (req, res) => {
    const designation = req.params.designation; 
    
    if (!designation || designation.trim() === '') {
        return res.status(400).json({ 
            success: false,
            message: 'Please provide a job title/designation to search for (e.g., /employees/designation/manager)',
            error: 'Missing designation parameter'
        });
    }
    
    try {
        if (!Employee) {
            throw new Error('Employee model not initialized');
        }
        
        const employees = await Employee.findAll({
            where: {
                designation: {
                    [Op.iLike]: `%${designation.trim()}%`
                }
            },
            order: [['created_at', 'DESC']]
        });
        
        if (employees.length > 0) {
            res.json({
                success: true,
                message: `Found ${employees.length} employee(s) with designation containing "${designation}"`,
                count: employees.length,
                employees: employees
            });
        } else {
            res.status(404).json({ 
                success: false,
                message: `No employees found with designation containing "${designation}". Try searching with different keywords or check the spelling.`,
                error: 'No employees found'
            });
        }
        
    } catch (error) {
        console.error('Error fetching employees by designation:', error);
        res.status(500).json({ 
            success: false,
            message: 'We encountered an issue while searching for employees. Please try again or contact support if the problem persists.',
            error: 'Internal server error'
        });
    }
};

// Runs this to modify the employee designation and department
const modifyEmployee = async (req, res) => {
    const { id, designation, department } = req.body;
    
    // Validate required fields
    const missingFields = [];
    if (!id) missingFields.push('Employee ID');
    if (!designation || designation.trim() === '') missingFields.push('Designation');
    if (!department || department.trim() === '') missingFields.push('Department');
    
    if (missingFields.length > 0) {
        return res.status(400).json({ 
            success: false,
            message: `Please provide the following required information: ${missingFields.join(', ')}`,
            error: 'Missing required fields'
        });
    }

    try {
        if (!Employee) {
            throw new Error('Employee model not initialized');
        }
        
        const employeeId = parseInt(id);
        if (!Number.isInteger(employeeId) || employeeId <= 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Please provide a valid employee ID (must be a positive number)',
                error: 'Invalid employee ID format'
            });
        }
        
        const employee = await Employee.findByPk(employeeId);
        
        if (!employee) {
            return res.status(404).json({ 
                success: false,
                message: `No employee found with ID ${employeeId}. Please check the employee ID and try again.`,
                error: 'Employee not found'
            });
        }
        
        const updatedEmployee = await employee.update({
            designation: designation.trim(),
            department: department.trim()
        });
        
        res.json({
            success: true,
            message: `Successfully updated ${updatedEmployee.firstname} ${updatedEmployee.lastname}'s job information`,
            changes: {
                designation: updatedEmployee.designation,
                department: updatedEmployee.department
            },
            employee: updatedEmployee
        });

    } catch (error) {
        console.error('Error modifying employee:', error);
        
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'The employee information provided has some issues:',
                errors: error.errors.map(err => ({
                    field: err.path,
                    message: `${err.path}: ${err.message}`
                }))
            });
        }

        res.status(500).json({ 
            success: false,
            message: 'We encountered an issue while updating the employee information. Please try again or contact support if the problem persists.',
            error: 'Internal server error'
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