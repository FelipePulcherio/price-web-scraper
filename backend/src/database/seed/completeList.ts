import {
  IShortStore,
  IItem,
  ICategory,
  IEvent,
  IUser,
} from '@/interfaces/interfaces';

import { Status } from '@prisma/client';

export const ITEMS_LIST: IItem[] = [
  {
    name: 'TV 65" Q60D 2024',
    model: 'QN65Q60DAFXZC',
    brand: 'Samsung',
    description: {},
    categories: [{ name: 'TV & Home Theatre' }],
    subCategories: [{ name: 'Televisions' }],
    subSubCategories: [{ name: '65 - 69 Inch TVs' }, { name: 'QLED TVs' }],
    images: [{}],
    stores: [
      {
        name: 'BEST BUY CA',
        url: 'https://www.bestbuy.ca/en-ca/product/samsung-65-4k-uhd-hdr-qled-tizen-os-smart-tv-qn65q60dafxzc-2024/17857410',
      },
      {
        name: 'WALMART CA',
        url: 'https://www.walmart.ca/en/ip/Samsung-65-QLED-SMART-4K-TV-Q60D-Series/6000207606889',
      },
      {
        name: 'CANADA COMPUTERS',
        url: 'https://www.canadacomputers.com/en/46-and-above/259168/samsung-q60d-65-qled-4k-smart-tv-qn65q60dafxzc.html',
      },
      {
        name: 'AMAZON CA',
        url: 'https://www.amazon.ca/SAMSUNG-65-Inch-Quantum-Q-Symphony-Xcelerator/dp/B0CXR45YRM/?th=1',
      },
    ],
  },
  {
    name: 'TV TEST',
    model: 'Test',
    brand: 'Test',
    description: {},
    categories: [{ name: 'TV & Home Theatre' }],
    subCategories: [{ name: 'Televisions' }],
    subSubCategories: [],
    images: [{}],
    stores: [],
  },
];

export const CATEGORIES_LIST: ICategory[] = [
  {
    name: 'TV & Home Theatre',
    hasDepth: true,
    subCategories: [
      {
        name: 'Televisions',
        hasDepth: true,
        subSubCategories: [
          { name: '85 Inch and Larger TVs' },
          { name: '75 - 84 Inch TVs' },
          { name: '70 - 74 Inch TVs' },
          { name: '65 - 69 Inch TVs' },
          { name: '55 - 59 Inch TVs' },
          { name: '50 - 54 Inch TVs' },
          { name: '43 - 49 Inch TVs' },
          { name: '33 - 42 Inch TVs' },
          { name: '32 Inch and Smaller TVs' },
          { name: 'Smart TVs' },
          { name: 'OLED TVs' },
          { name: 'QLED TVs' },
        ],
      },
    ],
  },
  {
    name: 'Computers, Tablets & Accessories',
    hasDepth: true,
    subCategories: [
      {
        name: 'Laptops & MacBooks',
        hasDepth: true,
        subSubCategories: [
          { name: 'Windows Laptops' },
          { name: 'Copilot+ PC' },
          { name: 'MacBooks' },
          { name: 'Chromebooks' },
          { name: 'Gaming Laptops' },
          { name: '2 in 1 Laptops' },
        ],
      },
    ],
  },
];

export const STORES_LIST: IShortStore[] = [
  { name: 'AMAZON CA', logo: '' },
  { name: 'BEST BUY CA', logo: '' },
  { name: 'CANADA COMPUTERS', logo: '' },
  { name: 'NEW EGG CA', logo: '' },
  { name: 'WALMART CA', logo: '' },
];

export const EVENTS_LIST: IEvent[] = [
  {
    itemName: 'TV 65" Q60D 2024',
    storeName: 'BEST BUY CA',
    price: 1099.0,
    fromJob: 'Scraper',
    status: Status.OK,
  },
  {
    itemName: 'TV 65" Q60D 2024',
    storeName: 'WALMART CA',
    price: 1095.0,
    fromJob: 'Scraper',
    status: Status.OK,
  },
];

export const USERS_LIST: IUser[] = [
  {
    id: '01010101-ffff-1111-ffff-010101010101',
    firstName: 'SYSTEM',
    lastName: 'SYSTEM',
    email: 'system@findadeal.com',
    phone: '000-000-0000',
    password: 'qwerty',
    role: 'SYSTEM',
  },
  {
    firstName: 'ADMIN',
    lastName: 'ADMIN',
    email: 'adminfsp@findadeal.com',
    phone: '000-000-0000',
    password: 'qwerty',
    role: 'ADMIN',
  },
  {
    firstName: 'Felipe',
    lastName: 'Pulcherio',
    email: 'felipe@test.com',
    phone: '000-000-0000',
    password: 'qwerty',
    role: 'REGULAR_USER',
  },
];
