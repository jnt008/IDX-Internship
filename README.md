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
docker compose up -d
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
docker compose up -d
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
