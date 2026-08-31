//import testing tools
import {
    render,
    screen,
    fireEvent,
    waitFor
} from "@testing-library/react";

//import the page we want to test
import PropertyDetailPage from "./PropertyDetailPage";

//import API functions so we can mock them
import {
    fetchPropertyDetail,
    fetchOpenHouses
} from "../api/client";

//mock the API functions
jest.mock("../api/client", () => ({
    fetchPropertyDetail: jest.fn(),
    fetchOpenHouses: jest.fn()
}));

//mock React Router
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    useParams: () => ({
        id: "123"
    }),

    useNavigate: () => mockNavigate
}));

//mock the image gallery
jest.mock("../components/PropertyImageGallery", () => {
    return function MockPropertyImageGallery() {
        return <div>Property Image Gallery</div>;
    };
});

//mock the property map
jest.mock("../components/PropertyMap", () => {
    return function MockPropertyMap() {
        return <div>Property Map</div>;
    };
});

describe("PropertyDetailPage", () => {

    //basic property used by multiple tests
    const mockProperty = {
        L_ListingID: "123",
        L_SystemPrice: 500000,
        L_Address: "123 Main Street",
        L_City: "San Jose",
        L_State: "CA",
        L_Zip: "95112",
        L_Keyword2: 3,
        LM_Dec_3: 2,
        LM_Int2_3: 1500,
        L_Photos: "[]"
    };

    beforeEach(() => {
        //clear previous mock calls
        jest.clearAllMocks();
    });

    //checks that the loading message appears while data is loading
    test("shows loading message while property data is loading", () => {

        //leave both requests unresolved
        fetchPropertyDetail.mockReturnValue(
            new Promise(() => {})
        );

        fetchOpenHouses.mockReturnValue(
            new Promise(() => {})
        );

        render(<PropertyDetailPage />);

        expect(
            screen.getByText("Loading property details...")
        ).toBeInTheDocument();
    });

    //checks that the property information appears after loading
    test("displays property details successfully", async () => {

        fetchPropertyDetail.mockResolvedValue(mockProperty);

        fetchOpenHouses.mockResolvedValue({
            openhouses: []
        });

        render(<PropertyDetailPage />);

        expect(
            await screen.findByText("$500,000")
        ).toBeInTheDocument();

        expect(
            screen.getByText("123 Main Street")
        ).toBeInTheDocument();

        expect(
            screen.getByText(/San Jose/)
        ).toBeInTheDocument();

        expect(
            screen.getByText("3")
        ).toBeInTheDocument();

        expect(
            screen.getByText("2")
        ).toBeInTheDocument();

        expect(
            screen.getByText("1,500")
        ).toBeInTheDocument();
    });

    //checks that the image gallery is displayed
    test("displays the property image gallery", async () => {

        fetchPropertyDetail.mockResolvedValue(mockProperty);

        fetchOpenHouses.mockResolvedValue({
            openhouses: []
        });

        render(<PropertyDetailPage />);

        expect(
            await screen.findByText("Property Image Gallery")
        ).toBeInTheDocument();
    });

    //checks that a property with no open houses shows a message
    test("shows message when there are no open houses", async () => {

        fetchPropertyDetail.mockResolvedValue(mockProperty);

        fetchOpenHouses.mockResolvedValue({
            openhouses: []
        });

        render(<PropertyDetailPage />);

        expect(
            await screen.findByText(
                "No open houses scheduled"
            )
        ).toBeInTheDocument();
    });

    //checks that missing open house data is treated as an empty array
    test("handles missing openhouses array", async () => {

        fetchPropertyDetail.mockResolvedValue(mockProperty);

        //backend response does not contain openhouses
        fetchOpenHouses.mockResolvedValue({});

        render(<PropertyDetailPage />);

        expect(
            await screen.findByText(
                "No open houses scheduled"
            )
        ).toBeInTheDocument();
    });

    //checks that open house information appears
    test("displays open house information", async () => {

        fetchPropertyDetail.mockResolvedValue(mockProperty);

        fetchOpenHouses.mockResolvedValue({
            openhouses: [
                {
                    OpenHouseDate: "2026-09-05",
                    OH_StartTime: "1:00 PM",
                    OH_EndTime: "3:00 PM",
                    all_data: JSON.stringify({
                        OpenHouseRemarks: "Come see this home!"
                    })
                }
            ]
        });

        render(<PropertyDetailPage />);

        expect(
            await screen.findByText("1:00 PM - 3:00 PM")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Come see this home!")
        ).toBeInTheDocument();
    });

    //checks that invalid open house JSON does not crash the page
    test("handles invalid open house remarks JSON", async () => {

        fetchPropertyDetail.mockResolvedValue(mockProperty);

        fetchOpenHouses.mockResolvedValue({
            openhouses: [
                {
                    OpenHouseDate: "2026-09-05",
                    OH_StartTime: "1:00 PM",
                    OH_EndTime: "3:00 PM",
                    all_data: "invalid json"
                }
            ]
        });

        render(<PropertyDetailPage />);

        expect(
            await screen.findByText("1:00 PM - 3:00 PM")
        ).toBeInTheDocument();
    });

    //checks that API errors are displayed
    test("shows error message when property request fails", async () => {

        fetchPropertyDetail.mockRejectedValue(
            new Error("Property not found")
        );

        fetchOpenHouses.mockResolvedValue({
            openhouses: []
        });

        render(<PropertyDetailPage />);

        expect(
            await screen.findByText("Property not found")
        ).toBeInTheDocument();
    });

    //checks that the back button navigates to the listings page
    test("navigates back to listings when Back button is clicked", async () => {

        fetchPropertyDetail.mockResolvedValue(mockProperty);

        fetchOpenHouses.mockResolvedValue({
            openhouses: []
        });

        render(<PropertyDetailPage />);

        const backButton = await screen.findByText(
            "← Back to Listings"
        );

        fireEvent.click(backButton);

        expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    //checks optional property information
    test("displays optional property details when available", async () => {

        const completeProperty = {
            ...mockProperty,
            YearBuilt: 2020,
            PropertyType: "Residential",
            PropertySubType: "Single Family",
            LotSizeAcres: 0.25,
            ParkingTotal: 2,
            L_Remarks: "Beautiful family home.",
            StandardStatus: "Active",
            ListingContractDate: "2026-08-15"
        };

        fetchPropertyDetail.mockResolvedValue(
            completeProperty
        );

        fetchOpenHouses.mockResolvedValue({
            openhouses: []
        });

        render(<PropertyDetailPage />);

        expect(
            await screen.findByText("2020")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Residential")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Single Family")
        ).toBeInTheDocument();

        expect(
            screen.getByText("0.25 acres")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Beautiful family home.")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Active")
        ).toBeInTheDocument();
    });

    //checks that the map appears when coordinates are available
    test("displays map when latitude and longitude exist", async () => {

        const propertyWithLocation = {
            ...mockProperty,
            LMD_MP_Latitude: 37.3382,
            LMD_MP_Longitude: -121.8863
        };

        fetchPropertyDetail.mockResolvedValue(
            propertyWithLocation
        );

        fetchOpenHouses.mockResolvedValue({
            openhouses: []
        });

        render(<PropertyDetailPage />);

        expect(
            await screen.findByText("Property Map")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Location")
        ).toBeInTheDocument();
    });
});