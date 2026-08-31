# IDX-Internship

A Zillow/Redfin-style property search backend powered by real MLS data. This project uses Docker, MySQL, Node.js, Express, and MySQL2 to provide a REST API with pagination, filtering, input validation, and optimized database indexes.

---

# Week 1 (6/15/2026) - Database Setup

## Setup

### 1. Install Docker

Install Docker Desktop from:

https://www.docker.com/products/docker-desktop/

Verify installation:

```bash
docker --version
```

---

### 2. Start MySQL Container

From the backend directory:

```bash
docker start idx-mysql-local
```

Verify the container is running:

```bash
docker ps
```

---

### 3. Import MLS Data

Place the following SQL files inside your project:

```
rets_property.sql
rets_openhouse.sql
```

Import the datasets:

```bash
docker exec -i idx-mysql-local mysql -uroot -pYOUR_PASSWORD rets < rets_property.sql

docker exec -i idx-mysql-local mysql -uroot -pYOUR_PASSWORD rets < rets_openhouse.sql
```

---

### 4. Verify Database

Open MySQL:

```bash
docker exec -it idx-mysql-local mysql -uroot -pYOUR_PASSWORD rets
```

Run:

```sql
SHOW TABLES;

SELECT COUNT(*) FROM rets_property;

SELECT COUNT(*) FROM rets_openhouse;

DESCRIBE rets_property;

DESCRIBE rets_openhouse;
```

Expected:

- Two tables:
  - rets_property
  - rets_openhouse
- Both tables contain data.

---

# Week 2 (6/22/2026) - Backend Setup

## Install Dependencies

```bash
npm install
```

Dependencies:

- express
- mysql2
- dotenv
- cors

Development dependency:

- nodemon

---

## Configure Environment Variables

Create a `.env` file:

```env
PORT=5001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_PASSWORD
DB_NAME=rets
```

---

## Start the Backend

```bash
npm run dev
```

---

## Verify Database Connection

Open:

```
http://localhost:5001/api/health
```

Expected response:

```json
{
    "status": "ok",
    "database": "connected"
}
```

---

# Week 3 (6/29/2026) - Property Search API

## Start the Environment

Start MySQL:

```bash
docker start idx-mysql-local
```

Start the backend:

```bash
npm run dev
```

---

## Property Endpoint

Base endpoint:

```
GET /api/properties
```

Example:

```
http://localhost:5001/api/properties
```

Returns:

- total number of matching properties
- limit
- offset
- array of property results

---

## Pagination

Example:

```
http://localhost:5001/api/properties?limit=10&offset=20
```

Returns:

- 10 properties
- skips the first 20 records

---

## Supported Filters

| Filter | Description |
|---------|-------------|
| city | Filter by city |
| zipcode | Filter by zip code |
| minPrice | Minimum listing price |
| maxPrice | Maximum listing price |
| beds | Exact number of bedrooms |
| baths | Exact number of bathrooms |
| limit | Number of results returned |
| offset | Number of rows to skip |

---

### Example Queries

City:

```
http://localhost:5001/api/properties?city=San%20Jose
```

Price Range:

```
http://localhost:5001/api/properties?minPrice=300000&maxPrice=600000
```

Bedrooms:

```
http://localhost:5001/api/properties?beds=3
```

Multiple Filters:

```
http://localhost:5001/api/properties?city=San%20Jose&beds=3&minPrice=300000
```

Pagination:

```
http://localhost:5001/api/properties?limit=10&offset=20
```

---

## Input Validation

Invalid numeric values return **HTTP 400**.

Example:

```
http://localhost:5001/api/properties?minPrice=abc
```

Returns:

```json
{
    "error": "minPrice must be a number"
}
```

---

## Database Indexes

The following indexes are used to improve query performance:

```sql
SHOW INDEXES FROM rets_property;
```

Indexes include:

- idx_L_City
- idx_L_Zip
- idx_price
- idx_beds
- idx_baths

---

## Query Performance

Verify MySQL is using indexes:

```sql
EXPLAIN
SELECT *
FROM rets_property
WHERE L_City = 'San Jose';
```

The `key` column should show the city index being used.

---
# Week 4 (7/6/2026) - Property Details and Open Houses

## Property Detail Endpoint

Added an endpoint for retrieving a single property by its listing ID.

Endpoint:

