// import React
import React from "react";

// import the ListingsPage component
import ListingsPage from "./pages/ListingsPage";

// import the app's CSS
import "./App.css";

function App() {
    return (
        // main container for the application
        <div className="App">

            {/* Display the property listings page. */}
            <ListingsPage />

        </div>
    );
}

// allow this component to be used by other files
export default App;
