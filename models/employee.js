// models/employee.js - Employee model
'use strict'; // catches common mistakes and throws errors
const { Model } = require('sequelize'); // get base model from the sequelize library

module.exports = (sequelize, DataTypes) => {
  class Employee extends Model { // inherit all the methods and properties from the base model
    static associate(models) {
      // Define associations here
      // Example: Employee.hasMany(models.Project, { foreignKey: 'employeeId' });
      // will use these when have more than one model and need to define relationships
    }

    // Instance method to get full name
    getFullName() {
      return `${this.firstname} ${this.lastname}`;
    }
  }

  Employee.init({
    firstname: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100]
      }
    },
    lastname: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 30]
      }
    },
    department: {
      type: DataTypes.STRING(25),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 25]
      }
    },
    designation: {
      type: DataTypes.STRING(25),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 25]
      }
    }
  }, {
    sequelize,
    modelName: 'Employee',
    tableName: 'employees',
    underscored: true,
    timestamps: true
  });
  return Employee;
};