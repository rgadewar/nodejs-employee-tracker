// app.js
const express = require('express');
const app = express();
const pool = require('./db');

const inquirer = require('inquirer');
require('dotenv').config();

const PORT = process.env.PORT || 3001;

const dbUrl = process.env.DATABASE_URL; // New line to get the DATABASE_URL environment variable

// Define the root route
app.get('/', (req, res) => {
  res.send('Hello, this is the root page!');
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

// Function to display the main menu options
function displayMainMenu() {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'menuChoice',
        message: 'What would you like to do?',
        choices: [
          'View all departments',
          'View all roles',
          'View all employees',
          'Add a department',
          'Add a role',
          'Add an employee',
          'Update an employee role',
          'Exit',
        ],
      },
    ])
    .then((answers) => {
      switch (answers.menuChoice) {
        case 'View all departments':
          viewAllDepartments();
          break;
        case 'View all roles':
          viewAllRoles();
          break;
        case 'View all employees':
          viewAllEmployees();
          break;
        case 'Add a department':
          addDepartment();
          break;
        case 'Add a role':
          addRole();
          break;
        case 'Add an employee':
          addEmployee();
          break;
        case 'Update an employee role':
          updateEmployeeRole();
          break;
        case 'Exit':
          pool.end();
          break;
        default:
          console.log('Invalid choice.');
          displayMainMenu();
      }
    });
}

// Function to view all departments
function viewAllDepartments() {
  // Implement MySQL query to fetch department names and ids
  pool.query('SELECT * FROM department', (err, results) => {
    if (err) {
      console.error('Error fetching departments:', err);
    } else {
      console.table(results);
    }
    displayMainMenu();
  });
}

