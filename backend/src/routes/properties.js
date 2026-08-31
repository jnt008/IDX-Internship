//import Express so we can create routes
const express = require('express');

//create a new router object
const router = express.Router();

//import the MySQL connection pool
const pool = require('../db/mysql');

//function to validate a property listing ID before using it
function validateListingId(id) {
    //check if the id is missing or only contains spaces
    if (!id || id.trim() === '') {
        return {
            valid: false,
            error: 'Listing ID is required'
        };
    }
    //prevent long IDs from being sent to database (protects against invalid input and unnessary queries)
    if(id.length > 50){
        return{
            valid: false,
            error: 'Listing ID is too long'
        };
    }
    //if the checks pass then the ID is valid
    return{
        valid: true
    };
}

//GET open houses for one specific property
router.get('/:id/openhouses', async (req, res) => {
    try{
        // get the property ID from the URL
        const {id} = req.params;

        const validation = validateListingId(id);

        if (!validation.valid) {
            return res.status(400).json({
                error: validation.error
            });
        }
        
        // check if property actually exists
        const [propertyCheck] = await pool.query('SELECT L_ListingID FROM rets_property WHERE L_ListingID = ?', [id]);

        //if no property was found, return a 404 error
        if(propertyCheck.length === 0){
            return res.status(404).json({
                error: 'Property not found',
                message: `No property exists with ID: ${id}`
            });
        }

        //if property exists, get all open houses for that property
        const [openhouses] = await pool.query('SELECT * FROM rets_openhouse WHERE L_ListingID = ? ORDER BY OpenHouseDate, OH_StartTime', [id]);

        //send the open house results back as JSON
        res.json({
            propertyId: id,
            count: openhouses.length,
            openhouses: openhouses
        });
    } catch (error) {
        //if there is something wrong with the database/query, return a 500 error
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch open houses' });
    }
});

// GET details for one specific property
router.get('/:id', async (req, res) => {
    try {
        //ger the property ID from the URL
        const {id} = req.params;

        //run validateListingId on the ID
        const validation = validateListingId(id);

        //if validation fails, immediately return a 400 bad request
        if(!validation.valid){
            return res.status(400).json({
                error: validation.error
            });
        }

        //search the property table for a matching listing ID
        const [results] = await pool.query('SELECT * FROM rets_property WHERE L_ListingID = ?', [id]);

        //if there are no properties found, return a 404 error
        if(results.length === 0){
            return res.status(404).json({
                error: 'Property not found',
                message: `No property exists with ID: ${id}`
            });
        }
        //since ID should only match one property, return the first result
        res.json(results[0]);
    } catch (error){
        //if something is wrong with the database/query, return a 500 error
        console.error('Database error:', error);
        res.status(500).json({error: 'Failed to fetch property details'});
    }
});

//GET /api/properties
// this endpoint returns a page of properties from the database
//supports pagination, filters, and sorting
router.get('/', async (req, res) => {
    try {
        //read the limit value from the URL (/api/properties?limit=5)
        //if no limit is provided, use 20
        const limit = req.query.limit !== undefined ? parseInt(req.query.limit) : 20;
        //read the offset value from the URL(/api/properties?offset=10)
        //offset tells MySQL where to start reading rows
        //if no offset is provided, use 0
        const offset = req.query.offset !== undefined ? parseInt(req.query.offset) : 0;

        //get filter values from the query string
        const { city, zipcode, minPrice, maxPrice, beds, baths, sortBy, sortOrder } = req.query;

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

        if (isNaN(limit) || limit < 1 || limit > 100) {
            return res.status(400).json({ error: 'limit must be between 1 and 100' });
        }

        if (isNaN(offset) || offset < 0) {
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

        // build the ORDER BY clause
        // only fields in this list are allowed to prevent SQL injection through sortBy
        let orderClause = '';
        const validSortFields = ['L_SystemPrice', 'ListingContractDate', 'LM_Int2_3', 'L_Keyword2'];
        const validOrders = ['ASC', 'DESC'];

        // only add sorting if sortBy is one of the allowed fields
        if (sortBy && validSortFields.includes(sortBy)) {
            //default to ascending order unless DESC is explicitly requested
            const order = validOrders.includes(sortOrder?.toUpperCase())
                ? sortOrder.toUpperCase()
                : 'ASC';
            orderClause = `ORDER BY ${sortBy} ${order}`;
        }

        // count how many matching properties exist
        const countQuery = `SELECT COUNT(*) as total FROM rets_property ${whereClause}`;
        const [countResult] = await pool.query(countQuery, values);
        const total = countResult[0].total;

        // get the matching property rows, sorted and paginated
        const dataQuery = `SELECT * FROM rets_property ${whereClause} ${orderClause} LIMIT ? OFFSET ?`;
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