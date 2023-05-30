-- Insert departments
INSERT INTO department (name) VALUES
  ('Sales'),
  ('Engineering'),
  ('Marketing'),
  ('Finance');

-- Insert roles
INSERT INTO role (title, salary, department_id) VALUES
  ('Sales Manager', 80000, 1),
  ('Sales Representative', 50000, 1),
  ('Software Engineer', 90000, 2),
  ('Marketing Specialist', 60000, 3),
  ('Accountant', 70000, 4);

-- Insert employees
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
  ('John', 'Doe', 1, NULL),
  ('Jane', 'Smith', 2, 1),
  ('Mike', 'Johnson', 3, 1),
  ('Sarah', 'Williams', 4, NULL),
  ('Chris', 'Davis', 5, 4);
