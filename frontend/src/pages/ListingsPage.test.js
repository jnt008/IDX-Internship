//import testing tools
import {
    render,
    screen,
    fireEvent,
    waitFor
} from "@testing-library/react";

//import the page we want to test
import ListingsPage from "./ListingsPage";

//import the API function so we can mock it
import { fetchProperties } from "../api/client";

//mock the API client
jest.mock("../api/client", () => ({
    fetchProperties: jest.fn()
}));

//mock PropertyFilters so we can easily test searching
jest.mock("../components/PropertyFilters", () => {
    return function MockPropertyFilters({ onSearch }) {
        return (
            <button
                onClick={() =>
                    onSearch({
                        city: "Portland"
                    })
                }
            >
                Test Search
            </button>
        );
    };
});

//mock PropertyCard so we only test ListingsPage behavior
jest.mock("../components/PropertyCard", () => {
    return function MockPropertyCard({ property }) {
        return (
            <div>
                Property {property.L_ListingID}
            </div>
        );
    };
});

//mock Pagination so we can easily test page changes
jest.mock("../components/Pagination", () => {
    return function MockPagination({
        currentPage,
        totalPages,
        onPageChange
    }) {
        return (
            <div>
                <span>
                    Page {currentPage} of {totalPages}
                </span>

                <button onClick={() => onPageChange(2)}>
                    Go to Page 2
                </button>
            </div>
        );
    };
});

describe("ListingsPage", () => {

    //mock scrollTo because it is not available in Jest
    beforeEach(() => {
        jest.clearAllMocks();

        window.scrollTo = jest.fn();
    });

    //test that loading message appears while waiting for properties
    test("shows loading message while properties are loading", () => {

        //keep the request waiting
        fetchProperties.mockReturnValue(
            new Promise(() => {})
        );

        //render the page
        render(<ListingsPage />);

        //check that the loading message appears
        expect(
            screen.getByText("Loading properties...")
        ).toBeInTheDocument();
    });

    //test that properties are displayed after a successful request
    test("displays properties after successful request", async () => {

        //fake property data returned from backend
        fetchProperties.mockResolvedValue({
            total: 25,
            results: [
                {
                    L_ListingID: "123"
                }
            ]
        });

        //render the page
        render(<ListingsPage />);

        //wait for the property to appear
        expect(
            await screen.findByText("Property 123")
        ).toBeInTheDocument();

        //check that the result count is shown
        expect(
            screen.getByText(/Showing 1–20 of 25 properties/)
        ).toBeInTheDocument();

        //check that the first request uses page 1
        expect(fetchProperties).toHaveBeenCalledWith({
            limit: 20,
            offset: 0
        });
    });

    //test that an error message appears when the API fails
    test("shows error message when property request fails", async () => {

        //fake a failed backend request
        fetchProperties.mockRejectedValue(
            new Error("Server error")
        );

        //render the page
        render(<ListingsPage />);

        //check that the error message appears
        expect(
            await screen.findByText(
                "Failed to load properties. Please try again."
            )
        ).toBeInTheDocument();
    });

    //test that no results message appears when no properties are returned
    test("shows no results message when property list is empty", async () => {

        //fake an empty backend response
        fetchProperties.mockResolvedValue({
            total: 0,
            results: []
        });

        //render the page
        render(<ListingsPage />);

        //check that the no results message appears
        expect(
            await screen.findByText(
                /No properties found matching your criteria/
            )
        ).toBeInTheDocument();
    });

    //test that changing filters sends the filters to the API
    test("loads new properties when filters change", async () => {

        //fake property data
        fetchProperties.mockResolvedValue({
            total: 1,
            results: [
                {
                    L_ListingID: "123"
                }
            ]
        });

        //render the page
        render(<ListingsPage />);

        //wait for the first request to finish
        await screen.findByText("Property 123");

        //click the mocked search button
        fireEvent.click(
            screen.getByText("Test Search")
        );

        //check that the city filter was sent
        await waitFor(() => {
            expect(fetchProperties).toHaveBeenCalledWith({
                city: "Portland",
                limit: 20,
                offset: 0
            });
        });
    });

    //test that changing pages updates the offset
    test("loads the next page when page changes", async () => {

        //fake enough properties for multiple pages
        fetchProperties.mockResolvedValue({
            total: 40,
            results: [
                {
                    L_ListingID: "123"
                }
            ]
        });

        //render the page
        render(<ListingsPage />);

        //wait for the property data
        await screen.findByText("Property 123");

        //click the mocked page 2 button
        fireEvent.click(
            screen.getByText("Go to Page 2")
        );

        //check that page 2 uses an offset of 20
        await waitFor(() => {
            expect(fetchProperties).toHaveBeenCalledWith({
                limit: 20,
                offset: 20
            });
        });

        //check that changing pages scrolls to the top
        expect(window.scrollTo).toHaveBeenCalledWith(
            0,
            0
        );
    });

    //test that selecting a sort field adds sorting to the request
    test("loads properties with selected sort field", async () => {

        //fake property data
        fetchProperties.mockResolvedValue({
            total: 1,
            results: [
                {
                    L_ListingID: "123"
                }
            ]
        });

        //render the page
        render(<ListingsPage />);

        //wait for the first request
        await screen.findByText("Property 123");

        //get the sort dropdown
        const sortSelect =
            screen.getAllByRole("combobox")[0];

        //choose price sorting
        fireEvent.change(sortSelect, {
            target: {
                value: "L_SystemPrice"
            }
        });

        //check that sorting was added to the request
        await waitFor(() => {
            expect(fetchProperties).toHaveBeenCalledWith({
                limit: 20,
                offset: 0,
                sortBy: "L_SystemPrice",
                sortOrder: "ASC"
            });
        });
    });

    //test that changing sort direction updates the request
    test("changes sort order to descending", async () => {

        //fake property data
        fetchProperties.mockResolvedValue({
            total: 1,
            results: [
                {
                    L_ListingID: "123"
                }
            ]
        });

        //render the page
        render(<ListingsPage />);

        //wait for the first request
        await screen.findByText("Property 123");

        //get the original sort dropdown
        const sortSelect =
            screen.getAllByRole("combobox")[0];

        //choose price sorting
        fireEvent.change(sortSelect, {
            target: {
                value: "L_SystemPrice"
            }
        });

        //wait until the direction dropdown appears
        await waitFor(() => {
            expect(
                screen.getAllByRole("combobox")
            ).toHaveLength(2);
        });

        //get the direction dropdown
        const directionSelect =
            screen.getAllByRole("combobox")[1];

        //choose descending order
        fireEvent.change(directionSelect, {
            target: {
                value: "DESC"
            }
        });

        //check that the request uses descending order
        await waitFor(() => {
            expect(fetchProperties).toHaveBeenCalledWith({
                limit: 20,
                offset: 0,
                sortBy: "L_SystemPrice",
                sortOrder: "DESC"
            });
        });
    });
});