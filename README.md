# IDX-Internship

A Zillow/Redfin-style property search application powered by real MLS data. This project uses Docker, MySQL, Node.js, Express, MySQL2, and React to provide property searching, filtering, sorting, pagination, property details, image galleries, and open house information.

## Project Description

IDX-Internship is a full-stack real estate application that allows users to browse, filter, sort, and view detailed property listings from MLS data. Users can search by location, price, bedrooms, and bathrooms; navigate through paginated results; view property photos; and check available open houses.

### Screenshot

Add a screenshot of the completed application here:

```markdown
![IDX property listings](docs/images/property-listings.png)
```

## Tech Stack

| Technology | Version | Purpose |
|---|---:|---|
| MySQL | 8.0 | Stores property and open house data |
| Node.js | 18 or newer | Runs the backend and frontend tooling |
| Express | 5.2.1 | Provides the REST API |
| MySQL2 | 3.22.5 | Connects the backend to MySQL |
| React | 19.2.7 | Builds the frontend interface |
| React Router DOM | 7.18.2 | Handles frontend navigation |
| Jest | 30.5.0 | Runs automated tests |
| Docker Desktop | Current stable version | Runs MySQL locally |

## Local Setup Instructions

### Prerequisites

Install the following on a fresh machine:

- Git
- Docker Desktop
- Node.js 18 or newer
- npm

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
cd IDX-Internship
```

Replace `YOUR_REPOSITORY_URL` with the URL of the GitHub repository.

### 2. Start the MySQL Database

Start Docker Desktop. Then, from the project directory, run:

```bash
docker compose up -d
```

Verify that the MySQL container is running:

```bash
docker ps
```

### 3. Import the MLS Data

Place `rets_property.sql` and `rets_openhouse.sql` inside the backend directory. These files are not included in the repository.

Import the property data:

```bash
docker exec -i idx-mysql-local mysql -uroot -pYOUR_PASSWORD rets < rets_property.sql
```

Import the open house data:

```bash
docker exec -i idx-mysql-local mysql -uroot -pYOUR_PASSWORD rets < rets_openhouse.sql
```

Replace `YOUR_PASSWORD` with the MySQL root password.

### 4. Configure the Backend

Move into the backend directory and install its dependencies:

```bash
cd backend
npm install
```

Create a `.env` file inside the backend directory:

```env
PORT=5001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_PASSWORD
DB_NAME=rets
```

Replace `YOUR_PASSWORD` with the MySQL root password.

Start the backend:

```bash
npm run dev
```

Verify that the backend and database are connected by opening:

```text
http://localhost:5001/api/health
```

Expected response:

```json
{
  "status": "ok",
  "database": "connected"
}
```

### 5. Configure the Frontend

Open another terminal and move into the frontend directory:

```bash
cd frontend
npm install
npm start
```

The application opens at:

```text
http://localhost:3000
```

The frontend sends API requests to the backend through the proxy configured in `frontend/package.json`.

## API Endpoint Reference

### Health Check

Checks whether the backend can connect to the database.

```http
GET /api/health
```

Example request:

```text
http://localhost:5001/api/health
```

Example response:

```json
{
  "status": "ok",
  "database": "connected"
}
```

### List Properties

Returns property listings with optional filters, sorting, and pagination.

```http
GET /api/properties
```

Supported query parameters:

| Parameter | Description |
|---|---|
| `city` | Filters properties by city |
| `zipcode` | Filters properties by ZIP code |
| `minPrice` | Sets the minimum listing price |
| `maxPrice` | Sets the maximum listing price |
| `beds` | Filters by the exact number of bedrooms |
| `baths` | Filters by the exact number of bathrooms |
| `limit` | Sets the number of results returned |
| `offset` | Sets the number of results skipped |
| `sortBy` | Selects an approved property field for sorting |
| `sortOrder` | Selects ascending or descending order |

Example request:

```text
http://localhost:5001/api/properties?city=San%20Jose&minPrice=300000&beds=3&limit=20&offset=0
```

Example response:

```json
{
  "total": 1,
  "limit": 20,
  "offset": 0,
  "results": [
    {
      "L_ListingID": "123",
      "L_Address": "123 Main Street",
      "L_City": "San Jose",
      "L_State": "CA",
      "L_AskingPrice": 750000,
      "L_Keyword2": 3,
      "LM_Dec_3": 2
    }
  ]
}
```

### Get One Property

Returns the details of one property using its listing ID.

```http
GET /api/properties/:id
```

Example request:

```text
http://localhost:5001/api/properties/123
```

Example response:

```json
{
  "L_ListingID": "123",
  "L_Address": "123 Main Street",
  "L_City": "San Jose",
  "L_State": "CA",
  "L_AskingPrice": 750000
}
```

If the property does not exist, the endpoint returns HTTP 404.

### Get Open Houses

Returns the available open houses for a property.

```http
GET /api/properties/:id/openhouses
```

Example request:

```text
http://localhost:5001/api/properties/123/openhouses
```

Example response:

```json
{
  "openhouses": [
    {
      "OH_StartDate": "2026-09-05",
      "OH_EndDate": "2026-09-05",
      "OH_StartTime": "13:00:00",
      "OH_EndTime": "16:00:00",
      "OH_Remarks": "Open house"
    }
  ]
}
```

If the property has no scheduled open houses, the endpoint returns:

```json
{
  "openhouses": []
}
```

Invalid numeric parameters return HTTP 400, missing properties return HTTP 404, and unexpected server or database errors return HTTP 500.

## Database Schema Summary

### `rets_property`

Stores property listing information.

Important columns include:

| Column | Description |
|---|---|
| `id` | Auto-incrementing database ID |
| `L_ListingID` | Property listing ID used by the API |
| `L_DisplayId` | Displayed MLS number |
| `L_Address` | Property street address |
| `L_City` | Property city |
| `L_State` | Property state |
| `L_Zip` | Property ZIP code |
| `L_AskingPrice` | Property listing price |
| `L_Keyword2` | Number of bedrooms |
| `LM_Dec_3` | Number of bathrooms |
| `L_Status` | Current listing status |
| `L_PictureCount` | Number of property pictures |
| `L_ListingDate` | Date the property was listed |

### `rets_openhouse`

Stores scheduled open house information.

Important columns include:

| Column | Description |
|---|---|
| `ListingId` | Listing ID associated with a property |
| `OH_StartDate` | Open house start date |
| `OH_EndDate` | Open house end date |
| `OH_StartTime` | Open house start time |
| `OH_EndTime` | Open house end time |
| `OH_Remarks` | Additional open house information |

### Table Relationship

`rets_openhouse.ListingId` corresponds to `rets_property.L_ListingID`.

Indexes on commonly searched property fields improve filtering and property lookup performance.

## Known Issues

- The MLS SQL data files must be obtained separately and imported manually.
- Some listings have missing or invalid photo data and display a fallback message.
- Open house information appears only when it exists in the imported MLS data.
- The application currently runs locally and does not include production deployment configuration.
- Property information may be incomplete when a field is missing from the original MLS data.

## Future Improvements

- Add user accounts and saved or favorite properties.
- Add map-based property searching.
- Add more advanced property filters.
- Improve responsive styling for mobile devices.
- Improve accessibility and image-loading performance.
- Add continuous integration and automated deployment.
- Increase frontend and backend test coverage.

---

# Weekly Progress

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
