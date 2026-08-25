// import React's useState hook
import { useState } from "react";

// import the CSS for this component
import "./PropertyImageCarousel.css";

// Displays a carousel of property images.
function PropertyImageCarousel({ photos, address }) {

    // stores the index of the image currently being displayed
    const [currentIndex, setCurrentIndex] = useState(0);

    // L_Photos is stored as a JSON string in the database,
    // so convert it into a JavaScript array
    let photoList = [];

    try {
        // if photos exists, parse it into an array
        // otherwise use an empty array
        photoList = photos ? JSON.parse(photos) : [];
    } catch {
        // if parsing fails, treat the value as a single image URL
        photoList = photos ? [photos] : [];
    }

    // show a placeholder if there are no images
    if (photoList.length === 0) {
        return (
            <div className="carousel-no-image">
                No image available
            </div>
        );
    }

    // display the previous image
    const prev = (e) => {

        // prevent clicking the button from triggering
        // the property card's onClick event
        e.stopPropagation();

        // move to the previous image
        // if already on the first image, wrap to the last one
        setCurrentIndex((i) =>
            i === 0 ? photoList.length - 1 : i - 1
        );
    };

    // display the next image
    const next = (e) => {

        // prevent clicking the button from triggering
        // the property card's onClick event
        e.stopPropagation();

        // move to the next image
        // if already on the last image, wrap back to the first
        setCurrentIndex((i) =>
            i === photoList.length - 1 ? 0 : i + 1
        );
    };

    return (
        <div className="carousel">

            {/* Display the current image */}
            <img
                src={photoList[currentIndex]}
                alt={`${address} ${currentIndex + 1}`}
                className="carousel-img"
            />

            {/* Only show controls if there is more than one image */}
            {photoList.length > 1 && (
                <>

                    {/* Previous image button */}
                    <button
                        className="carousel-btn carousel-prev"
                        onClick={prev}
                    >
                        &#8249;
                    </button>

                    {/* Next image button */}
                    <button
                        className="carousel-btn carousel-next"
                        onClick={next}
                    >
                        &#8250;
                    </button>

                    {/* Display the current image number */}
                    <div className="carousel-counter">
                        {currentIndex + 1} / {photoList.length}
                    </div>

                </>
            )}

        </div>
    );
}

// allow this component to be imported into other files
export default PropertyImageCarousel;