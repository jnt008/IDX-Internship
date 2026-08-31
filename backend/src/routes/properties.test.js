//import supertest so we can test the API routes
const request = require('supertest');

//import express so we can create a test app
const express = require('express');

//import the properties router
const propertiesRouter = require('./properties');

//mock the database pool so tests do not use the real database
jest.mock('../db/mysql', () => ({
    query: jest.fn()
}));

//import the mocked database pool
const pool = require('../db/mysql');

//create an express app for testing
const app = express();

//allow the app to read JSON
app.use(express.json());

//connect the properties routes to the test app
app.use('/api/properties', propertiesRouter);

describe('Properties API', () => {

    //clear previous mock calls before each test
    beforeEach(() => {
        pool.query.mockClear();
    });

    describe('GET /api/properties', () => {

        //test that properties are returned with pagination
        test('returns properties with pagination', async () => {

            //mock the count query and property data query
            pool.query
                .mockResolvedValueOnce([[{ total: 100 }]]) //count query
                .mockResolvedValueOnce([
                    [{ L_ListingID: '123', L_City: 'Portland' }]
                ]); //data query

            //send a request with a limit and offset
            const response = await request(app)
                .get('/api/properties?limit=20&offset=0')
                .expect(200);

            //check that the total number of properties is correct
            expect(response.body.total).toBe(100);

            //check that one property was returned
            expect(response.body.results).toHaveLength(1);

            //check that the returned city is correct
            expect(response.body.results[0].L_City).toBe('Portland');
        });

        //test that an invalid limit returns a 400 error
        test('returns 400 for invalid limit', async () => {

            //send a request with an invalid limit
            const response = await request(app)
                .get('/api/properties?limit=abc')
                .expect(400);

            //check that the error message mentions the limit
            expect(response.body.error).toContain('limit');
        });

        //test that properties can be filtered by city
        test('filters by city', async () => {

            //mock the count query and filtered property data
            pool.query
                .mockResolvedValueOnce([[{ total: 50 }]])
                .mockResolvedValueOnce([
                    [{ ListingId: '123', City: 'Portland' }]
                ]);

            //send a request with the city filter
            const response = await request(app)
                .get('/api/properties?city=Portland')
                .expect(200);

            //check that the database query contains the city filter
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('WHERE'),
                expect.arrayContaining(['Portland'])
            );
        });

        //test that properties can be filtered by price range
        test('filters by price range', async () => {

            //mock the count query and filtered property data
            pool.query
                .mockResolvedValueOnce([[{ total: 25 }]])
                .mockResolvedValueOnce([
                    [{
                        L_ListingID: '123',
                        L_SystemPrice: 400000
                    }]
                ]);

            //send a request with a minimum and maximum price
            const response = await request(app)
                .get('/api/properties?minPrice=300000&maxPrice=500000')
                .expect(200);

            //check that the returned price is correct
            expect(response.body.results[0].L_SystemPrice).toBe(400000);
        });
    });

    describe('GET /api/properties/:id', () => {

        //test that a property can be returned using its ID
        test('returns property by id', async () => {

            //mock a property returned from the database
            pool.query.mockResolvedValueOnce([[
                {
                    L_ListingID: '123',
                    L_City: 'Portland',
                    L_SystemPrice: 500000
                }
            ]]);

            //send a request for property 123
            const response = await request(app)
                .get('/api/properties/123')
                .expect(200);

            //check that the correct property was returned
            expect(response.body.L_ListingID).toBe('123');
        });

        //test that a missing property returns a 404 error
        test('returns 404 for non-existent property', async () => {

            //mock an empty database result
            pool.query.mockResolvedValueOnce([[]]);

            //send a request for a property that does not exist
            const response = await request(app)
                .get('/api/properties/999')
                .expect(404);

            //check that the error says the property was not found
            expect(response.body.error).toContain('not found');
        });
    });

    describe('GET /api/properties/:id/openhouses', () => {

        //test that open houses are returned for a property
        test('returns open houses for property', async () => {

            //mock the property check and open house query
            pool.query
                .mockResolvedValueOnce([
                    [{ L_ListingID: '123' }]
                ]) //property check
                .mockResolvedValueOnce([
                    [{
                        OpenHouseDate: '2024-03-15',
                        OH_StartTime: '1:00 PM'
                    }]
                ]);

            //send a request for the property's open houses
            const response = await request(app)
                .get('/api/properties/123/openhouses')
                .expect(200);

            //check that one open house was returned
            expect(response.body.count).toBe(1);

            //check that the open houses array contains one item
            expect(response.body.openhouses).toHaveLength(1);
        });

        //test a property that has no open houses
        test('returns empty array for property with no open houses', async () => {

            //mock the property check and an empty open house query
            pool.query
                .mockResolvedValueOnce([
                    [{ ListingId: '123' }]
                ])
                .mockResolvedValueOnce([[]]);

            //send a request for the property's open houses
            const response = await request(app)
                .get('/api/properties/123/openhouses')
                .expect(200);

            //check that the open house count is zero
            expect(response.body.count).toBe(0);

            //check that the open houses array is empty
            expect(response.body.openhouses).toHaveLength(0);
        });
    });
});