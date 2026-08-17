// import React hooks
import React, { useState, useEffect } from "react";

// import tools from React Router
// useParams gets the property ID from the URL
// useNavigate lets us move to another page
import { useParams, useNavigate } from "react-router-dom";

// import API functions for getting property details and open houses
import {
    fetchPropertyDetail,
    fetchOpenHouses
} from "../api/client";

// import the property image gallery component
import PropertyImageGallery from "../components/PropertyImageGallery";

// import the property map component
import PropertyMap from "../components/PropertyMap";

// import the CSS for this page
import "./PropertyDetailPage.css";


function PropertyDetailPage() {

    // get the property ID from the URL
    const { id } = useParams();

    // allows us to navigate back to the listings page
    const navigate = useNavigate();

    // stores the property's information
    const [property, setProperty] = useState(null);

    // stores the property's open houses
    const [openHouses, setOpenHouses] = useState([]);

    // tracks whether the page is loading
    const [loading, setLoading] = useState(true);

    // stores an error message if something goes wrong
    const [error, setError] = useState(null);


    // reload property information whenever the property ID changes
    useEffect(() => {
        loadPropertyData();
    }, [id]);


    // gets the property and open house information from the backend
    async function loadPropertyData() {
        try {
            // show loading message while waiting
            setLoading(true);

            // clear any previous error
            setError(null);

            // request property details and open houses at the same time
            const [propertyData, openHousesData] = await Promise.all([
                fetchPropertyDetail(id),
                fetchOpenHouses(id)
            ]);

            // save the returned property data
            setProperty(propertyData);

            // save the returned open houses
            // use an empty array if there are no open houses
            setOpenHouses(openHousesData.openhouses || []);

        } catch (err) {
            // display the returned error message if one exists
            setError(
                err.message || "Failed to load property details"
            );

        } finally {
            // stop showing the loading message
            setLoading(false);
        }
    }


    // show this message while the property is loading
    if (loading) {
        return (
            <div className="loading">
                Loading property details...
            </div>
        );
    }


    // show an error message if the request failed
    if (error) {
        return (
            <div className="error-container">

                <div className="error">
                    {error}
                </div>

                {/* Go back to the main property listings page */}
                <button
                    onClick={() => navigate("/")}
                    className="btn-back"
                >
                    Back to Listings
                </button>

            </div>
        );
    }


    // don't display the page if no property was returned
    if (!property) {
        return null;
    }


    return (
        <div className="property-detail-page">

            {/* button for returning to the property listings */}
            <button
                onClick={() => navigate("/")}
                className="btn-back"
            >
                ← Back to Listings
            </button>


            {/* property price and address */}
            <div className="property-header">

                <h1>
                    ${property.L_SystemPrice?.toLocaleString()}
                </h1>

                <p className="property-address">
                    {property.L_Address}
                </p>

                <p className="property-location">
                    {property.L_City}, {property.L_State}{" "}
                    {property.L_Zip}
                </p>

            </div>


            {/* main property image gallery */}
            <div className="property-image-main">

                <PropertyImageGallery
                    photos={property.L_Photos}
                    address={property.L_Address}
                />

            </div>


            {/* main content area */}
            <div className="property-content">

                {/* left side of the page */}
                <div className="property-main">


                    {/* main property statistics + additional property details */}
                    <div className="property-section">

                        <h2>Property Details</h2>

                        <div className="property-stats">

                            {/* bedrooms */}
                            <div className="stat">
                                <div className="stat-value">
                                    {property.L_Keyword2}
                                </div>

                                <div className="stat-label">
                                    Bedrooms
                                </div>
                            </div>


                            {/* bathrooms */}
                            <div className="stat">
                                <div className="stat-value">
                                    {property.LM_Dec_3}
                                </div>

                                <div className="stat-label">
                                    Bathrooms
                                </div>
                            </div>


                            {/* square footage - only shown if the property has it */}
                            {property.LM_Int2_3 && (
                                <div className="stat">

                                    <div className="stat-value">
                                        {property.LM_Int2_3.toLocaleString()}
                                    </div>

                                    <div className="stat-label">
                                        Sq Ft
                                    </div>

                                </div>
                            )}


                            {/* year built - only shown if available */}
                            {property.YearBuilt && (
                                <div className="stat">

                                    <div className="stat-value">
                                        {property.YearBuilt}
                                    </div>

                                    <div className="stat-label">
                                        Year Built
                                    </div>

                                </div>
                            )}

                        </div>


                        <div className="detail-grid">


                            {/* property type */}
                            {property.PropertyType && (
                                <div className="detail-item">

                                    <span className="detail-label">
                                        Property Type:
                                    </span>

                                    <span className="detail-value">
                                        {property.PropertyType}
                                    </span>

                                </div>
                            )}


                            {/* property subtype */}
                            {property.PropertySubType && (
                                <div className="detail-item">

                                    <span className="detail-label">
                                        Property Subtype:
                                    </span>

                                    <span className="detail-value">
                                        {property.PropertySubType}
                                    </span>

                                </div>
                            )}


                            {/* lot size */}
                            {property.LotSizeAcres && (
                                <div className="detail-item">

                                    <span className="detail-label">
                                        Lot Size:
                                    </span>

                                    <span className="detail-value">
                                        {property.LotSizeAcres} acres
                                    </span>

                                </div>
                            )}


                            {/* parking spaces */}
                            {property.ParkingTotal && (
                                <div className="detail-item">

                                    <span className="detail-label">
                                        Parking Spaces:
                                    </span>

                                    <span className="detail-value">
                                        {property.ParkingTotal}
                                    </span>

                                </div>
                            )}

                        </div>

                    </div>


                    {property.L_Remarks && (
                        <div className="property-section">

                            <h2>Description</h2>

                            <p className="property-description">
                                {property.L_Remarks}
                            </p>

                        </div>
                    )}


                    {/* map - only show if latitude and longitude exist */}
                    {property.LMD_MP_Latitude &&
                        property.LMD_MP_Longitude && (

                        <div className="property-section">

                            <h2>Location</h2>

                            <PropertyMap
                                lat={property.LMD_MP_Latitude}
                                lng={property.LMD_MP_Longitude}
                                address={property.L_Address}
                                apiKey={
                                    process.env
                                        .REACT_APP_GOOGLE_MAPS_API_KEY
                                }
                            />

                        </div>
                    )}

                </div>


                {/* right side of the page */}
                <div className="property-sidebar">


                    {/* open house section */}
                    <div className="open-houses-section">

                        <h3>Open Houses</h3>

                        {/* check whether the property has open houses */}
                        {openHouses.length > 0 ? (

                            <div className="open-houses-list">

                                {/* create one display for every open house */}
                                {openHouses.map((oh, index) => (

                                    <div
                                        key={index}
                                        className="open-house-item"
                                    >

                                        {/* open house date */}
                                        <div className="oh-date">
                                            {new Date(
                                                oh.OpenHouseDate
                                            ).toLocaleDateString(
                                                "en-US",
                                                {
                                                    weekday: "long",
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric"
                                                }
                                            )}
                                        </div>


                                        {/* open house start/end times */}
                                        <div className="oh-time">
                                            {oh.OH_StartTime} -{" "}
                                            {oh.OH_EndTime}
                                        </div>


                                        {/* try to get the remarks from all_data */}
                                        {(() => {
                                            try {
                                                // convert the JSON string into an object
                                                const d = JSON.parse(
                                                    oh.all_data
                                                );

                                                // display remarks if they exist
                                                return d?.OpenHouseRemarks ? (
                                                    <div className="oh-remarks">
                                                        {
                                                            d.OpenHouseRemarks
                                                        }
                                                    </div>
                                                ) : null;

                                            } catch (e) {
                                                // if the JSON cannot be parsed,
                                                // don't display anything
                                                return null;
                                            }
                                        })()}

                                    </div>

                                ))}

                            </div>

                        ) : (

                            // display when there aren't any scheduled open houses
                            <p className="no-open-houses">
                                No open houses scheduled
                            </p>

                        )}

                    </div>


                    {/* listing information section */}
                    <div className="listing-info-section">

                        <h3>Listing Information</h3>

                        <div className="listing-info">


                            {/* MLS listing number */}
                            {property.L_ListingID && (
                                <div className="info-item">

                                    <span className="info-label">
                                        MLS #:
                                    </span>

                                    <span className="info-value">
                                        {property.L_ListingID}
                                    </span>

                                </div>
                            )}


                            {/* property status */}
                            {property.StandardStatus && (
                                <div className="info-item">

                                    <span className="info-label">
                                        Status:
                                    </span>

                                    <span className="info-value">
                                        {property.StandardStatus}
                                    </span>

                                </div>
                            )}


                            {/* date the property was listed */}
                            {property.ListingContractDate && (
                                <div className="info-item">

                                    <span className="info-label">
                                        Listed:
                                    </span>

                                    <span className="info-value">
                                        {new Date(
                                            property.ListingContractDate
                                        ).toLocaleDateString()}
                                    </span>

                                </div>
                            )}

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}


// allow PropertyDetailPage to be imported by App.js
export default PropertyDetailPage;