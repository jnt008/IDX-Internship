//import the function that gets properties from the backend
import { fetchProperties } from "../api/client";

//import the property filters component
import PropertyFilters from "../components/PropertyFilters";

//import the pagination
import Pagination from "../components/Pagination";

//import the css for this page
import "./ListingsPage.css";

import PropertyCard from "../components/PropertyCard";

import React, { useCallback, useEffect, useState } from "react";

function ListingsPage() {
    //stores the properties returned by backend
    const [properties, setProperties] = useState([]);

    //track whether the properties are loading
    const [loading, setLoading] = useState(true);

    //stores an error message if rq fails
    const [error, setError] = useState(null);

    //stores total num of avail properties
    const [total, setTotal] = useState(0);

    //stores the filters selected by the user
    const [filters, setFilters] = useState({});

    //tracks the current page
    const [currentPage, setCurrentPage] = useState(1);

    //stores how many properties appear on each page
    const [itemsPerPage] = useState(20);

    //stores which field the results should be sorted by
    const [sortBy, setSortBy] = useState('');

    //stores whether the sort is ascending or descending
    const [sortOrder, setSortOrder] = useState('ASC');

    //request property data from the backend
    const loadProperties = useCallback(async () => {
        try {
            //show the loading msm and clear old erroes
            setLoading(true);
            setError(null);

            // calculate how many properties to skip
            const offset = (currentPage - 1) * itemsPerPage;

            // combine filters with pagination
            // only include sortBy/sortOrder if a sort field is selected
            const params = {
                ...filters,
                limit: itemsPerPage,
                offset: offset,
                ...(sortBy && { sortBy, sortOrder })
            };

            //request the first 20 properties using the selected filters
            const data = await fetchProperties(params);

            //save the returned data in state
            setProperties(data.results);
            setTotal(data.total);
        } catch (err) {
            //show error msg if the req fails
            setError("Failed to load properties. Please try again.");
        } finally {
            //stop showing loading msg
            setLoading(false);
        }
    }, [filters, currentPage, itemsPerPage, sortBy, sortOrder]);

    //load properties when the first page appears, filters change, or sorting changes
    useEffect(() => { loadProperties(); }, [loadProperties]);

    const handleSearch = (newFilters) => {
        // save new filters
        setFilters(newFilters);

        // go back to page 1 whenever filters change
        setCurrentPage(1);
    };

    // changes the current page
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);

        // scroll back to the top
        window.scrollTo(0, 0);
    };

    // calculate the total number of pages
    const totalPages = Math.ceil(total / itemsPerPage);

    return (
        <div className="listings-page">
            <h1>Property Listings</h1>

            {/* Display the filter form and send searches to handleSearch. */}
            <PropertyFilters onSearch={handleSearch} />

            {/* Lets the user choose which field to sort by, and the sort direction. */}
            <div className="sort-controls">
                <label>Sort by:</label>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="">Default</option>
                    <option value="L_SystemPrice">Price</option>
                    <option value="ListingContractDate">Date Listed</option>
                    <option value="LM_Int2_3">Size</option>
                    <option value="L_Keyword2">Bedrooms</option>
                </select>

                {/* Only show the direction picker once a sort field is chosen. */}
                {sortBy && (
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                    >
                        <option value="ASC">Low to High</option>
                        <option value="DESC">High to Low</option>
                    </select>
                )}
            </div>

            {/* Show while waiting for the backend. */}
            {loading && (
                <div className="loading">
                    Loading properties...
                </div>
            )}

            {/* Show if the request failed. */}
            {error && (
                <div className="error">
                    {error}
                </div>
            )}

            {/* Only show the property results when loading is done and there is no error. */}
            {!loading && !error && (
                <>
                    {/* Show how many properties are currently displayed. */}
                    <p className="results-summary">
                        Showing {((currentPage - 1) * itemsPerPage) + 1}–
                        {Math.min(currentPage * itemsPerPage, total)} of {total} properties
                    </p>

                    {/* Show a message when no properties match the filters. */}
                    {properties.length === 0 ? (
                        <div className="no-results">
                            No properties found matching your criteria. Try
                            adjusting your filters.
                        </div>
                    ) : (
                        <>
                            {/* Display the properties in a grid */}
                            <div className="property-grid">
                                {properties.map((property) => (
                                    <PropertyCard
                                        key={property.L_ListingID}
                                        property={property}
                                    />
                                ))}
                            </div>

                            {/* Display the pagination controls */}
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default ListingsPage;