//import useState
import { useState } from "react";

//import the css for this component
import "./PropertyImageGallery.css";

function PropertyImageGallery({ photos, address }) {

    //tracks which image is currently selected
    const [activeIndex, setActiveIndex] = useState(0);

    //tracks whether the lightbox is open
    const [lightboxOpen, setLightboxOpen] = useState(false);

    //tracks which image is displayed in the lightbox
    const [lightboxIndex, setLightboxIndex] = useState(0);

    //stores the list of property photos
    let photoList = [];

    try {
        //parse the photo json into an array
        photoList = photos ? JSON.parse(photos) : [];
    } catch {
        //use the photo as a single image if parsing fails
        photoList = photos ? [photos] : [];
    }

    //show a message if there are no photos
    if (photoList.length === 0) {
        return (
            <div className="gallery-no-image">
                No photos available
            </div>
        );
    }

    //opens the lightbox on the selected image
    const openLightbox = (index) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    //closes the lightbox
    const closeLightbox = () => {
        setLightboxOpen(false);
    };

    //shows the previous image in the lightbox
    const lightboxPrev = (e) => {
        //prevent the lightbox from closing
        e.stopPropagation();

        //go to the previous image or wrap to the last image
        setLightboxIndex((i) =>
            i === 0 ? photoList.length - 1 : i - 1
        );
    };

    //shows the next image in the lightbox
    const lightboxNext = (e) => {
        //prevent the lightbox from closing
        e.stopPropagation();

        //go to the next image or wrap to the first image
        setLightboxIndex((i) =>
            i === photoList.length - 1 ? 0 : i + 1
        );
    };

    //handles keyboard controls for the lightbox
    const handleKeyDown = (e) => {

        //close the lightbox with the escape key
        if (e.key === "Escape") {
            closeLightbox();
        }

        //go to the previous image with the left arrow
        if (e.key === "ArrowLeft") {
            setLightboxIndex((i) =>
                i === 0 ? photoList.length - 1 : i - 1
            );
        }

        //go to the next image with the right arrow
        if (e.key === "ArrowRight") {
            setLightboxIndex((i) =>
                i === photoList.length - 1 ? 0 : i + 1
            );
        }
    };

    return (
        <>

            {/* display the main selected image */}
            <div
                className="gallery-main"
                onClick={() => openLightbox(activeIndex)}
            >
                <img
                    src={photoList[activeIndex]}
                    alt={`${address} - main`}
                    className="gallery-main-img"
                />

                {/* show the total number of property photos */}
                <div className="gallery-photo-count">
                    {photoList.length} photos — click to view
                </div>
            </div>

            {/* show thumbnails if there is more than one photo */}
            {photoList.length > 1 && (
                <div className="gallery-thumbs">

                    {/* create a thumbnail for each property photo */}
                    {photoList.map((url, i) => (
                        <img
                            key={i}
                            src={url}
                            alt={`${address} thumbnail ${i + 1}`}
                            className={`gallery-thumb${
                                i === activeIndex ? " active" : ""
                            }`}
                            onClick={() => setActiveIndex(i)}
                        />
                    ))}

                </div>
            )}

            {/* display the lightbox when it is open */}
            {lightboxOpen && (
                <div
                    className="lightbox-overlay"
                    onClick={closeLightbox}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                    role="dialog"
                    aria-label="Photo lightbox"
                >

                    {/* close the lightbox */}
                    <button
                        className="lightbox-close"
                        onClick={closeLightbox}
                    >
                        &#x2715;
                    </button>

                    {/* show the previous image */}
                    <button
                        className="lightbox-btn lightbox-prev"
                        onClick={lightboxPrev}
                    >
                        &#8249;
                    </button>

                    {/* display the current lightbox image */}
                    <img
                        src={photoList[lightboxIndex]}
                        alt={`${address}  ${lightboxIndex + 1}`}
                        className="lightbox-img"
                        onClick={(e) => e.stopPropagation()}
                    />

                    {/* show the next image */}
                    <button
                        className="lightbox-btn lightbox-next"
                        onClick={lightboxNext}
                    >
                        &#8250;
                    </button>

                    {/* show the current image number */}
                    <div className="lightbox-counter">
                        {lightboxIndex + 1} / {photoList.length}
                    </div>

                </div>
            )}

        </>
    );
}

//allow this component to be imported by other files
export default PropertyImageGallery;