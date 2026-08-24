import {
    buildQueryString,
    handleApiError,
} from "../utils/api-helpers";

// base URL for our backend
// this is empty because React uses the proxy in package.json
const API_BASE = "";

// get a list of properties
export async function fetchProperties(params = {}) {
    try {
        //convert filters into URL query parameters
        const query = buildQueryString(params);

        //build the API URL
        const url = `${API_BASE}/api/properties${query ? "?" + query : ""}`;

        //send rq to the backend
        const response = await fetch(url);

        //throw error if request failed
        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}: ${response.statusText}`
            );
        }

        //return the JSON response
        return await response.json();
    } catch (error) {
        const message = handleApiError(error);
        console.error("API Error:", message);
        throw new Error(message);
    }
}

//get details for one property
export async function fetchPropertyDetail(listingId) {
    try {
        //send request for one property's data
        const response = await fetch(
            `${API_BASE}/api/properties/${listingId}`
        );

        //throw an error if request failed
        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}: ${response.statusText}`
            );
        }

        //return the JSON response
        return await response.json();
    } catch (error) {
        const message = handleApiError(error);
        console.error("API Error:", message);
        throw new Error(message);
    }
}

//get open houses for a property
export async function fetchOpenHouses(listingId) {
    try {
        //send request for open house data
        const response = await fetch(
            `${API_BASE}/api/properties/${listingId}/openhouses`
        );

        //throw an error if request failed
        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}: ${response.statusText}`
            );
        }

        //return the JSON response
        return await response.json();
    } catch (error) {
        const message = handleApiError(error);
        console.error("API Error:", message);
        throw new Error(message);
    }
}