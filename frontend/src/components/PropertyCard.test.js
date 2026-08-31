//import testing tools
import { render, screen, fireEvent } from "@testing-library/react";

//import the component
import PropertyCard from "./PropertyCard";

//mock react router navigation
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate
}));

describe("PropertyCard", () => {

    //clear old navigation calls before each test
    beforeEach(() => {
        mockNavigate.mockClear();
    });

    //test that property information displays correctly
    test("renders property information", () => {

        //create fake property data
        const property = {
            L_ListingID: "123",
            L_SystemPrice: 500000,
            L_Address: "123 Main St",
            L_City: "Portland",
            L_State: "OR",
            L_Keyword2: 3,
            LM_Dec_3: 2,
            LM_Int2_3: 1500,
            L_Photos: JSON.stringify([
                "https://example.com/photo.jpg"
            ])
        };

        //render the property card
        render(<PropertyCard property={property} />);

        //check that the price is displayed
        expect(
            screen.getByText("$500,000")
        ).toBeInTheDocument();

        //check that the address is displayed
        expect(
            screen.getByText("123 Main St")
        ).toBeInTheDocument();

        //check that the city and state are displayed
        expect(
            screen.getByText("Portland, OR")
        ).toBeInTheDocument();

        //check that bed and bath information is displayed
        expect(
            screen.getByText("3 beds")
        ).toBeInTheDocument();

        expect(
            screen.getByText("2 baths")
        ).toBeInTheDocument();

        //check that square footage is displayed
        expect(
            screen.getByText("1,500 sqft")
        ).toBeInTheDocument();
    });

    //test that the first property photo is displayed
    test("renders the first property image", () => {

        const property = {
            L_ListingID: "123",
            L_Address: "123 Main St",
            L_Photos: JSON.stringify([
                "https://example.com/photo1.jpg",
                "https://example.com/photo2.jpg"
            ])
        };

        render(<PropertyCard property={property} />);

        //find the image by its alt text
        const image = screen.getByAltText("123 Main St");

        //check that only the first photo is used
        expect(image).toHaveAttribute(
            "src",
            "https://example.com/photo1.jpg"
        );
    });

    //test that the card navigates to the property detail page
    test("navigates to property detail page when clicked", () => {

        const property = {
            L_ListingID: "123",
            L_Photos: "[]"
        };

        render(<PropertyCard property={property} />);

        //click the property card
        fireEvent.click(
            screen.getByText("Price unavailable").closest(
                ".property-card"
            )
        );

        //check that navigation used the correct property ID
        expect(mockNavigate).toHaveBeenCalledWith(
            "/property/123"
        );
    });

    //test that no image message appears when photos are empty
    test("shows no image message when there are no photos", () => {

        const property = {
            L_ListingID: "123",
            L_Photos: "[]"
        };

        render(<PropertyCard property={property} />);

        expect(
            screen.getByText("No image available")
        ).toBeInTheDocument();
    });

    //test that invalid photo JSON does not crash the component
    test("shows no image message when photo data is invalid", () => {

        const property = {
            L_ListingID: "123",
            L_Photos: "not valid json"
        };

        render(<PropertyCard property={property} />);

        expect(
            screen.getByText("No image available")
        ).toBeInTheDocument();
    });

    //test that a failed image switches to the fallback message
    test("shows no image message when image fails to load", () => {

        const property = {
            L_ListingID: "123",
            L_Address: "123 Main St",
            L_Photos: JSON.stringify([
                "https://example.com/broken.jpg"
            ])
        };

        render(<PropertyCard property={property} />);

        //find the property image
        const image = screen.getByAltText("123 Main St");

        //simulate an image loading error
        fireEvent.error(image);

        //check that the fallback message appears
        expect(
            screen.getByText("No image available")
        ).toBeInTheDocument();
    });

    //test fallback text when price and address are missing
    test("shows fallback text for missing property information", () => {

        const property = {
            L_ListingID: "123",
            L_City: "Portland",
            L_State: "OR",
            L_Keyword2: 3,
            LM_Dec_3: 2,
            L_Photos: "[]"
        };

        render(<PropertyCard property={property} />);

        expect(
            screen.getByText("Price unavailable")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Address unavailable")
        ).toBeInTheDocument();
    });

    //test that square footage is hidden when it is missing
    test("does not show square footage when size is missing", () => {

        const property = {
            L_ListingID: "123",
            L_City: "Portland",
            L_State: "OR",
            L_Keyword2: 3,
            LM_Dec_3: 2,
            L_Photos: "[]"
        };

        render(<PropertyCard property={property} />);

        //check that sqft text does not appear
        expect(
            screen.queryByText(/sqft/i)
        ).not.toBeInTheDocument();
    });
});