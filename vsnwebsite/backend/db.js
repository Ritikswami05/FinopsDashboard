// db.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',     // or your DB host
  user: 'root', // e.g., root
  password: 'Ritik@123',
  database: 'azuredata'
});

connection.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL as ID ' + connection.threadId);
});

module.exports = connection;
