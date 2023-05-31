const inquirer = require("inquirer");
const pool = require('./db/connections');

function startApplication() {
  inquirer
    .prompt({
      name: 'action',
      type: 'list',
      message: 'What would you like to do?',
      choices: [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update an employee role',
        'Exit'
      ],
    })
    .then((answer) => {
      switch (answer.action) {
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
          console.log('Exiting the application.');
          pool.end(); // Close the database connection
          break;
      }
    });
}

async function viewAllDepartments() {
  try {
    const [departments] = await pool.query('SELECT * FROM department');
    console.table(departments);
    startApplication(); // Display the menu again after viewing departments
  } catch (error) {
    console.error('Error fetching departments:', error);
    startApplication();
  }
}

async function viewAllRoles() {
  try {
    const query = `
      SELECT role.id, role.title, department.name AS department, role.salary
      FROM role
      INNER JOIN department ON role.department_id = department.id
    `;
    const [roles] = await pool.query(query);
    console.table(roles);
    startApplication();
  } catch (error) {
    console.error('Error fetching roles:', error);
    startApplication();
  }
}

async function viewAllEmployees() {
  try {
    const query = `
      SELECT 
        employee.id, employee.first_name, employee.last_name,
        role.title, department.name AS department, role.salary,
        CONCAT(manager.first_name, ' ', manager.last_name) AS manager
      FROM employee
      INNER JOIN role ON employee.role_id = role.id
      INNER JOIN department ON role.department_id = department.id
      LEFT JOIN employee AS manager ON employee.manager_id = manager.id
    `;
    const [employees] = await pool.query(query);
    console.table(employees);
    startApplication();
  } catch (error) {
    console.error('Error fetching employees:', error);
    startApplication();
  }
}

async function addDepartment() {
  try {
    const answer = await inquirer.prompt([
      {
        name: 'departmentName',
        type: 'input',
        message: 'Enter the name of the department:',
        validate: (value) => value !== '',
      },
    ]);
    const [result] = await pool.query('INSERT INTO department SET ?', { name: answer.departmentName });
    console.log('Department added successfully!');
    startApplication();
  } catch (error) {
    console.error('Error adding department:', error);
    startApplication();
  }
}

async function addRole() {
  try {
    const departments = await pool.query('SELECT * FROM department');
    const departmentChoices = departments.map((department) => ({
      name: department.name,
      value: department.id,
    }));
    const answer = await inquirer.prompt([
      {
        name: 'roleTitle',
        type: 'input',
        message: 'Enter the title of the role:',
        validate: (value) => value !== '',
      },
      {
        name: 'roleSalary',
        type: 'input',
        message: 'Enter the salary for the role:',
        validate: (value) => !isNaN(value),
      },
      {
        name: 'departmentId',
        type: 'list',
        message: 'Select the department for the role:',
        choices: departmentChoices,
      },
    ]);
    const [result] = await pool.query('INSERT INTO role SET ?', {
      title: answer.roleTitle,
      salary: answer.roleSalary,
      department_id: answer.departmentId,
    });
    console.log('Role added successfully!');
    startApplication();
  } catch (error) {
    console.error('Error adding role:', error);
    startApplication();
  }
}

async function addEmployee() {
  try {
    const roles = await pool.query('SELECT * FROM role');
    const roleChoices = roles.map((role) => ({
      name: role.title,
      value: role.id,
    }));
    const employees = await pool.query('SELECT * FROM employee');
    const employeeChoices = employees.map((employee) => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id,
    }));
    employeeChoices.unshift({ name: 'None', value: null });
    const answer = await inquirer.prompt([
      {
        name: 'firstName',
        type: 'input',
        message: "Enter the employee's first name:",
        validate: (value) => value !== '',
      },
      {
        name: 'lastName',
        type: 'input',
        message: "Enter the employee's last name:",
        validate: (value) => value !== '',
      },
      {
        name: 'roleId',
        type: 'list',
        message: "Select the employee's role:",
        choices: roleChoices,
      },
      {
        name: 'managerId',
        type: 'list',
        message: "Select the employee's manager:",
        choices: employeeChoices,
      },
    ]);
    const [result] = await pool.query('INSERT INTO employee SET ?', {
      first_name: answer.firstName,
      last_name: answer.lastName,
      role_id: answer.roleId,
      manager_id: answer.managerId,
    });
    console.log('Employee added successfully!');
    startApplication();
  } catch (error) {
    console.error('Error adding employee:', error);
    startApplication();
  }
}

async function updateEmployeeRole() {
  try {
    const employees = await pool.query('SELECT * FROM employee');
    const employeeChoices = employees.map((employee) => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id,
    }));
    const roles = await pool.query('SELECT * FROM role');
    const roleChoices = roles.map((role) => ({
      name: role.title,
      value: role.id,
    }));
    const answer = await inquirer.prompt([
      {
        name: 'employeeId',
        type: 'list',
        message: 'Select the employee to update:',
        choices: employeeChoices,
      },
      {
        name: 'roleId',
        type: 'list',
        message: 'Select the new role for the employee:',
        choices: roleChoices,
      },
    ]);
    await pool.query('UPDATE employee SET role_id = ? WHERE id = ?', [
      answer.roleId,
      answer.employeeId,
    ]);
    console.log('Employee role updated successfully!');
    startApplication();
  } catch (error) {
    console.error('Error updating employee role:', error);
    startApplication();
  }
}

startApplication(); // Start the application
