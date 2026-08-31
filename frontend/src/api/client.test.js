//import the API functions we want to test
import {
    fetchProperties,
    fetchPropertyDetail,
    fetchOpenHouses
} from './client';

//replace the browser's real fetch() with a fake version
global.fetch = jest.fn();

describe('API client', () => {

    //hide expected console errors during failed request tests
    let consoleErrorSpy;

    beforeAll(() => {
        consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});
    });

    //reset fetch before every test
    beforeEach(() => {
        fetch.mockReset();
    });

    //restore console.error after all tests finish
    afterAll(() => {
        consoleErrorSpy.mockRestore();
    });


    describe('fetchProperties', () => {

        //test that properties are fetched with filters
        test('fetches properties successfully with query parameters', async () => {

            //create fake property data
            const mockResponse = {
                total: 1,
                limit: 20,
                offset: 0,
                results: [
                    {
                        L_ListingID: '123',
                        L_City: 'Portland',
                        L_SystemPrice: 500000
                    }
                ]
            };

            //fake a successful backend response
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            //call fetchProperties with several filters
            const data = await fetchProperties({
                city: 'Portland',
                minPrice: 300000,
                beds: 3
            });

            //get the URL used by fetch
            const callUrl = fetch.mock.calls[0][0];

            //check that the correct API route was used
            expect(callUrl).toContain('/api/properties?');

            //check that the filters were added to the URL
            expect(callUrl).toContain('city=Portland');
            expect(callUrl).toContain('minPrice=300000');
            expect(callUrl).toContain('beds=3');

            //check that the returned data is correct
            expect(data).toEqual(mockResponse);
        });


        //test the route when no filters are provided
        test('fetches properties without query parameters', async () => {

            //fake a successful response
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    results: []
                })
            });

            //call fetchProperties without filters
            await fetchProperties();

            //check that no query string was added
            expect(fetch).toHaveBeenCalledWith(
                '/api/properties'
            );
        });


        //test that failed property requests throw an error
        test('throws error when property request fails', async () => {

            //fake an HTTP error
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            });

            //check that fetchProperties throws the error
            await expect(
                fetchProperties()
            ).rejects.toThrow('HTTP 500');
        });
    });


    describe('fetchPropertyDetail', () => {

        //test that one property's details are returned
        test('fetches property details successfully', async () => {

            //create fake property data
            const mockProperty = {
                L_ListingID: '123',
                L_City: 'Portland',
                L_SystemPrice: 500000
            };

            //fake a successful backend response
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockProperty
            });

            //request property 123
            const data = await fetchPropertyDetail('123');

            //check that the correct URL was used
            expect(fetch).toHaveBeenCalledWith(
                '/api/properties/123'
            );

            //check that the correct property was returned
            expect(data).toEqual(mockProperty);
        });


        //test that a missing property throws an error
        test('throws error when property detail request fails', async () => {

            //fake a 404 response
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: 'Not Found'
            });

            //check that the correct error is thrown
            await expect(
                fetchPropertyDetail('999')
            ).rejects.toThrow('HTTP 404');
        });
    });


    describe('fetchOpenHouses', () => {

        //test that open houses are returned for a property
        test('fetches open houses successfully', async () => {

            //create fake open house data
            const mockOpenHouses = {
                count: 1,
                openhouses: [
                    {
                        OH_StartDate: '2026-09-01',
                        OH_StartTime: '1:00 PM'
                    }
                ]
            };

            //fake a successful backend response
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockOpenHouses
            });

            //request open houses for property 123
            const data = await fetchOpenHouses('123');

            //check that the correct URL was used
            expect(fetch).toHaveBeenCalledWith(
                '/api/properties/123/openhouses'
            );

            //check that the open house data is correct
            expect(data).toEqual(mockOpenHouses);
        });


        //test that a failed open house request throws an error
        test('throws error when open house request fails', async () => {

            //fake an HTTP error
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            });

            //check that the correct error is thrown
            await expect(
                fetchOpenHouses('123')
            ).rejects.toThrow('HTTP 500');
        });
    });
});