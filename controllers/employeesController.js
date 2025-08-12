const data = {};
data.employees = require('../data/employee.json');

const getAllEmployees = (req, res) => {
    res.json(data.employees);
}

const fs = require('fs').promises;
const path = require('path');

// Read data from file function
const readDataFromFile = async () => {
  try {
    const filePath = path.join(__dirname, '../data/employee.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    //console.log('Data read from file:', data);
    return data;
  } catch (error) {
    console.error('Error reading file:', error);
    return { employees: [] };
  }
};

const writeDataToFile = async (data) => {
  try {
    const jsonData = JSON.stringify(data, null, 2); // Pretty formatted JSON
    await fs.writeFile(path.join(__dirname, '../data/employee.json'), jsonData, 'utf8');
  } catch (error) {
    console.error('Error writing to file:', error);
    throw error; 
  }
};

// Create employee function
const createNewEmployee = async (req, res) => {
  const { firstname, lastname, designation, department } = req.body;
    // Validate the request.
    if (!firstname || !lastname || !designation || !department) {
      return res.status(400).json({ 
        message: 'All fields (firstname, lastname, designation, department) are required' 
      });
    }


  try {
    // Get data from file
    const data = await readDataFromFile();
    
    // employees array exists
    if (!data.employees) {
      data.employees = [];
    }
    
    // Create new employee
    const newEmployee = {
      id: data.employees.length + 1,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      designation: req.body.designation,
      department: req.body.department
    };
    
    // Add to employee array
    data.employees.push(newEmployee);
    
    // Save back to file
    const filePath = path.join(__dirname, '../data/employee.json');
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    
    // Send response
    res.status(201).json({
      message: 'Employee added successfully',
      employee: newEmployee
    });
    
  } catch (error) {
    console.error('Error in createNewEmployee:', error);
    res.status(500).json({ 
      message: 'Failed to create employee',
      error: error.message 
    });
  }
};
 

const updateEmployee = async (req, res) => {
  try {
    console.log('req.body:', req.body);
    console.log('req.headers:', req.headers);
    console.log('Content-Type:', req.get('Content-Type'));
    
    // Get fresh data from file
    const data = await readDataFromFile();
    
    // Ensure employees array exists
    if (!data.employees || !Array.isArray(data.employees)) {
      return res.status(500).json({ message: 'Invalid data structure' });
    }
    
    // Get ID from request body and convert to number
    const { id } = req.body;
    const employeeId = parseInt(id);
    
    if (!employeeId) {
      return res.status(400).json({ message: 'Valid employee ID is required' });
    }
    
    // Find employee by ID
    const employee = data.employees.find(emp => emp.id === employeeId);
    
    if (employee) {
      // Update fields - using correct field names from your JSON structure
      employee.firstname = req.body.firstname || employee.firstname;
      employee.lastname = req.body.lastname || employee.lastname;
      employee.designation = req.body.designation || employee.designation;
      employee.department = req.body.department || employee.department;
      
      // Save updated data back to file
      const filePath = path.join(__dirname, '../data/employee.json');
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      
      return res.json({
        message: 'Employee updated successfully',
        employee: employee
      });
    } else {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
  } catch (error) {
    console.error('Error updating employee:', error);
    return res.status(500).json({ 
      message: 'Error updating employee',
      error: error.message 
    });
  }
};


const deleteEmployee = async(req, res) => {
  const { id } = req.body;
  
  try {
    const data = await readDataFromFile();
  
    if (!data.employees || !Array.isArray(data.employees)) {
      return res.status(500).json({ message: 'Invalid data structure' });
    }
    
    const index = data.employees.findIndex(emp => emp.id == id);
    
    if (index !== -1) {
      const deletedEmployee = data.employees.splice(index, 1);
      console.log('Deleted employee:', deletedEmployee);
      // Write the updated data back to file
      await writeDataToFile(data);
      
      res.json(deletedEmployee[0]);
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Failed to delete employee' });
  }
}

const getEmployeeById = async(req, res) => {
  try {
    const data = await readDataFromFile();
  
    if (!data.employees || !Array.isArray(data.employees)) {
      return res.status(500).json({ message: 'Invalid data structure' });
    }
    if(!req.params.id) {
        return res.status(400).json({ message: 'Employee ID parameter is required' });
    }
    // Find employee by ID
    console.log('req.params.id:', req.params.id);
    const employee = data.employees.find(emp => emp.id === parseInt(req.params.id));
    if (employee) {
        res.json(employee);
    } else {
        res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    console.error('Error fetching employee by ID:', error);
    res.status(500).json({ message: 'Failed to fetch employee', error: error.message });
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

// Request in this form
// Localhost:3000/api/employees
// Body : {designation: senior developer, department: IT}


const modifyEmployee = async (req, res) => {
  const {id, designation , department} = req.body;
  if (!designation || !department || !id) {
    return res.status(400).json({ message: 'Designation and department are required' });
  }

  try { 
    const data = await readDataFromFile();
    if (!data.employees || !Array.isArray(data.employees)) {
      return res.status(500).json({ message: 'Invalid data structure' });
    }
    // Filter employees by id
    const employee = data.employees.find(emp => emp.id === parseInt(id));
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    // Update employee details
    employee.designation = designation;
    employee.department = department;
    
    // Write updated data back to file
    await writeDataToFile(data);
    res.json({
      message: 'Employee modified successfully',
      employee: employee
    });

  } catch (error) {
    console.error('Error modifying employee:', error);
    res.status(500).json({ 
      message: 'Failed to modify employee',
      error: error.message 
    });
  }
}


module.exports = {
    getAllEmployees,
    createNewEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeById,
    getEmployeesByDesignation,
    modifyEmployee
};