```text
GET /api/properties/:id
```

Example:

```text
http://localhost:5001/api/properties/123
```

The endpoint:

- validates the listing ID
- searches for the matching property
- returns the property as JSON
- returns HTTP 404 if the property does not exist

---

## Open House Endpoint

Added an endpoint for retrieving open house information for a property.

Endpoint:

```text
GET /api/properties/:id/openhouses
```

Example:

```text
http://localhost:5001/api/properties/123/openhouses
```

Returns open house information including:

- start date
- end date
- start time
- end time
- remarks

If the property has no scheduled open houses, an empty array is returned.

---

## Listing ID Validation

Added validation before querying the database.

Invalid or missing listing IDs are rejected before unnecessary database queries are performed.

---

## Database Optimization

Added an index on the property listing ID to improve property detail and open house lookups.

Verify the index:

```sql
SHOW INDEXES FROM rets_property;
```

Query performance can be checked using:

```sql
EXPLAIN
SELECT *
FROM rets_property
WHERE L_ListingID = 'LISTING_ID';
```

---

# Week 5 (7/13/2026) - React Frontend Setup

## Frontend Setup

Created the React frontend for displaying property listings.

The frontend communicates with the Express backend through API requests.

Main frontend directories:

```text
frontend/src/
├── api/
├── components/
├── pages/
└── utils/
```

---

## API Client

Created `src/api/client.js` to handle communication with the backend.

Main API functions include:

```text
fetchProperties()
fetchPropertyDetail()
fetchOpenHouses()
```

This keeps API request logic separate from React components.

---

## Property Listings Page

Created `ListingsPage.js` to:

- request properties from the backend
- store property results in React state
- display loading states
- display API errors
- render property listings

---

## React Proxy

The frontend uses the proxy configured in `package.json` to communicate with the backend.

This allows frontend requests to use:

```text
/api/properties
```

instead of manually including the backend URL in every request.

---

# Week 6 (7/20/2026) - Property Search and Filters

## Property Filters

Created the `PropertyFilters` component to allow users to search properties using:

- city
- ZIP code
- minimum price
- maximum price
- bedrooms
- bathrooms

The selected filters are sent to the backend as query parameters.

---

## Search Results

`ListingsPage` stores the selected filters and reloads the property results whenever a new search is submitted.

Example request:

```text
/api/properties?city=San%20Jose&minPrice=300000&beds=3
```

---

## Clear Filters

Added the ability to clear all selected filters and return to the default property results.

---

## Pagination

Created the `Pagination` component.

Features include:

- Previous button
- Next button
- numbered page buttons
- current page highlighting
- disabled Previous button on the first page
- disabled Next button on the last page
- ellipses when there are many pages

The frontend calculates the backend offset using:

```text
offset = (currentPage - 1) * itemsPerPage
```

The default page size is 20 properties.

---

# Week 7 (7/27/2026) - Property Cards and Frontend Improvements

## Property Cards

Created the `PropertyCard` component to display individual property information.

Each card displays:

- property image
- listing price
- address
- city and state
- bedrooms
- bathrooms
- square footage when available

---

## Property Images

Property photo data is parsed from the MLS data.

If a valid photo exists, the first property photo is displayed.

If a property has no valid image, the card displays:

```text
No image available
```

---

## Navigation

Property cards use React Router to navigate to individual property pages.

Example:

```text
/property/123
```

This provides clean URLs for property detail pages and allows normal browser navigation.

---

# Week 8 (8/3/2026) - Property Detail Page and Image Gallery

## Property Detail Page

Created `PropertyDetailPage.js` to display detailed information for an individual property.

The page retrieves:

- property information
- property photos
- open house information

Property details and open houses are requested from the backend when the page loads.

---

## Property Image Gallery

Created `PropertyImageGallery` for viewing property photos.

Features include:

- main property image
- image thumbnails
- active thumbnail selection
- total photo count
- full-screen lightbox
- previous and next controls
- image counter

---

## Lightbox Controls

The image lightbox supports mouse and keyboard navigation.

Keyboard controls:

```text
Escape      Close lightbox
ArrowLeft   Previous image
ArrowRight  Next image
```

The gallery wraps around when navigating beyond the first or last image.

---

## Open House Display

Property detail pages display available open house information returned by:

```text
GET /api/properties/:id/openhouses
```

