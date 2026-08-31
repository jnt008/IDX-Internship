// import testing tools
import { render, screen, fireEvent } from "@testing-library/react";

// import the pagination component
import Pagination from "./Pagination";

describe("Pagination", () => {

    // checks that pagination is hidden when there is only one page
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

    // checks that pagination is hidden when there are no pages
    test("does not render when totalPages is 0", () => {
        const onPageChange = jest.fn();

        const { container } = render(
            <Pagination
                currentPage={1}
                totalPages={0}
                onPageChange={onPageChange}
            />
        );

        expect(container).toBeEmptyDOMElement();
    });

    // checks that all page numbers appear when there are 7 pages or fewer
    test("renders all page numbers when totalPages is 7 or less", () => {
        const onPageChange = jest.fn();

        render(
            <Pagination
                currentPage={3}
                totalPages={5}
                onPageChange={onPageChange}
            />
        );

        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getByText("4")).toBeInTheDocument();
        expect(screen.getByText("5")).toBeInTheDocument();
    });

    // checks that the current page is highlighted
    test("highlights the current page", () => {
        const onPageChange = jest.fn();

        render(
            <Pagination
                currentPage={3}
                totalPages={5}
                onPageChange={onPageChange}
            />
        );

        expect(screen.getByText("3")).toHaveClass("active");
    });

    // checks that Previous is disabled on the first page
    test("disables Previous button on first page", () => {
        const onPageChange = jest.fn();

        render(
            <Pagination
                currentPage={1}
                totalPages={5}
                onPageChange={onPageChange}
            />
        );

        expect(screen.getByText("← Previous")).toBeDisabled();
    });

    // checks that Next is disabled on the last page
    test("disables Next button on last page", () => {
        const onPageChange = jest.fn();

        render(
            <Pagination
                currentPage={5}
                totalPages={5}
                onPageChange={onPageChange}
            />
        );

        expect(screen.getByText("Next →")).toBeDisabled();
    });

    // checks that clicking Previous moves back one page
    test("calls onPageChange when Previous is clicked", () => {
        const onPageChange = jest.fn();

        render(
            <Pagination
                currentPage={3}
                totalPages={5}
                onPageChange={onPageChange}
            />
        );

        fireEvent.click(screen.getByText("← Previous"));

        expect(onPageChange).toHaveBeenCalledWith(2);
    });

    // checks that clicking Next moves forward one page
    test("calls onPageChange when Next is clicked", () => {
        const onPageChange = jest.fn();

        render(
            <Pagination
                currentPage={3}
                totalPages={5}
                onPageChange={onPageChange}
            />
        );

        fireEvent.click(screen.getByText("Next →"));

        expect(onPageChange).toHaveBeenCalledWith(4);
    });

    // checks that clicking a page number changes to that page
    test("calls onPageChange when page number is clicked", () => {
        const onPageChange = jest.fn();

        render(
            <Pagination
                currentPage={1}
                totalPages={5}
                onPageChange={onPageChange}
            />
        );

        fireEvent.click(screen.getByText("4"));

        expect(onPageChange).toHaveBeenCalledWith(4);
    });

    // checks the layout when the user is near the beginning
    test("shows first pages and ellipsis when near beginning", () => {
        const onPageChange = jest.fn();

        render(
            <Pagination
                currentPage={2}
                totalPages={10}
                onPageChange={onPageChange}
            />
        );

        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getByText("4")).toBeInTheDocument();
        expect(screen.getByText("5")).toBeInTheDocument();
        expect(screen.getByText("10")).toBeInTheDocument();
        expect(screen.getByText("...")).toBeInTheDocument();
    });

    // checks the layout when the user is near the end
    test("shows last pages and ellipsis when near end", () => {
        const onPageChange = jest.fn();

        render(
            <Pagination
                currentPage={9}
                totalPages={10}
                onPageChange={onPageChange}
            />
        );

        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("6")).toBeInTheDocument();
        expect(screen.getByText("7")).toBeInTheDocument();
        expect(screen.getByText("8")).toBeInTheDocument();
        expect(screen.getByText("9")).toBeInTheDocument();
        expect(screen.getByText("10")).toBeInTheDocument();
        expect(screen.getByText("...")).toBeInTheDocument();
    });

    // checks the layout when the user is in the middle
    test("shows pages around current page with two ellipses in middle", () => {
        const onPageChange = jest.fn();

        render(
            <Pagination
                currentPage={6}
                totalPages={12}
                onPageChange={onPageChange}
            />
        );

        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("5")).toBeInTheDocument();
        expect(screen.getByText("6")).toBeInTheDocument();
        expect(screen.getByText("7")).toBeInTheDocument();
        expect(screen.getByText("12")).toBeInTheDocument();

        expect(screen.getAllByText("...")).toHaveLength(2);
    });

    // checks that disabled Previous does not change pages
    test("does not change page when disabled Previous is clicked", () => {
        const onPageChange = jest.fn();

        render(
            <Pagination
                currentPage={1}
                totalPages={5}
                onPageChange={onPageChange}
            />
        );

        fireEvent.click(screen.getByText("← Previous"));

        expect(onPageChange).not.toHaveBeenCalled();
    });

    // checks that disabled Next does not change pages
    test("does not change page when disabled Next is clicked", () => {
        const onPageChange = jest.fn();

        render(
            <Pagination
                currentPage={5}
                totalPages={5}
                onPageChange={onPageChange}
            />
        );

        fireEvent.click(screen.getByText("Next →"));

        expect(onPageChange).not.toHaveBeenCalled();
    });
});