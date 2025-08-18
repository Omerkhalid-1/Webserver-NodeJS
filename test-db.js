// test-model.js - Test Employee model initialization
const { sequelize } = require('./database/connection');
const { DataTypes } = require('sequelize');

async function testModel() {
  try {
    console.log(' Testing Employee model...');
    
    // Import and initialize Employee model
    const EmployeeModel = require('./models/employee');
    console.log(' Employee model imported');
    console.log('Employee model type:', typeof EmployeeModel);
    
    // Initialize the model
    const Employee = EmployeeModel(sequelize, DataTypes);
    console.log(' Employee model initialized');
    console.log('Employee methods available:', Object.getOwnPropertyNames(Employee).slice(0, 10));
    
    // Test sync
    await Employee.sync();
    console.log(' Employee model synced');
    
    // Test a simple query
    const count = await Employee.count();
    console.log(' Employee count:', count);
    
    console.log(' Employee model test passed!');
    process.exit(0);
    
  } catch (error) {
    console.error(' Employee model test failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testModel();