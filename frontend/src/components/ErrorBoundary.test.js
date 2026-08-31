//import testing tools
import { render, screen, fireEvent } from "@testing-library/react";

//import the error boundary
import ErrorBoundary from "./ErrorBoundary";

//component that throws an error for testing
function BrokenComponent() {
    throw new Error("Test error");
}

describe("ErrorBoundary", () => {

    //hide expected console errors during error tests
    let consoleErrorSpy;

    beforeEach(() => {
        consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    //checks that normal children render when there is no error
    test("renders children when there is no error", () => {
        render(
            <ErrorBoundary>
                <div>Normal content</div>
            </ErrorBoundary>
        );

        expect(
            screen.getByText("Normal content")
        ).toBeInTheDocument();
    });

    //checks that fallback UI appears when a child throws an error
    test("shows fallback UI when child component throws", () => {
        render(
            <ErrorBoundary>
                <BrokenComponent />
            </ErrorBoundary>
        );

        expect(
            screen.getByText("Something went wrong")
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                "We're sorry for the inconvenience. Please refresh the page."
            )
        ).toBeInTheDocument();

        expect(
            screen.getByText("Refresh Page")
        ).toBeInTheDocument();
    });

    //checks that the error is logged
    test("logs the error when an error is caught", () => {
        render(
            <ErrorBoundary>
                <BrokenComponent />
            </ErrorBoundary>
        );

        expect(consoleErrorSpy).toHaveBeenCalled();
    });

    //checks that clicking refresh reloads the page
    test("reloads the page when Refresh Page is clicked", () => {
        const reloadMock = jest.fn();

        Object.defineProperty(window, "location", {
            configurable: true,
            value: {
                ...window.location,
                reload: reloadMock
            }
        });

        render(
            <ErrorBoundary>
                <BrokenComponent />
            </ErrorBoundary>
        );

        fireEvent.click(
            screen.getByText("Refresh Page")
        );

        expect(reloadMock).toHaveBeenCalled();
    });
});