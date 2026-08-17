// import React so we can create a class component
import React from "react";

// catches JavaScript errors anywhere in its child component tree
// and shows a fallback UI instead of crashing the whole app
class ErrorBoundary extends React.Component {

    constructor(props) {
        super(props);

        // tracks whether an error has been caught, and stores the error
        this.state = { hasError: false, error: null };
    }

    // runs when a child component throws an error
    // updates state so the next render shows the fallback UI
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    // runs after an error has been caught
    // used here to log the error for debugging
    componentDidCatch(error, errorInfo) {
        console.error("Error caught by boundary:", error, errorInfo);
    }

    render() {

        // if an error was caught, show the fallback UI instead of the children
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <h2>Something went wrong</h2>
                    <p>We're sorry for the inconvenience. Please refresh the page.</p>
                    <button onClick={() => window.location.reload()}>
                        Refresh Page
                    </button>
                </div>
            );
        }

        // no error - render the child components as normal
        return this.props.children;
    }
}

// allow ErrorBoundary to be imported by other components
export default ErrorBoundary;