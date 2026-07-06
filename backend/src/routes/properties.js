//import Express so we can create routes
const express = require('express');

//create a new router object
const router = express.Router();

//import the MySQL connection pool
const pool = require('../db/mysql');

//GET /api/properties
// this endpoint returns a page of properties from the database
//supports pagination and filters
router.get('/', async (req, res) => {
    try {
        //read the limit value from the URL (/api/properties?limit=5)
        //if no limit is provided, use 20
        const limit = parseInt(req.query.limit) || 20;
        //read the offset value from the URL(/api/properties?offset=10)
        //offset tells MySQL where to start reading rows
        //if no offset is provided, use 0
        const offset = parseInt(req.query.offset) || 0;

        //get filter values from the query string
        const { city, zipcode, minPrice, maxPrice, beds, baths } = req.query;

        //validate numeric inputs
        if (minPrice && isNaN(minPrice)) {
            return res.status(400).json({ error: 'minPrice must be a number' });
        }

        if (maxPrice && isNaN(maxPrice)) {
            return res.status(400).json({ error: 'maxPrice must be a number' });
        }

        if (beds && isNaN(beds)) {
            return res.status(400).json({ error: 'beds must be a number' });
        }

        if (baths && isNaN(baths)) {
            return res.status(400).json({ error: 'baths must be a number' });
        }

        if (limit < 1 || limit > 100) {
            return res.status(400).json({ error: 'limit must be between 1 and 100' });
        }
        
        if (offset < 0) {
            return res.status(400).json({ error: 'offset cannot be negative' });
        }

        const conditions = []; //stores SQL filter conditions
        const values = []; // stores the actual user input values

        // filter by city
        if (city) {
            conditions.push('LOWER(TRIM(L_City)) = LOWER(TRIM(?))');
            values.push(city);
        }

        // filter by zip code
        if (zipcode) {
            conditions.push('L_Zip = ?');
            values.push(zipcode);
        }

        // filter by minimum price
        if (minPrice) {
            conditions.push('L_SystemPrice >= ?');
            values.push(parseFloat(minPrice));
        }

        // filter by maximum price
        if (maxPrice) {
            conditions.push('L_SystemPrice <= ?');
            values.push(parseFloat(maxPrice));
        }

        // filter by minimum number of bedrooms
        if (beds) {
            conditions.push('L_Keyword2 = ?');
            values.push(parseInt(beds));
        }

        // filter by minimum number of bathrooms
        if (baths) {
            conditions.push('LM_Dec_3 = ?');
            values.push(parseInt(baths));
        }

        // if there are filters, create a WHERE clause
        // Ex: WHERE L_Zip = ? AND L_SystemPrice <= ?
        const whereClause = conditions.length > 0
            ? 'WHERE ' + conditions.join(' AND ')
            : '';

        // count how many matching properties exist
        const countQuery = `SELECT COUNT(*) as total FROM rets_property ${whereClause}`;
        const [countResult] = await pool.query(countQuery, values);
        const total = countResult[0].total;

        // get the matching property rows
        const dataQuery = `SELECT * FROM rets_property ${whereClause} LIMIT ? OFFSET ?`;
        const [results] = await pool.query(dataQuery, [...values, limit, offset]);

        //send the results back to front end as JSON
        res.json({
            total,
            limit,
            offset,
            results
        });
    } catch (error) {
        //if something goes wrong then print the error to the terminal
        console.error('Database error:', error);
        // Send an HTTP 500 (Internal Server Error) along with an error message.
        res.status(500).json({
            error: 'Failed to fetch properties'
        });
    }
});

//export this router so index.js can use it
module.exports = router;