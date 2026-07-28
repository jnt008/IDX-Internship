//import react hooks
import React, { useEffect, useState } from "react";

//import the function that gets properties from the backend
import { fetchProperties } from "../api/client";

//import the property filters component
import PropertyFilters from "../components/PropertyFilters";

//import the css for this page
import "./ListingsPage.css";

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

    //load properties when the first page appears or filters change
    useEffect(() => {
        loadProperties();
    }, [filters]);

    //request property data from the backend
    async function loadProperties() {
        try {
            //show the loading msm and clear old erroes
            setLoading(true);
            setError(null);

            //combine the selected filters with the pagination values
            const params = {
                ...filters,
                limit: 20,
                offset: 0
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
    }

    //updates the filters when the user searches
    const handleSearch = (newFilters) => {
        setFilters(newFilters);
    };

    return (
        <div className="listings-page">
            <h1>Property Listings</h1>

            {/* Display the filter form and send searches to handleSearch. */}
            <PropertyFilters onSearch={handleSearch} />

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
                    <p>
                        Showing {properties.length} of {total} properties
                    </p>

                    {/* Show a message when no properties match the filters. */}
                    {properties.length === 0 ? (
                        <div className="no-results">
                            No properties found matching your criteria. Try
                            adjusting your filters.
                        </div>
                    ) : (
                        /* Display the properties in a grid. */
                        <div className="property-grid">
                            {properties.map((property) => (
                                <PropertyCard
                                    key={property.L_ListingID}
                                    property={property}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// Displays one individual property.
function PropertyCard({ property }) {
    const [imageFailed, setImageFailed] = useState(false);

    let firstPhoto = null;

    try {
        const photos = JSON.parse(property.L_Photos);

        if (Array.isArray(photos) && photos.length > 0) {
            firstPhoto = photos[0];
        }
    } catch (error) {
        firstPhoto = null;
    }

    return (
        <div className="property-card">
            <div className="property-image">
                {firstPhoto && !imageFailed ? (
                    <img
                        src={firstPhoto}
                        alt={property.L_Address || "Property"}
                        onError={() => setImageFailed(true)}
                    />
                ) : (
                    <div className="no-image">
                        No image available
                    </div>
                )}
            </div>

            <div className="property-info">
                <div className="price">
                    {property.L_SystemPrice
                        ? `$${Number(
                              property.L_SystemPrice
                          ).toLocaleString()}`
                        : "Price unavailable"}
                </div>

                <div className="address">
                    {property.L_Address || "Address unavailable"}
                </div>

                <div className="city">
                    {property.L_City}, {property.L_State}
                </div>

                <div className="property-details">
                    <span>{property.L_Keyword2} beds</span>
                    <span>•</span>
                    <span>{property.LM_Dec_3} baths</span>

                    {property.LM_Int2_3 && (
                        <>
                            <span>•</span>
                            <span>
                                {Number(
                                    property.LM_Int2_3
                                ).toLocaleString()}{" "}
                                sqft
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ListingsPage;