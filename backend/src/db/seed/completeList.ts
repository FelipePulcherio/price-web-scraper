import {
  IStore,
  IShortItem,
  ICategory,
  IEvent,
  IUser,
} from '../../types/types';

export const ITEMS_LIST: IShortItem[] = [
  {
    name: 'TV 65" Q60C 2024',
    model: 'QN65Q60DAFXZC',
    brand: 'Samsung',
    description: {},
    categories: [{ name: 'Electronics' }, { name: 'TV' }],
    stores: [
      {
        name: 'BEST BUY CA',
        url: 'https://www.bestbuy.ca/en-ca/product/samsung-65-4k-uhd-hdr-qled-tizen-os-smart-tv-qn65q60dafxzc-2024/17857410',
      },
      {
        name: 'WALMART CA',
        url: 'https://www.walmart.ca/en/ip/Samsung-65-QLED-SMART-4K-TV-Q60D-Series/6000207606889',
      },
    ],
  },
];

export const CATEGORIES_LIST: ICategory[] = [
  { name: 'Electronics' },
  { name: 'TV' },
];

export const STORES_LIST: IStore[] = [
  { name: 'AMAZON CA' },
  { name: 'BEST BUY CA' },
  { name: 'CANADA COMPUTERS' },
  { name: 'NEW EGG CA' },
  { name: 'WALMART CA' },
];

export const EVENTS_LIST: IEvent[] = [
  {
    itemName: 'TV 65" Q60C 2024',
    storeName: 'BEST BUY CA',
    price: 1099.0,
    fromJob: 'Scraper',
  },
  {
    itemName: 'TV 65" Q60C 2024',
    storeName: 'WALMART CA',
    price: 1095.0,
    fromJob: 'Scraper',
  },
];

export const USERS_LIST: IUser[] = [
  {
    id: '01010101-ffff-1111-ffff-010101010101',
    firstName: 'SYSTEM',
    lastName: 'SYSTEM',
    userName: 'SYSTEM_MAIN',
    email: 'system@findadeal.com',
    phone: '000-000-0000',
    password: 'qwerty',
    role: 'SYSTEM',
  },
  {
    firstName: 'ADMIN',
    lastName: 'ADMIN',
    userName: 'ADMIN_FSP',
    email: 'adminfsp@findadeal.com',
    phone: '000-000-0000',
    password: 'qwerty',
    role: 'ADMIN',
  },
  {
    firstName: 'Felipe',
    lastName: 'Pulcherio',
    userName: 'FelipePulcherio',
    email: 'felipe@test.com',
    phone: '000-000-0000',
    password: 'qwerty',
    role: 'REGULAR_USER',
  },
];