If there are no scheduled open houses, the page displays the appropriate empty state.

---

# Week 9 (8/10/2026) - Sorting and UI Improvements

## Property Sorting

Added sorting options to the property search.

Users can sort by:

- price
- date listed
- property size
- bedrooms

Users can also choose ascending or descending order.

---

## Backend Sorting

The property endpoint accepts:

```text
sortBy
sortOrder
```

Only approved database fields can be used for sorting to prevent arbitrary SQL from being inserted into the `ORDER BY` clause.

Allowed sort fields include:

```text
L_SystemPrice
ListingContractDate
LM_Int2_3
L_Keyword2
```

Allowed sort directions:

```text
ASC
DESC
```

---

## Results Summary

The listings page displays which properties are currently being shown.

Example:

```text
Showing 1–20 of 150 properties
```

---

## Empty Results

If no properties match the selected filters, the frontend displays:

```text
No properties found matching your criteria. Try adjusting your filters.
```

---

# Week 10 (8/17/2026) - Testing and Error Handling

## Frontend Testing

Added Jest and React Testing Library tests for major frontend functionality.

Tested components include:

- API client
- PropertyFilters
- Pagination
- PropertyCard
- ListingsPage
- PropertyDetailPage
- ErrorBoundary

Tests verify both normal behavior and error conditions.

---

## API Client Tests

Tests cover:

- successful API requests
- failed HTTP requests
- query string creation
- pagination parameters
- filter parameters
- property detail requests
- open house requests
- network errors

---

## Component Tests

Component tests verify behavior including:

- submitting property filters
- clearing filters
- pagination navigation
- property card rendering
- property card navigation
- loading states
- error states
- empty property results
- sorting
- property detail rendering

---

## Error Boundary

Added an `ErrorBoundary` component to prevent an unexpected component error from crashing the entire application.

If an error occurs, users see a fallback message and an option to refresh the page.

---

# Week 11 (8/24/2026) - Test Coverage and Documentation

## Test Coverage

Expanded the frontend test suite to improve coverage of critical application paths.

Run frontend tests with coverage:

```bash
cd frontend
npm test -- --coverage --watchAll=false
```

Coverage reports include:

- statements
- branches
- functions
- lines

The project targets at least 70% coverage for critical application components and API functionality.

---

## Image Gallery Testing

Added tests for `PropertyImageGallery`.

Tests cover:

- properties with no photos
- single photos
- multiple photos
- invalid photo JSON
- thumbnail selection
- opening and closing the lightbox
- previous and next navigation
- image wrapping
- keyboard navigation

---

## Backend Tests

Run backend tests with:

```bash
cd backend
npm test
```

Backend tests cover major property API functionality including:

- property pagination
- invalid parameters
- city filtering
- price filtering
- property detail lookup
- missing properties
- open house retrieval

---

## README Documentation

Expanded project documentation to include:

- setup instructions
- database configuration
- frontend and backend setup
- testing instructions
- API endpoints
- project structure
- architecture decisions
- troubleshooting
- future improvements

---

# Features

Current application features include:

- property search with filters
- city and ZIP code filtering
- price filtering
- bedroom and bathroom filtering
- paginated property results
- property sorting
- property cards
- property detail pages
- property image galleries
- full-screen image lightbox
- open house schedules
- loading and error states
- responsive frontend interface
- frontend and backend testing

---

# Prerequisites

Before running the project, install:

- Node.js 18+
- npm
- Docker Desktop
- Git

---

# Complete Setup Instructions

## 1. Clone Repository

```bash
git clone <repository-url>
cd idx-internship
```

---

## 2. Start Database

Start the existing MySQL container:

```bash
docker start idx-mysql-local
```

Verify it is running:

```bash
docker ps
```

If setting up the database for the first time, import the MLS SQL datasets as described in Week 1.

---

## 3. Backend Setup

```bash
cd backend
npm install
```

Create `.env`:

```env
PORT=5001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_PASSWORD
DB_NAME=rets
```

Start the backend:

```bash
npm run dev
```

Backend runs on:

```text
http://localhost:5001
```

---

## 4. Frontend Setup

From the project root:

```bash
cd frontend
npm install
npm start
```

Frontend runs on:

```text
http://localhost:3000
```

---

# Running Tests

## Backend Tests

