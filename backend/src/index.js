// import the Express framework so we can create a web server
const express = require('express');
// import CORS so frontend can communicate with backend
const cors = require('cors');
// import the MySQL connection pool created in src/db/mysql.js
const pool = require('./db/mysql');

const propertiesRouter = require('./routes/properties');

// load the environment variables from the .env file
require('dotenv').config();

//create an express application (our web server)
const app = express();
//use port from .env file or default to 5000
const PORT = process.env.PORT || 5000;

//enable CORS
app.use(cors());
// automatically parse JSON requests
app.use(express.json());

// log every incoming request and its response status
app.use((req, res, next) => {

    // save the start time
    const start = Date.now();

    // after Express finishes sending the response
    res.on("finish", () => {

        // calculate how long the request took
        const duration = Date.now() - start;

        console.log(
            `[${new Date().toISOString()}] ` +
            `${req.method} ${req.originalUrl} ` +
            `${res.statusCode} ` +
            `(${duration} ms)`
        );
    });

    next();
});
//use the properties routes
app.use('/api/properties', propertiesRouter);

// create a GET endpoint at "/api/health"
app.get('/api/health', async (req, res) => {
    try { //try to connect to database
        await pool.query('SELECT 1'); //run a simple SQL query
        res.json({ status: 'ok', database: 'connected' }); //if query succeeds, return a JSON response
    } catch (error) {
        console.error(error); //print error to terminal for debugging
        res.status(500).json({ //return an HTTP 500 (internal server error)
            status: 'error',
            message: error.message,
            code: error.code
        });
    }
});

// start the Express server and begin listening for requests
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});