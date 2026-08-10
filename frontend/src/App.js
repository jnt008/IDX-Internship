// import React
import React from "react";

// import routing components
import { BrowserRouter, Routes, Route } from "react-router-dom";

// import pages
import ListingsPage from "./pages/ListingsPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";

// import the app's CSS
import "./App.css";

function App() {
    return (
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
    );
}

// allow this component to be used by other files
export default App;