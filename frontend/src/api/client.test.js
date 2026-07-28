// import the function we want to test
import { fetchProperties } from './client';

// replace the browser's real fetch() with a fake version
global.fetch = jest.fn();

describe('fetchProperties', () => {

    // run before every test
    beforeEach(() => {

        // clear any previous fake fetch calls
        fetch.mockClear();
    });

    // test that properties are fetched successfully
    test('fetches properties successfully', async () => {

        // create fake property data that the backend would normally return
        const mockResponse = {
            total: 100,
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

        // tell the fake fetch() to return a successful response one time
        fetch.mockResolvedValueOnce({

            // pretend the request succeeded
            ok: true,

            // pretend response.json() returns the fake property data
            json: async () => mockResponse
        });

        // call the function being tested
        const data = await fetchProperties({
            limit: 20
        });

        // verify that fetch() was called with the correct URL
        expect(fetch).toHaveBeenCalledWith(
            '/api/properties?limit=20'
        );

        // verify that the returned data exactly matches our fake response
        expect(data).toEqual(mockResponse);
    });

    // test that an error is thrown if the request fails
    test('throws error on failed request', async () => {

        // pretend the server returned an HTTP 500 error
        fetch.mockResolvedValueOnce({

            ok: false,
            status: 500,
            statusText: 'Internal Server Error'
        });

        // verify that fetchProperties() throws an error
        await expect(
            fetchProperties()
        ).rejects.toThrow('HTTP 500');
    });

    // test that multiple filters are added to the URL correctly
    test('builds query string correctly with multiple params', async () => {

        // fake a successful response
        fetch.mockResolvedValueOnce({

            ok: true,

            // the returned data doesn't matter here
            json: async () => ({
                results: []
            })
        });

        // call the function using several filters
        await fetchProperties({
            city: 'Portland',
            minPrice: 300000,
            beds: 3
        });

        // save the URL that fetch() was called with
        const callUrl = fetch.mock.calls[0][0];

        // verify each query parameter exists
        expect(callUrl).toContain('city=Portland');
        expect(callUrl).toContain('minPrice=300000');
        expect(callUrl).toContain('beds=3');
    });
});