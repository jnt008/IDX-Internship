//import testing tools
import {
    render,
    screen,
    fireEvent
} from "@testing-library/react";

//import the image gallery component
import PropertyImageGallery from "./PropertyImageGallery";

describe("PropertyImageGallery", () => {

    //checks that a message appears when there are no photos
    test("shows no photos message when photos are empty", () => {
        render(
            <PropertyImageGallery
                photos="[]"
                address="123 Main St"
            />
        );

        expect(
            screen.getByText("No photos available")
        ).toBeInTheDocument();
    });

    //checks that missing photos also show the fallback message
    test("shows no photos message when photos are missing", () => {
        render(
            <PropertyImageGallery
                photos={null}
                address="123 Main St"
            />
        );

        expect(
            screen.getByText("No photos available")
        ).toBeInTheDocument();
    });

    //checks that one image is displayed correctly
    test("renders a single property image", () => {
        const photos = JSON.stringify([
            "https://example.com/photo1.jpg"
        ]);

        render(
            <PropertyImageGallery
                photos={photos}
                address="123 Main St"
            />
        );

        const mainImage = screen.getByAltText(
            "123 Main St - main"
        );

        expect(mainImage).toHaveAttribute(
            "src",
            "https://example.com/photo1.jpg"
        );

        expect(
            screen.getByText("1 photos — click to view")
        ).toBeInTheDocument();
    });

    //checks that thumbnails appear when there are multiple photos
    test("renders thumbnails for multiple photos", () => {
        const photos = JSON.stringify([
            "https://example.com/photo1.jpg",
            "https://example.com/photo2.jpg",
            "https://example.com/photo3.jpg"
        ]);

        render(
            <PropertyImageGallery
                photos={photos}
                address="123 Main St"
            />
        );

        expect(
            screen.getByAltText("123 Main St thumbnail 1")
        ).toBeInTheDocument();

        expect(
            screen.getByAltText("123 Main St thumbnail 2")
        ).toBeInTheDocument();

        expect(
            screen.getByAltText("123 Main St thumbnail 3")
        ).toBeInTheDocument();
    });

    //checks that clicking a thumbnail changes the main image
    test("changes main image when thumbnail is clicked", () => {
        const photos = JSON.stringify([
            "https://example.com/photo1.jpg",
            "https://example.com/photo2.jpg"
        ]);

        render(
            <PropertyImageGallery
                photos={photos}
                address="123 Main St"
            />
        );

        const secondThumbnail = screen.getByAltText(
            "123 Main St thumbnail 2"
        );

        fireEvent.click(secondThumbnail);

        expect(
            screen.getByAltText("123 Main St - main")
        ).toHaveAttribute(
            "src",
            "https://example.com/photo2.jpg"
        );
    });

    //checks that invalid JSON is treated as a single photo
    test("uses raw photo value when JSON parsing fails", () => {
        const photo =
            "https://example.com/single-photo.jpg";

        render(
            <PropertyImageGallery
                photos={photo}
                address="123 Main St"
            />
        );

        expect(
            screen.getByAltText("123 Main St - main")
        ).toHaveAttribute(
            "src",
            photo
        );
    });

    //checks that clicking the main image opens the lightbox
    test("opens lightbox when main image is clicked", () => {
        const photos = JSON.stringify([
            "https://example.com/photo1.jpg",
            "https://example.com/photo2.jpg"
        ]);

        render(
            <PropertyImageGallery
                photos={photos}
                address="123 Main St"
            />
        );

        fireEvent.click(
            screen.getByAltText("123 Main St - main")
                .closest(".gallery-main")
        );

        expect(
            screen.getByRole("dialog")
        ).toBeInTheDocument();

        expect(
            screen.getByText("1 / 2")
        ).toBeInTheDocument();
    });

    //checks that the close button closes the lightbox
    test("closes lightbox when close button is clicked", () => {
        const photos = JSON.stringify([
            "https://example.com/photo1.jpg"
        ]);

        render(
            <PropertyImageGallery
                photos={photos}
                address="123 Main St"
            />
        );

        fireEvent.click(
            screen.getByAltText("123 Main St - main")
                .closest(".gallery-main")
        );

        const closeButton =
            document.querySelector(".lightbox-close");

        fireEvent.click(closeButton);

        expect(
            screen.queryByRole("dialog")
        ).not.toBeInTheDocument();
    });

    //checks that clicking the overlay closes the lightbox
    test("closes lightbox when overlay is clicked", () => {
        const photos = JSON.stringify([
            "https://example.com/photo1.jpg"
        ]);

        render(
            <PropertyImageGallery
                photos={photos}
                address="123 Main St"
            />
        );

        fireEvent.click(
            screen.getByAltText("123 Main St - main")
                .closest(".gallery-main")
        );

        fireEvent.click(
            screen.getByRole("dialog")
        );

        expect(
            screen.queryByRole("dialog")
        ).not.toBeInTheDocument();
    });

    //checks that the next button moves to the next image
    test("moves to next image in lightbox", () => {
        const photos = JSON.stringify([
            "https://example.com/photo1.jpg",
            "https://example.com/photo2.jpg"
        ]);

        render(
            <PropertyImageGallery
                photos={photos}
                address="123 Main St"
            />
        );

        fireEvent.click(
            screen.getByAltText("123 Main St - main")
                .closest(".gallery-main")
        );

        const nextButton =
            document.querySelector(".lightbox-next");

        fireEvent.click(nextButton);

        expect(
            screen.getByText("2 / 2")
        ).toBeInTheDocument();
    });

    //checks that next wraps back to the first image
    test("wraps to first image after last image", () => {
        const photos = JSON.stringify([
            "https://example.com/photo1.jpg",
            "https://example.com/photo2.jpg"
        ]);

        render(
            <PropertyImageGallery
                photos={photos}
                address="123 Main St"
            />
        );

        fireEvent.click(
            screen.getByAltText("123 Main St - main")
                .closest(".gallery-main")
        );

        const nextButton =
            document.querySelector(".lightbox-next");

        fireEvent.click(nextButton);
        fireEvent.click(nextButton);

        expect(
            screen.getByText("1 / 2")
        ).toBeInTheDocument();
    });

    //checks that previous wraps from first image to last image
    test("wraps to last image when Previous is clicked on first image", () => {
        const photos = JSON.stringify([
            "https://example.com/photo1.jpg",
            "https://example.com/photo2.jpg"
        ]);

        render(
            <PropertyImageGallery
                photos={photos}
                address="123 Main St"
            />
        );

        fireEvent.click(
            screen.getByAltText("123 Main St - main")
                .closest(".gallery-main")
        );

        const prevButton =
            document.querySelector(".lightbox-prev");

        fireEvent.click(prevButton);

        expect(
            screen.getByText("2 / 2")
        ).toBeInTheDocument();
    });

    //checks that Escape closes the lightbox
    test("closes lightbox with Escape key", () => {
        const photos = JSON.stringify([
            "https://example.com/photo1.jpg"
        ]);

        render(
            <PropertyImageGallery
                photos={photos}
                address="123 Main St"
            />
        );

        fireEvent.click(
            screen.getByAltText("123 Main St - main")
                .closest(".gallery-main")
        );

        fireEvent.keyDown(
            screen.getByRole("dialog"),
            {
                key: "Escape"
            }
        );

        expect(
            screen.queryByRole("dialog")
        ).not.toBeInTheDocument();
    });

    //checks keyboard navigation to the next image
    test("moves to next image with ArrowRight key", () => {
        const photos = JSON.stringify([
            "https://example.com/photo1.jpg",
            "https://example.com/photo2.jpg"
        ]);

        render(
            <PropertyImageGallery
                photos={photos}
                address="123 Main St"
            />
        );

        fireEvent.click(
            screen.getByAltText("123 Main St - main")
                .closest(".gallery-main")
        );

        fireEvent.keyDown(
            screen.getByRole("dialog"),
            {
                key: "ArrowRight"
            }
        );

        expect(
            screen.getByText("2 / 2")
        ).toBeInTheDocument();
    });

    //checks keyboard navigation to the previous image
    test("moves to previous image with ArrowLeft key", () => {
        const photos = JSON.stringify([
            "https://example.com/photo1.jpg",
            "https://example.com/photo2.jpg"
        ]);

        render(
            <PropertyImageGallery
                photos={photos}
                address="123 Main St"
            />
        );

        fireEvent.click(
            screen.getByAltText("123 Main St - main")
                .closest(".gallery-main")
        );

        fireEvent.keyDown(
            screen.getByRole("dialog"),
            {
                key: "ArrowLeft"
            }
        );

        expect(
            screen.getByText("2 / 2")
        ).toBeInTheDocument();
    });
});