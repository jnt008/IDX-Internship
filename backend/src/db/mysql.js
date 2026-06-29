// import the promise-based version of the mysql2 library
const mysql = require('mysql2/promise');
// load the environment variables from the .env file
require('dotenv').config();

// create a MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST, //the computer where MySQL server is running
    port: process.env.DB_PORT, //the port MySQL is listening on (3306)
    user: process.env.DB_USER, // the MySQL username used to log in
    password: process.env.DB_PASSWORD, // the password for the MySQL user
    database: process.env.DB_NAME, // the database we want to connect to (rets)
    waitForConnections: true, // if all connections are busy, wait until one is available
    connectionLimit: 10, //max number of simultaneous connections
    queueLimit: 0 //no limit of requests waiting for a connection
});

//export the connection pool so other files can use it to execute SQL queries
module.exports = pool;