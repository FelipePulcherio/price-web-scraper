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

## Contributing

If you would like to contribute to this project:

1. Fork the Repository and create a branch for your feature or bug fix.

2. Once your changes are ready, push your branch to GitHub and submit a pull request.
