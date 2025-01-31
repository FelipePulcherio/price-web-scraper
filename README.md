# Price Web Scraper

### Scheduled Price Monitoring and Analysis with MongoDB and BrightData

## Description

Price Web Scraper is an automated tool designed to track prices of products across major online retailers such as Walmart, Amazon, BestBuy, Newegg, and Canada Computers. Utilizing scheduled scraping, it collects current price data at defined intervals, stores it in a cloud database, and enables historical price tracking and daily lowest-price analysis. This project leverages BrightData’s proxy service and cloud browser for stable web scraping, along with MongoDB Atlas for secure data storage.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [User Instructions](#user-instructions)
  - [Pre-requisites](#pre-requisites)
  - [Configure Database](#configure-database)
  - [Configure Repository](#configure-repository)
  - [Configure environment](#configure-environment)
  - [Initialize Database](#initialize-database)
  - [How to Run](#how-to-run)
- [High Level Design](#high-level-design)
- [Database Schema](#database-schema)
- [API contracts](#api-contracts)
  - [User and Authentication](#user-and-authentication)
    - [Register](#1-register-a-new-user)
  - [Items and Categories](#items-and-categories)
  - [Stores and Pricing](#stores-and-pricing)
  - [History and Analytics](#history-and-analytics)
- [Contributing](#contributing)

## Project Overview

Price Web Scraper is a backend-focused tool developed with TypeScript and Node.js, employing various libraries to manage tasks and data storage:

- **Server:** Node.js with Express for the backend.
- **Database:** MongoDB Atlas with Mongoose for structured data models and storage.
- **Scraping and Proxies:** Puppeteer-core is used alongside BrightData's cloud browser and proxy IP pool to handle reliable and efficient connection.
- **Scheduling:** The Agenda library is used to define and manage scraping tasks, with a typical interval set to 12 hours (adjustable).

The application flow involves fetching a list of items from the database, grouping them by store, scraping the prices, and analyzing them to determine the lowest prices for each day. The updated data is then stored back into the database, providing users with a comprehensive view of price history and trends.

## Features

- **Scheduled Scraping:** The tool is configured to perform scraping tasks every 12 hours by default. This can be customized by the user.
- **Multi-Store Support:** Supports scraping from Walmart, Amazon, BestBuy, Newegg, and Canada Computers.
- **Data Storage and Analysis:** Price histories and daily lowest prices are stored in MongoDB Atlas.
- **Proxy Management:** Integrates BrightData’s IP rotation and cloud browser for efficient and stable scraping.
- **Historical Data Visualization:** Tracks daily lowest prices across supported stores, enabling price trend analysis over time.

## User Instructions

### Pre-requisites

- Node >= v18.15.0
- Bright Data account + Scraping Browser (**Warning:** This is a paid service).
- MongoDB Atlas account.

<br>

### Configure Database

After creating an account on Bright Data and MongoDB Atlas follow this:

1. Log in your MongoDB Atlas account.

2. Create a new project.

3. Create a new cluster:

   1. Select type M0 (**Free**) with AWS provider. Press **`Create Deployment`**.

   2. Type a username and password and click on **`Create Database User`** and **`Choose a Connection Method`**.

   3. Select **`Drivers`**. Driver should be `Node.Js` with Version `5.5 or later`.

   4. Copy the `Connection String`. It should look like this: `mongodb+srv://<MONGO_USER>:<MONGO_USER>@<MONGO_PASSWORD>/?retryWrites=true&w=majority&appName=<MONGO_CLUSTER>`.

   5. Press **`Done`**.

4. **Optional**: Change network access. If you are using a VPN this step is highly recommended:

   1. On the left menu select `Network Access` below `SECURITY`.

   2. Here you can: edit the one already created or press **`+ ADD IP ADDRESS`**.

   3. Press **`ALLOW ACCESS FROM ANYWHERE`**.

   4. Press **`Confirm`**.

5. Create database:

   1. On the left menu select: `Overview`.

   2. Waiting for Atlas to finish creating your cluster. When it's done press **`Browse Collections`**.

   3. Press **`Add My Own Data`**.

   4. Fill in a `Database name` and write it down. This will be used in **[Configure environment](#configure-environment)** section.

   5. Type anything in `Collection name`.

   6. Press **`Create`**.

<br>

### Configure Repository

With everything related to cloud already set up, we can start doing things locally:

1. Open your terminal.

2. Clone this repository in your machine.

3. Open backend folder with the command:

   `cd price-web-scraper/backend/`.

4. Finally run:

   `npm install`.

<br>

### Configure Environment

Before running the app we need to configure the environment variables:

1. Create a `.env` file inside `backend/` folder.

2. Populate it with the following values:

   ```env
   PORT=your_port                               # number
   MONGO_USER="your_mongo_user"                 # string
   MONGO_PASSWORD="your_mongo_password"         # string
   MONGO_URL="your_mongo_url"                   # string
   MONGO_DATABASE="your_database_name"          # string
   BRIGHT_ENDPOINT="your_brightdata_endpoint"   # string
   ```

#### Example:

MongoDB string: `mongodb+srv://user1:mypassword123@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`.

BrightData endpoint: `wss://brd-customer-ab_1234abcd-zone-zone_name:abcdef123456@brd.superproxy.io:1234`.

```env
   PORT=3000
   MONGO_USER="user1"
   MONGO_PASSWORD="mypassword123"
   MONGO_URL="cluster0.abcde.mongodb.net"
   MONGO_DATABASE="scraper-database"     # This is the database name we created under `Configure Database` Step 5.iv.
   BRIGHT_ENDPOINT="wss://brd-customer-ab_1234abcd-zone-zone_name:abcdef123456@brd.superproxy.io:1234"
```

<br>

### Initialize Database

These steps are used to populate the database with the items that we are interested in scraping. This should be done every time that you'd like to add a new item (or set of items) to the database.

**_WARNING:_** _Keep in mind that re-seeding the database will erase everything and you will loose all your historical data._

1. Open `completeList.ts` and add as many Items as you want. Follow the structure defined by `IItem` interface described in `types.ts`.

2. For each Item added you'll need a History and Graph as well. Follow the structure defined by `IHistory` and `IGraph` interfaces described in `types.ts`.

3. Go to the `backend/` folder and run the following command in your terminal:  
   `ts-node src/db/seed/seed.ts`

4. Open MongoDB Atlas and `refresh`. Check if your database has the new collections. If not, check LOGs in terminal.

<br>

### How to Run

Steps 1 to 3 are done only once. They will compile the source code in javascript files. Once you've done this, if you close the app and need to run again follow **step 3**.

1. Go to the `backend/` folder and run the following command in your terminal:

   `tsc`

2. Wait for it to fully run once. You can confirm if it's done by checking if the folder `dist/` appeared inside `backend`.

3. Run:

   `node dist/index.js`

4. Exit when needed by pressing `CTRL + C`.

<br>

## High Level Design

![Screenshot of high level design](./backend/src/images/high-level-diagram.jpg)

<br>

## Database Schema

![Screenshot of database schema](./backend/src/images/ERD-diagram.jpg)

<br>

## API Contracts

Each API request will need to follow a specific schema in a JSON format that will be defined below.

The response of all APIs will follow the same schema independently of a successful response or not:

```js
{
  "timestamp": String,
  "success": Boolean,
  "message": String,
  "data": Object
}
```

The currently available roles are:

- SYSTEM
- ADMIN
- REGULAR_USER
- LOGGED_USER
- PREMIUM_USER

The 'SYSTEM' role will have access to all endpoints and will be used for all actions performed directly through the backend or an external DBM system.

### Successful response example

```json
{
  "timestamp": "2025-01-27T12:00:00Z",
  "success": true,
  "message": "Request successful",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "REGULAR_USER"
  }
}
```

### Error response example

```json
{
  "timestamp": "2025-01-27T12:05:00Z",
  "success": false,
  "message": "User not found",
  "data": null
}
```

### User and Authentication

#### 1. Register a new user

- **Description:** Register a new user
- **Method:** POST
- **Endpoint:** /api/v1/auth/register
- **Roles allowed:** SYSTEM, ADMIN
- **Request Body:**

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "role": "REGULAR_USER"
}
```

- **Response (201 Created):**

```json
{
  "timestamp": "2025-01-27T12:00:00Z",
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "REGULAR_USER",
    "createdAt": "2025-01-27T12:00:00Z"
  }
}
```

**2. Login**

- **Description:** Login into app
- **Method:** POST
- **Endpoint:** /api/v1/auth/login
- **Roles allowed:** ALL
- **Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

- **Response (200 OK):**

```json
{
  "timestamp": "2025-01-27T12:01:00Z",
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt-token",
    "expiresIn": 3600
  }
}
```

**3. Logout**

- **Description:** Logout from the app
- **Method:** POST
- **Endpoint:** /api/v1/auth/logout
- **Roles allowed:** ALL
- **Response (200 OK):**

```json
{
  "timestamp": "2025-01-27T12:02:00Z",
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

**4. User details**

- **Description:** Get authenticated user details
- **Method:** GET
- **Endpoint:** /api/v1/auth/me
- **Roles allowed:** ALL
- **Response (200 OK):**

```json
{
  "timestamp": "2025-01-27T12:03:00Z",
  "success": true,
  "message": "User details fetched",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "REGULAR_USER",
    "createdAt": "2025-01-27T12:00:00Z"
  }
}
```

**5. Update user**

- **Description:** Update user details
- **Method:** PATCH
- **Endpoint:** /api/v1/users/{id}
- **Roles allowed:** SYSTEM, ADMINISTRATOR (for any user); REGULAR_USER and PREMIUM_USER (only for themselves)
- **Request Body (Admin Editing Another User):**

```json
{
  "name": "Updated Name",
  "role": "PREMIUM_USER"
}
```

- **Request Body (User Editing Their Own Profile):**

```json
{
  "name": "Updated Name"
}
```

- **Response (200 OK):**

```json
{
  "timestamp": "2025-01-27T12:04:00Z",
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "uuid",
    "name": "Updated Name",
    "email": "john.doe@example.com",
    "role": "PREMIUM_USER"
  }
}
```

<br>

### Items and Categories

**1. Item details**

- **Description:** Retrieve item details
- **Method:** GET
- **Endpoint:** /api/v1/items/{id}
- **Roles allowed:** ALL
- **Response (200 OK):**

```json
{
  "timestamp": "2025-01-27T12:10:00Z",
  "success": true,
  "message": "Item details fetched successfully",
  "data": {
    "id": "uuid",
    "name": "TV",
    "category": "Electronics",
    "description": Object,
    "lowestPrice": 1500.99,
    "lowestStore": "Store 1",
    "createdAt": "2025-01-27T11:00:00Z"
  }
}
```

**2. All active items from category**

- **Description:** Retrieves all active items from specified category
- **Method:** GET
- **Endpoint:** /api/v1/categories/{categoryId}/items
- **Roles allowed:** ALL
- **Response (200 OK):**

```json
{
  "timestamp": "2025-01-27T12:11:00Z",
  "success": true,
  "message": "Items fetched successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Gaming Laptop",
      "lowestPrice": 1500.99,
      "lowestStore": "Store 1"
    },
    {
      "id": "uuid",
      "name": "Mechanical Keyboard",
      "lowestPrice": 1500.99,
      "lowestStore": "Store 1"
    }
  ]
}
```

**3. Search item**

- **Description:** Search an item by name
- **Method:** GET
- **Endpoint:** /api/v1/items/search?q={query}
- **Roles allowed:** ALL
- **Response (200 OK):**

```json
{
  "timestamp": "2025-01-27T12:12:00Z",
  "success": true,
  "message": "Search results fetched successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Gaming Laptop",
      "lowesrPrice": 1500.99,
      "lowestStore": "Store 1"
    }
  ]
}
```

<br>

### Stores and Pricing

**1. Store details**

- **Description:** Retrieve store details
- **Method:** GET
- **Endpoint:** /api/v1/stores/{id}
- **Roles allowed:** ALL

- **Response (200 OK):**

```json
{
  "timestamp": "2025-01-27T12:15:00Z",
  "success": true,
  "message": "Store details fetched successfully",
  "data": {
    "id": "uuid",
    "name": "Tech Store",
    "logo": "https://imageurl.com/",
    "country": "contact@techstore.com"
  }
}
```

<br>

### History and Analytics

**1. Item price history**

- **Description:** Retrieve price history for an item
- **Method:** GET
- **Endpoint:** /api/v1/items/{itemId}/price-history
- **Roles allowed:** SYSTEM, ADMIN (fetch all history), others (fetch last entry only)
- **Response (200 OK for SYSTEM or ADMIN):**

```json
{
  "timestamp": "2025-01-27T12:20:00Z",
  "success": true,
  "message": "Price history fetched successfully",
  "data": [
    {
      "lowesrPrice": 1500.99,
      "lowestStore": "Store 1",
      "date": "2025-01-26T12:00:00Z",
    },
    {
      "lowesrPrice": 1499.99,
      "lowestStore": "Store 2",
      "date": "2025-01-27T12:00:00Z",
    },
    {...}
  ]
}
```

- **Response (200 OK for other roles):**

```json
{
  "timestamp": "2025-01-27T12:00:00Z",
  "success": true,
  "message": "Price history fetched successfully",
  "data": [
    {
      "lowesrPrice": 1500.99,
      "lowestStore": "Store 1",
      "date": "2025-01-26T12:00:00Z"
    }
  ]
}
```

<br>

**2. Price-trend 365 days**

- **Description:** Retrieve the last 365 days of price trends for an item
- **Method:** GET
- **Endpoint:** /api/v1/items/{itemId}/price-trends/365-days
- **Roles allowed:** ALL but REGULAR_USER
- **Response (200 OK):**

```json
{
  "timestamp": "2025-01-27T12:00:00Z",
  "success": true,
  "message": "Price trends for the last 365 days fetched",
  "data": [
    {
      "lowesrPrice": 1500.99,
      "lowestStore": "Store 1",
      "date": "2025-01-26T12:00:00Z"
    },
    {...}
  ]
}
```

<br>

**3. Price-trend 180 days**

- **Description:** Retrieve the last 180 days of price trends for an item
- **Method:** GET
- **Endpoint:** /api/v1/items/{itemId}/price-trends/180-days
- **Roles allowed:** ALL but REGULAR_USER
- **Response (200 OK):**

```json
{
  "timestamp": "2025-01-27T12:00:00Z",
  "success": true,
  "message": "Price trends for the last 180 days fetched",
  "data": [
    {
      "lowesrPrice": 1500.99,
      "lowestStore": "Store 1",
      "date": "2025-01-26T12:00:00Z"
    },
    {...}
  ]
}
```

<br>

**3. Price-trend 30 days**

- **Description:** Retrieve the last 30 days of price trends for an item
- **Method:** GET
- **Endpoint:** /api/v1/items/{itemId}/price-trends/30-days
- **Roles allowed:** ALL
- **Response (200 OK):**

```json
{
  "timestamp": "2025-01-27T12:00:00Z",
  "success": true,
  "message": "Price trends for the last 30 days fetched",
  "data": [
    {
      "lowesrPrice": 1500.99,
      "lowestStore": "Store 1",
      "date": "2025-01-26T12:00:00Z"
    },
    {...}
  ]
}
```

<br>

## Contributing

If you would like to contribute to this project:

1. Fork the Repository and create a branch for your feature or bug fix.

2. Once your changes are ready, push your branch to GitHub and submit a pull request.
