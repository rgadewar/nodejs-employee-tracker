const pool = require('../config/connection');
const inquirer = require('inquirer');
const { printTable } = require('console-table-printer');
const figlet = require('figlet');

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
  pool.query('SELECT id, name FROM department', (err, results) => {
    if (err) {
      console.error('Error fetching departments:', err);
    } else {
       // Convert the results to a simple array of objects without the index
       const departments = results.map((row) => ({ id: row.id, name: row.name }));

       // Display the departments without the index column
       console.table(departments);
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
// Function to add an employee
function addEmployee() {
  // Fetch role titles and ids to show as choices when adding an employee
  pool.query('SELECT id, title FROM role', (err, roles) => {
    if (err) {
      console.error('Error fetching roles:', err);
      displayMainMenu();
    } else {
      // Fetch managers (employees who are managers) for the inquirer prompt choices
      pool.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee WHERE manager_id IS NULL', (err, managers) => {
        if (err) {
          console.error('Error fetching managers:', err);
          displayMainMenu();
        } else {
          inquirer
            .prompt([
              {
                type: 'input',
                name: 'firstName',
                message: "Enter the employee's first name:",
                // ...
              },
              {
                type: 'input',
                name: 'lastName',
                message: "Enter the employee's last name:",
                // ...
              },
              {
                type: 'list',
                name: 'roleId',
                message: "Select the employee's role:",
                choices: roles.map((role) => ({ name: role.title, value: role.id })),
                // Use map to format roles as { name: role.title, value: role.id }
              },
              {
                type: 'list',
                name: 'managerId',
                message: "Select the employee's manager (optional):",
                choices: [{ name: 'None', value: null }, ...managers], // Use map to format managers as { name: manager.name, value: manager.id }
              },
            ])
            .then((answers) => {
              const { firstName, lastName, roleId, managerId } = answers;
              const finalManagerId = managerId === 'None' ? null : managers.find((manager) => manager.name === managerId).id;

              // Implement MySQL query to add the employee to the database
              pool.query(
                'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)',
                [firstName, lastName, roleId, finalManagerId],
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
      // Fetch managers (employees who are managers) for the inquirer prompt choices
      pool.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee WHERE manager_id IS NULL', (err, managers) => {
        if (err) {
          console.error('Error fetching managers:', err);
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
                    name: 'employeeId', // The name should be 'employeeId' to capture the selected employee's ID
                    message: 'Select the employee whose role you want to update:',
                    choices: employees.map((employee) => ({ name: employee.name, value: employee.id })), // Map the choices with id as value
                  },
                  {
                    type: 'list',
                    name: 'roleId',
                    message: 'Select the new role for the employee:',
                    choices: roles.map((role) => ({ name: role.title, value: role.id })),
                  },
                  {
                    type: 'list',
                    name: 'managerId',
                    message: "Select the employee's manager (optional):",
                    choices: [{ name: 'None', value: null }, ...managers], // Use map to format managers as { name: manager.name, value: manager.id }
                  },
                ])
                .then((answers) => {
                  const { employeeId, roleId, managerId } = answers;
                  const finalManagerId = managerId === 'None' ? null : managers.find((manager) => manager.name === managerId).id;

                  // Implement MySQL query to update the employee role and manager in the database
                  pool.query(
                    'UPDATE employee SET role_id = ?, manager_id = ? WHERE id = ?',
                    [roleId, finalManagerId, employeeId],
                    (err, result) => {
                      if (err) {
                        console.error('Error updating employee role:', err);
                      } else {
                        console.log('Employee role updated successfully.');
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
  });
}

module.exports = displayMainMenu;

