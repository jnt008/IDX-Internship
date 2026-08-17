// import React
import React from "react";

// import routing components
import { BrowserRouter, Routes, Route } from "react-router-dom";

// import pages
import ListingsPage from "./pages/ListingsPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";

// import the error boundary so it can catch errors anywhere in the app
import ErrorBoundary from "./components/ErrorBoundary";

// import the app's CSS
import "./App.css";

function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <div className="App">
                    <Routes>

                        {/* home page */}
                        <Route
                            path="/"
                            element={<ListingsPage />}
                        />

                        {/* individual property page */}
                        <Route
                            path="/property/:id"
                            element={<PropertyDetailPage />}
                        />

                    </Routes>
                </div>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

// allow this component to be used by other files
export default App;