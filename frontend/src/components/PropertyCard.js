import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Displays one individual property.
function PropertyCard({ property }) {
    // allows this card to navigate to another page
    const navigate = useNavigate();

    // tracks whether the image failed to load
    const [imageFailed, setImageFailed] = useState(false);

    // runs when the user clicks the property card
    const handleClick = () => {
        navigate(`/property/${property.L_ListingID}`);
    };

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
        <div
            className="property-card"
            onClick={handleClick}
        >
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

export default PropertyCard;