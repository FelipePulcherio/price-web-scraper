import { Prisma, Role } from '@prisma/client';

// Define interface for Store
export interface IStore {
  id?: number;
  name: string;
  logo?: string;
  url: string;
}

// Define interface for store info inside Item
export interface IShortStore {
  id?: number;
  name: string;
  logo: string;
}

// Define interface for Category
export interface ICategory {
  id?: number;
  name: string;
}

// Define interface for item
export interface IItem {
  id?: number;
  name: string;
  model: string;
  brand: string;
  categories: ICategory[];
  description: Prisma.JsonObject;
  stores: IStore[];
}

// Define interface for item
export interface IShortItem {
  id?: number;
  name: string;
  model: string;
  brand: string;
}

// Define interface for event
export interface IEvent {
  id?: number;
  itemId?: number;
  itemName?: string;
  storeId?: number;
  storeName: string;
  price: number;
  date?: Date;
  fromJob: string;
}

// Define interface for user
export interface IUser {
  id?: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phone: string;
  password: string;
  role?: Role;
}

// Define interface for short user (API)
export interface IShortUser {
  userName: string;
  email: string;
}

// Define interface for APIs
export interface IAPI<T = unknown> {
  timestamp: Date;
  success: boolean;
  message: string;
  data: T;
}
