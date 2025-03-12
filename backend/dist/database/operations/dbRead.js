"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getItemById = getItemById;
exports.getAllCategories = getAllCategories;
exports.getItemsByCategoryId = getItemsByCategoryId;
exports.getAllStores = getAllStores;
exports.searchItemByString = searchItemByString;
exports.getCurrentPricesByItemId = getCurrentPricesByItemId;
exports.getLowestPricesByItemId = getLowestPricesByItemId;
exports.getAllItemsForScraper = getAllItemsForScraper;
exports.getUserByEmail = getUserByEmail;
exports.getUserById = getUserById;
exports.getItemDeals = getItemDeals;
const prisma_1 = __importDefault(require("@/loaders/prisma"));
// FUNCTIONS
async function getItemById(id) {
    try {
        // Try to find item
        const item = await prisma_1.default.item.findUnique({
            where: { id, isActive: true },
            select: {
                name: true,
                model: true,
                brand: true,
                categories: {
                    select: {
                        name: true,
                    },
                },
                subCategories: {
                    select: {
                        name: true,
                    },
                },
                subSubCategories: {
                    select: {
                        name: true,
                    },
                },
                images: {
                    orderBy: {
                        url: 'asc',
                    },
                    select: {
                        url: true,
                    },
                },
                description: true,
                stores: {
                    select: {
                        store: {
                            select: {
                                name: true,
                                logo: true,
                            },
                        },
                        url: true,
                    },
                },
                isActive: true,
                searchCount: true,
            },
        });
        // console.log(item);
        // If item was not found
        if (!item) {
            throw new Error('Not found');
        }
        // If item was found add 1 to searchCount
        await prisma_1.default.item.update({
            where: { id },
            data: { searchCount: { increment: 1 } },
        });
        // Transform data
        const result = {
            name: item.name,
            model: item.model,
            brand: item.brand,
            categories: item.categories,
            subCategories: item.subCategories,
            subSubCategories: item.subSubCategories,
            images: item.images,
            description: item.description,
            stores: item.stores.map((s) => ({
                name: s.store.name,
                logo: s.store.logo,
                url: s.url,
            })),
        };
        return result;
    }
    catch (error) {
        // Throw error to whoever called this
        // console.error(`Error fetching item ID=${id}:`, error);
        throw error;
    }
}
async function getAllCategories() {
    try {
        // Try to find item
        const categories = await prisma_1.default.category.findMany({
            select: {
                id: true,
                name: true,
                hasDepth: true,
                subCategories: {
                    select: {
                        id: true,
                        name: true,
                        hasDepth: true,
                        subSubCategories: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
        // If categories was not found
        if (!categories) {
            throw new Error('Not found');
        }
        // console.log(categories);
        return categories;
    }
    catch (error) {
        // Throw error to whoever called this
        // console.error('Error fetching categories:', error);
        throw error;
    }
}
async function getItemsByCategoryId(categoryId, pageSize, page) {
    try {
        // Try to find item
        const items = await prisma_1.default.item.findMany({
            skip: (page - 1) * pageSize,
            take: pageSize,
            where: {
                isActive: true,
                categories: {
                    some: {
                        id: categoryId,
                    },
                },
            },
            select: {
                id: true,
                name: true,
                model: true,
                brand: true,
                images: {
                    where: {
                        name: {
                            contains: '1',
                        },
                    },
                    orderBy: {
                        name: 'asc',
                    },
                    take: 1,
                    select: {
                        url: true,
                    },
                },
            },
        });
        // console.log(items);
        // If item was not found
        if (items.length === 0) {
            throw new Error('Not found');
        }
        // Transform data
        const result = items.map((item) => ({
            id: item.id,
            name: item.name,
            model: item.model,
            brand: item.brand,
            image: item.images.length > 0 ? item.images[0] : { url: '' },
        }));
        return result;
    }
    catch (error) {
        // Throw error to whoever called this
        // console.error(`Error fetching items:`, error);
        throw error;
    }
}
async function getAllStores() {
    try {
        // Try to find stores
        const stores = await prisma_1.default.store.findMany({
            select: {
                id: true,
                name: true,
                logo: true,
            },
        });
        // If item was not found
        if (!stores) {
            throw new Error('Not found');
        }
        // console.log(stores);
        return stores;
    }
    catch (error) {
        // Throw error to whoever called this
        // console.error('Error fetching stores:', error);
        throw error;
    }
}
async function searchItemByString(query, pageSize, page) {
    try {
        // Try to find item
        const items = await prisma_1.default.item.findMany({
            skip: (page - 1) * pageSize,
            take: pageSize,
            where: {
                isActive: true,
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { model: { contains: query, mode: 'insensitive' } },
                    { brand: { contains: query, mode: 'insensitive' } },
                ],
            },
            select: {
                id: true,
                name: true,
                model: true,
                brand: true,
                images: {
                    where: {
                        name: {
                            contains: '1',
                        },
                    },
                    orderBy: {
                        name: 'asc',
                    },
                    take: 1,
                    select: {
                        url: true,
                    },
                },
                stores: {
                    where: {
                        events: { some: {} },
                    },
                    select: {
                        events: {
                            where: { status: 'OK' },
                            orderBy: { price: 'asc' },
                            take: 1,
                            select: {
                                price: true,
                            },
                        },
                    },
                },
            },
        });
        // If item was not found
        if (items.length === 0) {
            throw new Error('Not found');
        }
        // console.log(items);
        // console.log(items[0].stores);
        // Transform data
        const result = items.map((item) => ({
            id: item.id,
            name: item.name,
            model: item.model,
            brand: item.brand,
            image: item.images.length > 0 ? item.images[0] : { url: '' },
            price: item.stores[0].events[0].price,
        }));
        return result;
    }
    catch (error) {
        // Throw error to whoever called this
        // console.error('Error fetching items:', error);
        throw error;
    }
}
async function getCurrentPricesByItemId(id) {
    try {
        // Try to find item
        const item = await prisma_1.default.item.findUnique({
            where: { id, isActive: true },
            select: {
                stores: {
                    select: {
                        store: {
                            select: {
                                name: true,
                                logo: true,
                            },
                        },
                        url: true,
                        events: {
                            orderBy: {
                                date: 'desc',
                            },
                            take: 1,
                            select: {
                                price: true,
                            },
                        },
                    },
                },
            },
        });
        // console.log(item);
        // If item was not found
        if (!item) {
            throw new Error('Not found');
        }
        // Transform data
        const result = {
            stores: item.stores
                .map((s) => ({
                name: s.store.name,
                logo: s.store.logo,
                url: s.url,
                price: s.events[0]?.price || 0,
            }))
                .filter((store) => store.price > 0)
                .sort((a, b) => a.price - b.price),
        };
        return result;
    }
    catch (error) {
        // Throw error to whoever called this
        // console.error(`Error fetching item ID=${id}:`, error);
        throw error;
    }
}
async function getLowestPricesByItemId(id, days) {
    const dateStartFilter = new Date();
    dateStartFilter.setHours(dateStartFilter.getHours() - 24 * days);
    try {
        const dailyLowestPrices = await prisma_1.default.$queryRaw `
      SELECT MIN(price) as price, DATE(date) as date
      FROM "Events"
      WHERE "itemId" = ${id} 
        AND date >= ${dateStartFilter}
        AND price > 0
      GROUP BY DATE(date)
      ORDER BY date ASC;
    `;
        // If item was not found
        if (dailyLowestPrices.length === 0) {
            throw new Error('Not found');
        }
        // console.log(dailyLowestPrices);
        // Transform data - Fill missing days
        let protection = 0;
        while (dailyLowestPrices.length < days) {
            const oldestDate = new Date(dailyLowestPrices[0].date);
            oldestDate.setDate(oldestDate.getDate() - 1); // Move one day back
            // Insert new entry at the beginning
            dailyLowestPrices.unshift({
                price: 0,
                date: oldestDate,
            });
            protection++;
            if (protection > 180) {
                break;
            }
        }
        return dailyLowestPrices;
    }
    catch (error) {
        // Throw error to whoever called this
        // console.error(`Error fetching item ID=${id}:`, error);
        throw error;
    }
}
async function getAllItemsForScraper() {
    try {
        // Try to find item
        const item = await prisma_1.default.item.findMany({
            where: {
                isActive: true,
            },
            select: {
                id: true,
                stores: {
                    select: {
                        store: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        url: true,
                    },
                },
            },
        });
        // console.log(item);
        // Transform data
        const result = item.map((item) => ({
            id: item.id,
            stores: item.stores.map((s) => ({
                id: s.store.id,
                name: s.store.name,
                url: s.url,
                price: 0,
            })),
        }));
        return result;
    }
    catch (error) {
        // Handle Error
        // console.error(`Error fetching all items:`, error);
        return [];
    }
}
async function getUserByEmail(email) {
    // This is exclusively used by middleware.verifyPassword
    try {
        const user = await prisma_1.default.user.findUnique({
            where: {
                email,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                password: true,
                role: true,
            },
        });
        return user;
    }
    catch (error) {
        // Throw error to who called this
        throw error;
    }
}
async function getUserById(id) {
    // This is exclusively used by middleware.attachCurrentUser
    try {
        const user = await prisma_1.default.user.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                password: true,
                role: true,
            },
        });
        return user;
    }
    catch (error) {
        // Throw error to who called this
        throw error;
    }
}
async function getItemDeals(qty) {
    try {
        // Try to get items
        const item = await prisma_1.default.item.findMany({
            take: qty,
            where: {
                isActive: true,
                stores: {
                    some: {
                        events: {
                            some: {},
                        },
                    },
                },
            },
            select: {
                id: true,
                name: true,
                model: true,
                brand: true,
                images: {
                    where: {
                        name: {
                            contains: '1',
                        },
                    },
                    orderBy: {
                        name: 'asc',
                    },
                    take: 1,
                    select: {
                        url: true,
                    },
                },
                stores: {
                    select: {
                        store: {
                            select: {
                                name: true,
                            },
                        },
                        events: {
                            orderBy: { price: 'asc' },
                            take: 1,
                            select: {
                                price: true,
                            },
                        },
                    },
                },
            },
        });
        // console.log(item);
        // console.log(item[1].stores);
        // console.log(item[1].stores.map((store) => console.log(store.events)));
        // If no item was retrieved
        if (!item) {
            throw new Error('Not found');
        }
        // Transform data
        const result = item.map((item) => {
            const allPrices = item.stores.flatMap((store) => store.events[0].price);
            const lowestPrice = Math.min(...allPrices.filter((n) => n > 0));
            return {
                id: item.id,
                name: item.name,
                model: item.model,
                brand: item.brand,
                image: { url: item.images[0].url },
                price: lowestPrice,
                storesQty: item.stores.filter((store) => store.events[0].price > 0)
                    .length,
            };
        });
        return result;
    }
    catch (error) {
        // Throw error to whoever called this
        // console.error(`Error fetching items`, error);
        throw error;
    }
}
//# sourceMappingURL=dbRead.js.map