// tests/employees.test.js
const request = require('supertest');
const app = require('../server'); // You'll need to export app from server.js
const { sequelize } = require('../database/connection');

// Test database setup
beforeAll(async () => {
  // Connect to test database
  await sequelize.authenticate();
  await sequelize.sync({ force: true }); // drop all the exisiting tables. 
});

afterAll(async () => {
  // Clean up after tests
  await sequelize.close();
});

describe('Employee API', () => {
  
  // Test data
  const testEmployee = {
    firstname:   'ali',
    lastname: 'riaz',
    designation: 'Software Developer',
    department: 'IT'
  };

  let createdEmployeeId;

  describe('POST /employees', () => {
    test('should create a new employee', async () => {
      const response = await request(app)
        .post('/employees')
        .send(testEmployee)
        .expect(201);// created

      expect(response.body).toHaveProperty('message', 'Employee added successfully');
      expect(response.body.employee).toHaveProperty('id');
      expect(response.body.employee.firstname).toBe(testEmployee.firstname);
      expect(response.body.employee.lastname).toBe(testEmployee.lastname);
      
      // Save ID for other tests
      createdEmployeeId = response.body.employee.id;
    });

    // if dont send the lastname and designation, to see its error handling
    test('should return 400 for missing required fields', async () => {
      const incompleteEmployee = {
        firstname: 'John'
        // Missing lastname, designation, department
      };

      const response = await request(app)
        .post('/employees')
        .send(incompleteEmployee)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('required');
    });

    test('should return 400 for empty request body', async () => {
      await request(app)
        .post('/employees')
        .send({})
        .expect(400);
    });
  });

  describe('GET /employees', () => {
    test('should get all employees', async () => {
      const response = await request(app)
        .get('/employees')
        .expect(200);// ok - succeeded

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('firstname');
      expect(response.body[0]).toHaveProperty('lastname');
    });
  });

  describe('GET /employees/:id', () => {
    test('should get employee by ID', async () => {
      const response = await request(app)
        .get(`/employees/${createdEmployeeId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', createdEmployeeId);
      expect(response.body.firstname).toBe(testEmployee.firstname);
    });

    test('should return 404 for non-existent employee', async () => {
      await request(app)
        .get('/employees/99999')
        .expect(404);
    });

    test('should return 400 for invalid ID format', async () => {
      await request(app)
        .get('/employees/invalid-id')
        .expect(500); 
    });
  });

  describe('GET /employees/designation/:designation', () => {
    test('should get employees by designation', async () => {
      const response = await request(app)
        .get('/employees/designation/Developer')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 0) {
        expect(response.body[0].designation).toContain('Developer');
      }
    });

    test('should return 404 for non-existent designation', async () => {
      await request(app)
        .get('/employees/designation/NonExistentRole')
        .expect(404);
    });
  });

  describe('PUT /employees', () => {
    test('should update an employee', async () => {
      const updatedData = {
        id: createdEmployeeId,
        firstname: 'John Updated',
        lastname: 'Doe Updated',
        designation: 'Senior Developer',
        department: 'Engineering'
      };

      const response = await request(app)
        .put('/employees')
        .send(updatedData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Employee updated successfully');
      expect(response.body.employee.firstname).toBe('John Updated');
      expect(response.body.employee.designation).toBe('Senior Developer');
    });

    test('should return 404 for non-existent employee', async () => {
      const updatedData = {
        id: 99999,
        firstname: 'John',
        lastname: 'Doe',
        designation: 'Developer',
        department: 'IT'
      };

      await request(app)
        .put('/employees')
        .send(updatedData)
        .expect(404);
    });

    test('should return 400 for missing required fields', async () => {
      const incompleteData = {
        id: createdEmployeeId,
        firstname: 'John'
        // Missing other required fields
      };

      await request(app)
        .put('/employees')
        .send(incompleteData)
        .expect(400);
    });
  });

  describe('PATCH /employees', () => {
    test('should modify employee designation and department', async () => {
      const patchData = {
        id: createdEmployeeId,
        designation: 'Team Lead',
        department: 'Product'
      };

      const response = await request(app)
        .patch('/employees')
        .send(patchData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Employee modified successfully');
      expect(response.body.employee.designation).toBe('Team Lead');
      expect(response.body.employee.department).toBe('Product');
    });

    test('should return 404 for non-existent employee', async () => {
      const patchData = {
        id: 99999,
        designation: 'Manager',
        department: 'HR'
      };

      await request(app)
        .patch('/employees')
        .send(patchData)
        .expect(404);
    });
  });

  describe('DELETE /employees', () => {
    test('should delete an employee', async () => {
      const response = await request(app)
        .delete('/employees')
        .send({ id: createdEmployeeId })
        .expect(200);

      expect(response.body).toHaveProperty('id', createdEmployeeId);

      // Verify employee is deleted
      await request(app)
        .get(`/employees/${createdEmployeeId}`)
        .expect(404);
    });

    test('should return 404 for non-existent employee', async () => {
      await request(app)
        .delete('/employees')
        .send({ id: 99999 })
        .expect(404);
    });

    test('should return 400 for missing ID', async () => {
      await request(app)
        .delete('/employees')
        .send({})
        .expect(400);
    });
  });
});

describe('Health Check', () => {
  test('should return health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('database', 'Connected');
    expect(response.body).toHaveProperty('timestamp');
  });
});