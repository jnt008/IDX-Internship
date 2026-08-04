// import testing tools
import { render, screen, fireEvent } from "@testing-library/react";

// import the pagination component
import Pagination from "./Pagination";

describe("Pagination", () => {
    // checks that the pagination buttons and page numbers appear
    test("renders pagination controls", () => {
        const onPageChange = jest.fn();

        render(
            <Pagination
                currentPage={1}
                totalPages={5}
                onPageChange={onPageChange}
            />
        );

        expect(screen.getByText("← Previous")).toBeInTheDocument();
        expect(screen.getByText("Next →")).toBeInTheDocument();
        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("5")).toBeInTheDocument();
    });

    // checks that Previous is disabled on page 1
    test("disables Previous button on first page", () => {
        const onPageChange = jest.fn();

        render(
            <Pagination
                currentPage={1}
                totalPages={5}
                onPageChange={onPageChange}
            />
        );

        const prevButton = screen.getByText("← Previous");

        expect(prevButton).toBeDisabled();
    });

    // checks that Next is disabled on the final page
    test("disables Next button on last page", () => {
        const onPageChange = jest.fn();

        render(
            <Pagination
                currentPage={5}
                totalPages={5}
                onPageChange={onPageChange}
            />
        );

        const nextButton = screen.getByText("Next →");

        expect(nextButton).toBeDisabled();
    });

    // checks that clicking Next requests the next page
    test("calls onPageChange when Next is clicked", () => {
        const onPageChange = jest.fn();

        render(
            <Pagination
                currentPage={2}
                totalPages={5}
                onPageChange={onPageChange}
            />
        );

        const nextButton = screen.getByText("Next →");

        fireEvent.click(nextButton);

        expect(onPageChange).toHaveBeenCalledWith(3);
    });

    // checks that clicking Previous requests the previous page
    test("calls onPageChange when Previous is clicked", () => {
        const onPageChange = jest.fn();

        render(
            <Pagination
                currentPage={3}
                totalPages={5}
                onPageChange={onPageChange}
            />
        );

        const prevButton = screen.getByText("← Previous");

        fireEvent.click(prevButton);

        expect(onPageChange).toHaveBeenCalledWith(2);
    });

    // checks that clicking a page number requests that page
    test("calls onPageChange when page number is clicked", () => {
        const onPageChange = jest.fn();

        render(
            <Pagination
                currentPage={1}
                totalPages={5}
                onPageChange={onPageChange}
            />
        );

        const page3Button = screen.getByText("3");

        fireEvent.click(page3Button);

        expect(onPageChange).toHaveBeenCalledWith(3);
    });

    // checks that the current page has the active class
    test("highlights current page", () => {
        const onPageChange = jest.fn();

        render(
            <Pagination
                currentPage={3}
                totalPages={5}
                onPageChange={onPageChange}
            />
        );

        const page3Button = screen.getByText("3");

        expect(page3Button).toHaveClass("active");
    });

    // checks that pagination is hidden when only one page exists
    test("does not render when totalPages is 1", () => {
        const onPageChange = jest.fn();

        const { container } = render(
            <Pagination
                currentPage={1}
                totalPages={1}
                onPageChange={onPageChange}
            />
        );

        expect(container).toBeEmptyDOMElement();
    });
});