import { set, connect, connection, Types } from 'mongoose';
import dotenv from 'dotenv';
import { Item, History, Graph } from '../models/models';
import { items, histories, graphs } from './completeList';
import { IGraph, IHistory, IItem } from '../../types/types';

// Read .env file
dotenv.config();

const MONGO_USER: string = process.env.MONGO_USER || '';
const MONGO_PASSWORD: string = process.env.MONGO_PASSWORD || '';
const MONGO_URL: string = process.env.MONGO_URL || '';
const MONGO_DATABASE: string = process.env.MONGO_DATABASE || '';
const MONGO_URI: string = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_URL}/${MONGO_DATABASE}`;

// Set `strictQuery` to `true` to omit unknown fields in queries.
set('strictQuery', true);

// Store newly created Ids
let itemId: Types.ObjectId[] = [];

// Function definitions
// Call Save function
async function loopAllItems(list: IItem[]) {
  console.log('Debug: Adding all items in completeList.ts.');

  const promises = [];

  // Create a Promise array with all calls
  for (let i = 0; i < list.length; i++) {
    // Get itemId during loop so it's independent of promise.all resolve order
    itemId[i] = list[i]._id;

    promises.push(itemDocumentCreate(list[i]));
  }

  // Run all functions with Promise.all
  await Promise.all(promises);
}

// Save new document inside 'Item' collection
async function itemDocumentCreate(item: IItem) {
  const newItem = new Item({
    _id: item._id,
    name: item.name,
    brand: item.brand,
    description: item.description,
    category: item.category,
    isActive: item.isActive,
    stores: [
      {
        name: item.stores[0].name,
        logo: item.stores[0].logo,
        url: item.stores[0].url,
      },
      {
        name: item.stores[1].name,
        logo: item.stores[1].logo,
        url: item.stores[1].url,
      },
    ],
    addDate: item.addDate,
    lastUpdated: item.lastUpdated,
    lowestPrice: item.lowestPrice,
    lowestStore: item.lowestStore,
    searchCount: item.searchCount,
  });

  try {
    await newItem.save();
    console.log(`Added new document in 'items' collection: ${newItem.name}`);
  } catch (err) {
    console.log(`An error occurred: ${err}`);
  }
}

// Call Save function
async function loopAllHistories(list: IHistory[]) {
  console.log('Debug: Adding all histories in completeList.ts.');

  const promises = [];

  // Create a Promise array with all calls
  for (let i = 0; i < list.length; i++) {
    // Previously created item_id is needed here
    promises.push(historyDocumentCreate(list[i], itemId[i]));
  }

  // Run all functions with Promise.all
  await Promise.all(promises);
}

// Save new document inside 'History' collection
async function historyDocumentCreate(
  histories: IHistory,
  itemId: Types.ObjectId
) {
  const newHistory = new History({
    _id: histories._id,
    item_id: itemId,
    dataFull: [
      {
        store: histories.dataFull[0].store,
        price: histories.dataFull[0].price,
        date: histories.dataFull[0].date,
        moment: histories.dataFull[0].moment,
      },
    ],
  });

  try {
    await newHistory.save();
    console.log(
      `Added new document in 'History' collection: ${newHistory._id}`
    );
  } catch (err) {
    console.log(`An error occurred: ${err}`);
  }
}

// Call Save function
async function loopAllGraphs(list: IGraph[]) {
  console.log('Debug: Adding all graphs in completeList.ts.');

  const promises = [];

  // Create a Promise array with all calls
  for (let i = 0; i < list.length; i++) {
    // Previously created item_id is needed here
    promises.push(graphDocumentCreate(list[i], itemId[i]));
  }

  // Run all functions with Promise.all
  await Promise.all(promises);
}

// Save new document inside 'Price' collection
async function graphDocumentCreate(graphs: IGraph, itemId: Types.ObjectId) {
  const newGraph = new Graph({
    _id: graphs._id,
    item_id: itemId,
    data365: [
      {
        lowestPrice: graphs.data365[0].lowestPrice,
        lowestStore: graphs.data365[0].lowestStore,
        date: graphs.data365[0].date,
      },
    ],
  });

  try {
    await newGraph.save();
    console.log(`Added new document in 'Graph' collection: ${newGraph._id}`);
  } catch (err) {
    console.log(`An error occurred: ${err}`);
  }
}

async function deleteAll() {
  try {
    await Graph.deleteMany({});
    await History.deleteMany({});
    await Item.deleteMany({});
    console.log('Debug: Database cleared.');
  } catch (err) {
    console.log(`An error occurred: ${err}`);
  }
}

// Connect to DB
async function connectToDB() {
  console.log('Debug: Trying to connect to MongoDB ...');

  try {
    await connect(MONGO_URI, { retryWrites: true, w: 'majority' });
    console.log('Debug: Connected to MongoDB.');

    // Call functions to create Collections and populate
    await deleteAll();
    await loopAllItems(items);
    await loopAllHistories(histories);
    await loopAllGraphs(graphs);
  } catch (err) {
    console.log(`Error connecting to the database: ${err}`);
  } finally {
    await connection.close();
    console.log('Debug: Mongoose closed.');
  }
}

// Call function
connectToDB();
