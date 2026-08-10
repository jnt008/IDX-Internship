//import the css for the map component
import "./PropertyMap.css";

//display a Google Map for the selected property
function PropertyMap({ lat, lng, address, apiKey }) {

    //show a message if no Google Maps API key was provided
    if (!apiKey) {
        return (
            <div className="map-no-key">
                <p>Google Maps API key not configured.</p>
                <p>Add REACT_APP_GOOGLE_MAPS_API_KEY to your .env file.</p>
            </div>
        );
    }

    //build the Google Maps embed URL using the property's coordinates
    const src =
        `https://www.google.com/maps/embed/v1/place` +
        `?key=${apiKey}` +
        `&q=${lat},${lng}` +
        `&zoom=15` +
        `&maptype=roadmap`;

    return (
        <div className="property-map-wrapper">

            {/* Display the embedded Google Map. */}
            <iframe
                title={`Map of ${address}`}
                src={src}
                className="property-map-iframe"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
            />

            {/* Link that opens Google Maps directions in a new tab. */}
            <a
                className="map-directions-link"
                href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                Get Directions ↗
            </a>

        </div>
    );
}

//allow this component to be used by other files
export default PropertyMap;