// Function to view all roles
function viewAllRoles() {
    pool.query('SELECT * FROM role', (err, results) => {
      if (err) {
        console.error('Error fetching roles:', err);
      } else {
        console.table(results);
      }
      displayMainMenu();
    });
  }
  
  // Function to view all employees
  function viewAllEmployees() {
    pool.query(
      'SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee AS manager ON employee.manager_id = manager.id',
      (err, results) => {
        if (err) {
          console.error('Error fetching employees:', err);
        } else {
          console.table(results);
        }
        displayMainMenu();
      }
    );
  }
  
  // Function to add a department
  function addDepartment() {
    inquirer
      .prompt([
        {
          type: 'input',
          name: 'departmentName',
          message: 'Enter the name of the new department:',
          validate: (value) => {
            if (value.trim() !== '') {
              return true;
            }
            return 'Please enter a valid department name.';
          },
        },
      ])
      .then((answers) => {
        const departmentName = answers.departmentName;
        // Implement MySQL query to add the department to the database
        pool.query('INSERT INTO department (name) VALUES (?)', [departmentName], (err, result) => {
          if (err) {
            console.error('Error adding department:', err);
          } else {
            console.log(`Successfully added department: ${departmentName}`);
          }
          displayMainMenu();
        });
      });
  }
  
  // Function to add a role
  function addRole() {
    // Fetch department names and ids to show as choices when adding a role
    pool.query('SELECT id, name FROM department', (err, departments) => {
      if (err) {
        console.error('Error fetching departments:', err);
        displayMainMenu();
      } else {
        inquirer
          .prompt([
            {
              type: 'input',
              name: 'roleTitle',
              message: 'Enter the title of the new role:',
              validate: (value) => {
                if (value.trim() !== '') {
                  return true;
                }
                return 'Please enter a valid role title.';
              },
            },
            {
              type: 'input',
              name: 'roleSalary',
              message: 'Enter the salary of the new role:',
              validate: (value) => {
                if (!isNaN(value) && parseFloat(value) >= 0) {
                  return true;
                }
                return 'Please enter a valid salary (a non-negative number).';
              },
            },
            {
              type: 'list',
              name: 'roleDepartmentId',
              message: 'Select the department for the new role:',
              choices: departments.map((dept) => ({ name: dept.name, value: dept.id })),
            },
          ])
          .then((answers) => {
            const { roleTitle, roleSalary, roleDepartmentId } = answers;
            // Implement MySQL query to add the role to the database
            pool.query(
              'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)',
              [roleTitle, roleSalary, roleDepartmentId],
              (err, result) => {
                if (err) {
                  console.error('Error adding role:', err);
                } else {
                  console.log(`Successfully added role: ${roleTitle}`);
                }
                displayMainMenu();
              }
            );
          });
      }
    });
  }
  
  // Function to add an employee
  function addEmployee() {
    // Fetch role titles and ids to show as choices when adding an employee
    pool.query('SELECT id, title FROM role', (err, roles) => {
      if (err) {
        console.error('Error fetching roles:', err);
        displayMainMenu();
      } else {
        // Fetch employee names and ids to show as choices when adding a manager
        pool.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee', (err, employees) => {
          if (err) {
            console.error('Error fetching employees:', err);
            displayMainMenu();
          } else {
            inquirer
              .prompt([
                {
                  type: 'input',
                  name: 'firstName',
                  message: "Enter the employee's first name:",
                  validate: (value) => {
                    if (value.trim() !== '') {
                      return true;
                    }
                    return "Please enter the employee's first name.";
                  },
                },
                {
                  type: 'input',
                  name: 'lastName',
                  message: "Enter the employee's last name:",
                  validate: (value) => {
                    if (value.trim() !== '') {
                      return true;
                    }
                    return "Please enter the employee's last name.";
                  },
                },
                {
                  type: 'list',
                  name: 'roleId',
                  message: "Select the employee's role:",
                  choices: roles.map((role) => ({ name: role.title, value: role.id })),
                },
                {
                  type: 'list',
                  name: 'managerId',
                  message: "Select the employee's manager (optional):",
                  choices: [{ name: 'None', value: null }, ...employees],
                },
              ])
              .then((answers) => {
                const { firstName, lastName, roleId, managerId } = answers;
                // Implement MySQL query to add the employee to the database
                pool.query(
                  'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)',
                  [firstName, lastName, roleId, managerId],
                  (err, result) => {
                    if (err) {
                      console.error('Error adding employee:', err);
                    } else {
                      console.log(`Successfully added employee: ${firstName} ${lastName}`);
                    }
                    displayMainMenu();
                  }
                );
              });
          }
        });
      }
    });
  }
  
  // Function to update an employee role
  function updateEmployeeRole() {
    // Fetch employee names and ids to show as choices when updating an employee role
    pool.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee', (err, employees) => {
      if (err) {
        console.error('Error fetching employees:', err);
        displayMainMenu();
      } else {
        // Fetch role titles and ids to show as choices when updating an employee role
        pool.query('SELECT id, title FROM role', (err, roles) => {
          if (err) {
            console.error('Error fetching roles:', err);
            displayMainMenu();
          } else {
            inquirer
              .prompt([
                {
                  type: 'list',
                  name: 'employeeId',
                  message: 'Select the employee whose role you want to update:',
                  choices: employees,
                },
                {
                  type: 'list',
                  name: 'roleId',
                  message: 'Select the new role for the employee:',
                  choices: roles.map((role) => ({ name: role.title, value: role.id })),
                },
              ])
              .then((answers) => {
                const { employeeId, roleId } = answers;
                // Implement MySQL query to update the employee role in the database
                pool.query('UPDATE employee SET role_id = ? WHERE id = ?', [roleId, employeeId], (err, result) => {
                  if (err) {
                    console.error('Error updating employee role:', err);
                  } else {
                    console.log('Employee role updated successfully.');
                  }
                  displayMainMenu();
                });
              });
          }
        });
      }
    });
  }
  

// Call the displayMainMenu function to start the application
displayMainMenu();
