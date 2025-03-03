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
  hasDepth: boolean;
  subCategories: {
    id?: number;
    name: string;
    hasDepth: boolean;
    subSubCategories: { id?: number; name: string }[];
  }[];
}

// Define interface for Category
export interface IShortCategory {
  id?: number;
  name: string;
  hasDepth?: boolean;
}

// Define interface for Image
export interface IImage {
  id?: number;
  name?: string;
  cloudinaryId?: string;
  url?: string;
}

// Define interface for item
export interface IItem {
  id?: number;
  name: string;
  model: string;
  brand: string;
  categories: IShortCategory[];
  subCategories: IShortCategory[];
  subSubCategories: IShortCategory[];
  images: IImage[];
  description: JSON;
  stores: IStore[];
}

// Define interface for short item
export interface IShortItem {
  id?: number;
  name: string;
  model: string;
  brand: string;
  image: IImage;
  price?: number;
  storesQty?: number;
}

// Define interface for scraper item
export interface IScraperItem {
  id: number;
  stores: {
    id: number;
    name: string;
    url: string;
    price: number;
  }[];
}

// Define interface for scraper store
export interface IScraperStore {
  id: number;
  name: string;
  items: {
    id: number;
    url: string;
    price: number;
  }[];
}

// Define interface for event
export interface IEvent {
  id?: number;
  itemId?: number;
  itemName?: string;
  storeId?: number;
  storeName?: string;
  price: number;
  date?: Date;
  fromJob: string;
  status: 'OK' | 'FAILED';
}

// Define interface for short event
export interface IShortEvent {
  price: number;
  date: Date;
}

// Define enum for Roles
enum Role {
  SYSTEM,
  ADMIN,
  REGULAR_USER,
  LOGGED_USER,
  PREMIUM_USER,
}

// Define interface for user
export interface IUser {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role?: Role;
}

// Define interface for Auth User
export interface IAuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
}

// Define interface for short user (API)
export interface IShortUser {
  email: string;
  password?: string;
}

// Define interface for APIs
export interface IAPI<T = unknown> {
  timestamp: Date;
  success: boolean;
  status?: number;
  messages: string[];
  data: T;
}
