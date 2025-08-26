// TODO: Add these validators in the controllers/employeeController.js file


const { z } = require("zod");

const employeeSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  designation: z.string().min(1, "Designation is required"),
  department: z.string().min(1, "Department is required"),
});

const updateEmployeeSchema = employeeSchema.extend({
  id: z.number().int("ID must be an integer"),
});

// Middleware for creating
const validateCreateEmployee = (req, res, next) => {
  try {
    employeeSchema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).json({
      message: "Validation error",
      errors: err.errors.map(e => ({
        field: e.path[0],
        message: e.message,
      })),
    });
  }
};

// Middleware for updating
const validateUpdateEmployee = (req, res, next) => {
  try {
    updateEmployeeSchema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).json({
      message: "Validation error",
      errors: err.errors.map(e => ({
        field: e.path[0],
        message: e.message,
      })),
    });
  }
};

module.exports = { validateCreateEmployee, validateUpdateEmployee };
