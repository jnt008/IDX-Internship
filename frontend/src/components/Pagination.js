// import React to create the component
import React from "react";

// import the CSS file used to style the pagination buttons
import "./Pagination.css";

// pagination receives information from ListingsPage through props
function Pagination({ currentPage, totalPages, onPageChange }) {
    // The previous button can only be used when the user is past page 1
    const canGoPrev = currentPage > 1;

    // The next button can only be used when there are more pages available
    const canGoNext = currentPage < totalPages;

    // runs when the user clicks the previous button
    const handlePrevious = () => {
        // only change the page if a previous page exists
        if (canGoPrev) {
            onPageChange(currentPage - 1);
        }
    };

    // runs when the user clicks the next button
    const handleNext = () => {
        // change the page if a next page exists
        if (canGoNext) {
            onPageChange(currentPage + 1);
        }
    };

    // creates the list of page numbers shown between Previous and Next
    const getPageNumbers = () => {
        // stores the page numbers and ellipses that will be displayed
        const pages = [];

        // max number of page items to show at once
        const maxPagesToShow = 7;

        // if there are 7 pages or fewer show every page number
        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {

            // user is near the beginning of the page list
            if (currentPage <= 4) {
                // show pages 1 through 5
                for (let i = 1; i <= 5; i++) {
                    pages.push(i);
                }

                // show skipped pages using an ellipsis
                pages.push("...");

                // show the final page
                pages.push(totalPages);
            }

            // user is near the end of the page list
            else if (currentPage >= totalPages - 3) {
                // show the first page
                pages.push(1);

                // show skipped pages using an ellipsis
                pages.push("...");

                // show the final five pages
                for (
                    let i = totalPages - 4;
                    i <= totalPages;
                    i++
                ) {
                    pages.push(i);
                }
            }

            // user is somewhere in the middle of the page list
            else {
                // always show the first page
                pages.push(1);

                // show skipped pages before the current page
                pages.push("...");

                // show the previous, current, and next page
                for (
                    let i = currentPage - 1;
                    i <= currentPage + 1;
                    i++
                ) {
                    pages.push(i);
                }

                // show skipped pages after the current page
                pages.push("...");

                // show the final page
                pages.push(totalPages);
            }
        }

        // return the completed list of page numbers
        return pages;
    };

    // do not display pagination if there is only one page or no pages
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="pagination">
            {/* button used to move back one page */}
            <button
                className="pagination-btn"
                onClick={handlePrevious}
                disabled={!canGoPrev}
            >
                ← Previous
            </button>

            {/* container for the numbered page buttons */}
            <div className="pagination-numbers">
                {getPageNumbers().map((page, index) =>
                    // display an ellipsis when pages are being skipped
                    page === "..." ? (
                        <span
                            key={`ellipsis-${index}`}
                            className="pagination-ellipsis"
                        >
                            ...
                        </span>
                    ) : (
                        // display a clickable numbered page button
                        <button
                            key={page}
                            className={`pagination-number ${
                                page === currentPage ? "active" : ""
                            }`}
                            onClick={() => onPageChange(page)}
                        >
                            {page}
                        </button>
                    )
                )}
            </div>

            {/* button used to move forward one page */}
            <button
                className="pagination-btn"
                onClick={handleNext}
                disabled={!canGoNext}
            >
                Next →
            </button>
        </div>
    );
}

// export the component so ListingsPage can use it
export default Pagination;
