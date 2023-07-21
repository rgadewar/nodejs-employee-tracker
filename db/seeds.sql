-- Select the database to work with
USE emplyee_db;

-- Insert departments
INSERT INTO department (name) VALUES
  ('Engineering'),
  ('Sales'),
  ('Finance'),
  ('Human Resources');

-- Insert roles
INSERT INTO role (title, salary, department_id) VALUES
  ('Software Engineer', 80000, 1),
  ('Sales Representative', 60000, 2),
  ('Accountant', 65000, 3),
  ('HR Manager', 70000, 4);

-- Insert employees
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
  ('John', 'Doe', 1, NULL),
  ('Jane', 'Smith', 2, 1),
  ('Mike', 'Johnson', 3, NULL),
  ('Sarah', 'Williams', 4, 3);
