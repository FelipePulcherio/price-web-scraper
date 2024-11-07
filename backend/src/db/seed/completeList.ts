import { Types } from 'mongoose';
import { IGraph, IHistory, IItem } from '../../types/types';

export const items: IItem[] = [
  {
    _id: new Types.ObjectId(),
    name: 'TV 65" Q60C 2024',
    brand: 'Samsung',
    description: 'None',
    category: 'TV',
    isActive: true,
    stores: [
      {
        name: 'bestbuy.ca',
        logo: 'bestbuy.logo',
        url: 'https://www.bestbuy.ca/en-ca/product/samsung-65-4k-uhd-hdr-qled-tizen-os-smart-tv-qn65q60dafxzc-2024/17857410',
      },
      {
        name: 'walmart.ca',
        logo: 'walmart.logo',
        url: 'https://www.walmart.ca/en/ip/Samsung-65-QLED-SMART-4K-TV-Q60D-Series/6000207606889?selectedSellerId=1&from=/search',
      },
    ],
    addDate: new Date(),
    lastUpdated: new Date(), // Will be replaced later
    lowestPrice: 998, // Will be replaced later
    lowestStore: 'walmart.ca', // Will be replaced later
    searchCount: 0, // Will be replaced later
  },
  {
    _id: new Types.ObjectId(),
    name: 'TV 55" Q60C 2023',
    brand: 'Samsung',
    description: 'None',
    category: 'TV',
    isActive: true,
    stores: [
      {
        name: 'bestbuy.ca',
        logo: 'bestbuy.logo',
        url: 'https://www.bestbuy.ca/en-ca/product/samsung-55-4k-uhd-hdr-qled-smart-tv-qn55q60cafxzc-2023-titan-grey/16698731',
      },
      {
        name: 'walmart.ca',
        logo: 'walmart.logo',
        url: 'https://www.walmart.ca/en/ip/samsung-55-qled-smart-4k-tv-q60c-series-55-in/6000206105853?from=/search',
      },
    ],
    addDate: new Date(),
    lastUpdated: new Date(), // Will be replaced later
    lowestPrice: 713, // Will be replaced later
    lowestStore: 'walmart.ca', // Will be replaced later
    searchCount: 0, // Will be replaced later
  },
];

export const histories: IHistory[] = [
  // Entry 1: TV 65" Q60C 2024
  {
    _id: new Types.ObjectId(),
    item_id: new Types.ObjectId(),
    dataFull: [
      {
        store: 'bestbuy.ca',
        price: 1099.99, // Will be replaced later
        date: new Date(), // Will be replaced later
        moment: 'Morning',
      },
      {
        store: 'walmart.ca',
        price: 1098.0, // Will be replaced later
        date: new Date(), // Will be replaced later
        moment: 'Evening',
      },
    ],
  },
  // Entry 2: TV 55" Q60C 2023
  {
    _id: new Types.ObjectId(),
    item_id: new Types.ObjectId(),
    dataFull: [
      {
        store: 'amazon.ca',
        price: 999.99, // Will be replaced later
        date: new Date(), // Will be replaced later
        moment: 'Morning',
      },
      {
        store: 'bestbuy.ca',
        price: 999.99, // Will be replaced later
        date: new Date(), // Will be replaced later
        moment: 'Evening',
      },
    ],
  },
];

export const graphs: IGraph[] = [
  {
    _id: new Types.ObjectId(),
    item_id: new Types.ObjectId(),
    data365: [
      {
        lowestPrice: 799.99, // Will be replaced later
        lowestStore: 'amazon.ca', // Will be replaced later
        date: new Date(), // Will be replaced later
      },
    ],
  },
  {
    _id: new Types.ObjectId(),
    item_id: new Types.ObjectId(),
    data365: [
      {
        lowestPrice: 899.99, // Will be replaced later
        lowestStore: 'bestbuy.ca', // Will be replaced later
        date: new Date(), // Will be replaced later
      },
    ],
  },
];
