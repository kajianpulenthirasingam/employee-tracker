const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Cloudy_20',
  database: 'mysql'
});

// Export the pool
module.exports = pool.promise();
