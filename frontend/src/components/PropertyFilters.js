// import React and the useState hook
import React, { useState } from 'react';

// import the CSS styles for this component
import './PropertyFilters.css';

// this component receives onSearch from its parent component
// onSearch is the function that will be called when the user searches or clears the filters
function PropertyFilters({ onSearch }) {
    // store all six filter values inside one state object
    const [filters, setFilters] = useState({
        city: '',
        zipcode: '',
        minPrice: '',
        maxPrice: '',
        beds: '',
        baths: ''
    });

    // this function runs whenever the user changes an input or selects an option from a dropdown
    const handleChange = (e) => {
        // get the name and current value of the changed form field
        const { name, value } = e.target;

        // update only the field that changed
        setFilters((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // this function runs when the user submits the form by clicking the Search button
    const handleSubmit = (e) => {
        // prevent the browser from refreshing the whole page when the form is submitted
        e.preventDefault();

        // create a new object that will only contain filters that the user actually filled in
        const cleanFilters = {};

        // go through every property in the filters object
        Object.keys(filters).forEach((key) => {
            // only add the filter if its value is not empty
            if (filters[key] && filters[key].trim() !== '') {
                cleanFilters[key] = filters[key].trim();
            }
        });

        // send the cleaned filter object to the parent component
        onSearch(cleanFilters);
    };

    // this function runs when the user clicks Clear Filters
    const handleClear = () => {
        // reset every form field back to an empty string
        setFilters({
            city: '',
            zipcode: '',
            minPrice: '',
            maxPrice: '',
            beds: '',
            baths: ''
        });

        // send an empty filter object to the parent component.
        onSearch({});
    };

    return (
        // when  user clicks search, handleSubmit runs
        <form
            className="property-filters"
            onSubmit={handleSubmit}
        >
            {/* Contains the six filter fields. */}
            <div className="filter-row">

                {/* City filter */}
                <div className="filter-group">
                    <label htmlFor="city">City</label>

                    <input
                        id="city"
                        type="text"
                        name="city"

                        // The input displays the city value stored in state.
                        value={filters.city}

                        // Update state whenever the user types.
                        onChange={handleChange}

                        placeholder="Enter city"
                    />
                </div>

                {/* ZIP code filter */}
                <div className="filter-group">
                    <label htmlFor="zipcode">ZIP Code</label>

                    <input
                        id="zipcode"
                        type="text"
                        name="zipcode"
                        value={filters.zipcode}
                        onChange={handleChange}
                        placeholder="Enter ZIP"
                    />
                </div>

                {/* Minimum price filter */}
                <div className="filter-group">
                    <label htmlFor="minPrice">Min Price</label>

                    <input
                        id="minPrice"
                        type="number"
                        name="minPrice"
                        value={filters.minPrice}
                        onChange={handleChange}
                        placeholder="$0"

                        // Prevent negative price values.
                        min="0"
                    />
                </div>

                {/* Maximum price filter */}
                <div className="filter-group">
                    <label htmlFor="maxPrice">Max Price</label>

                    <input
                        id="maxPrice"
                        type="number"
                        name="maxPrice"
                        value={filters.maxPrice}
                        onChange={handleChange}
                        placeholder="No max"

                        // Prevent negative price values.
                        min="0"
                    />
                </div>

                {/* Bedroom dropdown */}
                <div className="filter-group">
                    <label htmlFor="beds">Beds</label>

                    <select
                        id="beds"
                        name="beds"
                        value={filters.beds}
                        onChange={handleChange}
                    >
                        {/* An empty value means no bedroom filter. */}
                        <option value="">Any</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                        <option value="4">4+</option>
                        <option value="5">5+</option>
                    </select>
                </div>

                {/* Bathroom dropdown */}
                <div className="filter-group">
                    <label htmlFor="baths">Baths</label>

                    <select
                        id="baths"
                        name="baths"
                        value={filters.baths}
                        onChange={handleChange}
                    >
                        {/* An empty value means no bathroom filter. */}
                        <option value="">Any</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                        <option value="4">4+</option>
                    </select>
                </div>
            </div>

            {/* Search and Clear buttons */}
            <div className="filter-actions">
                {/* Because this is type="submit", clicking it submits
                    the form and runs handleSubmit. */}
                <button
                    type="submit"
                    className="btn-primary"
                >
                    Search
                </button>

                {/* This must be type="button".
                    Otherwise it would also submit the form. */}
                <button
                    type="button"
                    onClick={handleClear}
                    className="btn-secondary"
                >
                    Clear Filters
                </button>
            </div>
        </form>
    );
}

export default PropertyFilters;