```bash
cd backend
npm test
```

## Frontend Tests

```bash
cd frontend
npm test
```

Run frontend tests once with coverage:

```bash
npm test -- --coverage --watchAll=false
```

---

# Project Structure

```text
idx-internship/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   └── mysql.js
│   │   ├── routes/
│   │   │   └── properties.js
│   │   └── index.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js
│   │   ├── components/
│   │   │   ├── ErrorBoundary.js
│   │   │   ├── Pagination.js
│   │   │   ├── PropertyCard.js
│   │   │   ├── PropertyFilters.js
│   │   │   └── PropertyImageGallery.js
│   │   ├── pages/
│   │   │   ├── ListingsPage.js
│   │   │   └── PropertyDetailPage.js
│   │   ├── utils/
│   │   │   └── api-helpers.js
│   │   └── App.js
│   └── package.json
│
└── README.md
```

---

# API Endpoints

## GET /api/health

Checks whether the backend can connect to MySQL.

Example:

```text
http://localhost:5001/api/health
```

---

## GET /api/properties

Returns a paginated list of properties with optional filtering and sorting.

### Query Parameters

| Parameter | Description |
|-----------|-------------|
| `limit` | Number of results, default 20 |
| `offset` | Number of properties to skip, default 0 |
| `city` | Filter by city |
| `zipcode` | Filter by ZIP code |
| `minPrice` | Minimum price |
| `maxPrice` | Maximum price |
| `beds` | Number of bedrooms |
| `baths` | Number of bathrooms |
| `sortBy` | Database field used for sorting |
| `sortOrder` | `ASC` or `DESC` |

Example:

```text
GET /api/properties?city=San%20Jose&minPrice=300000&beds=3
```

---

## GET /api/properties/:id

Returns details for a single property.

Example:

```text
GET /api/properties/123
```

A nonexistent property returns HTTP 404.

---

## GET /api/properties/:id/openhouses

Returns the open house schedule for a property.

Example:

```text
GET /api/properties/123/openhouses
```

If the property has no open houses, the endpoint returns an empty open house array.

---

# Architecture Decisions

## Why Docker for MySQL?

Docker provides:

- a consistent MySQL environment
- easier database setup
- isolation from other local databases
- simple start and stop commands
- easier database recreation

---

## Why Pagination?

The MLS database contains a large number of property records.

Pagination:

- prevents loading the entire dataset at once
- reduces backend and database load
- reduces network traffic
- improves frontend performance
- provides a better browsing experience

---

## Why React Router?

React Router provides:

- clean URLs for property detail pages
- normal browser Back and Forward behavior
- navigation without full page reloads
- an easy way to add additional pages later

---

## Why Separate API Functions?

API requests are stored in `client.js` instead of directly inside React components.

This:

- keeps components easier to read
- avoids duplicated request code
- makes API requests easier to test
- separates frontend display logic from network logic

---

## Why Validate Sorting Fields?

The backend only allows approved values for `sortBy`.

This prevents users from inserting arbitrary values into the SQL `ORDER BY` clause and keeps sorting predictable.

---

# Known Issues / Future Improvements

Potential future improvements include:

- user authentication
- saved properties
- saved searches
- additional property sorting options
- improved mobile responsive design
- additional accessibility improvements
- expanded backend and frontend testing
- map-based property searching

Property image galleries have already been implemented.

---

# Troubleshooting

## Backend Won't Start

Make sure MySQL is running:

```bash
docker ps
```

If the container is stopped:

```bash
docker start idx-mysql-local
```

Verify the `.env` file contains the correct database credentials.

Also make sure port `5001` is available.

---

## Frontend Cannot Reach Backend

Verify the backend is running:

```text
http://localhost:5001/api/health
```

Check the proxy configuration in:

```text
frontend/package.json
```

Restart the React development server after changing proxy settings.

---

## Tests Failing After Installing Dependencies

Remove and reinstall dependencies:

```bash
rm -rf node_modules
npm install
```

Check the installed Node version:

```bash
node --version
```

Node.js 18+ is recommended.

---

## React Router Errors

If React Router cannot be found, reinstall the project dependencies:

```bash
cd frontend
npm install
```

Then restart the development server.

---

# Contributors

Janie Tran - Initial development

---

# License

This project was created for educational purposes as part of the IDX Exchange internship program.
