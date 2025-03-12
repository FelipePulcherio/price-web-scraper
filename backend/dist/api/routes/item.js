"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dbRead_1 = require("@/database/operations/dbRead");
const apiResponseFormatter_1 = __importDefault(require("@/helpers/apiResponseFormatter"));
const route = (0, express_1.Router)();
exports.default = (app) => {
    app.use('/items', route);
    // GET /api/v1/items/current/:itemId
    // Used to get main deals
    route.get('/current/:itemId', async (req, res, next) => {
        try {
            const itemId = parseInt(req.params.itemId, 10);
            console.log(`GET /api/v1/items/current/:itemId Request param: ${itemId}`);
            let fetchedItem = await (0, dbRead_1.getCurrentPricesByItemId)(itemId);
            // console.log(fetchedItem);
            res
                .status(200)
                .json((0, apiResponseFormatter_1.default)(true, ['Item fetched successfully'], fetchedItem));
        }
        catch (error) {
            // Pass errors to middlewares.errorHandler
            next(error);
        }
    });
    // GET /api/v1/items/mainDeals
    // Used to get main deals
    route.get('/mainDeals', async (req, res, next) => {
        try {
            console.log(`GET /api/v1/items/mainDeals`);
            let fetchedItem = await (0, dbRead_1.getItemDeals)(5);
            // console.log(fetchedItem);
            // Transform urls
            fetchedItem = fetchedItem.map((item) => ({
                ...item,
                image: {
                    ...item.image,
                    url: item.image.url?.replace('f_auto,q_auto/', 'f_auto,q_auto/w_250,h_250/'),
                },
            }));
            res
                .status(200)
                .json((0, apiResponseFormatter_1.default)(true, ['Item fetched successfully'], fetchedItem));
        }
        catch (error) {
            // Pass errors to middlewares.errorHandler
            next(error);
        }
    });
    // GET /api/v1/items/category/:categoryId?page=
    // Used to find all items that are related to a categoryId
    route.get('/category/:categoryId', async (req, res, next) => {
        try {
            const categoryId = parseInt(req.params.categoryId, 10);
            const pageSize = 24;
            const page = parseInt(req.query.page, 10) || 1;
            console.log(`GET /api/v1/items/category/:categoryId Request param: ${categoryId}`);
            const fetchedItems = await (0, dbRead_1.getItemsByCategoryId)(categoryId, pageSize, page);
            // console.log(fetchedItems);
            res
                .status(200)
                .json((0, apiResponseFormatter_1.default)(true, ['Items fetched successfully'], fetchedItems));
        }
        catch (error) {
            // Pass errors to middlewares.errorHandler
            next(error);
        }
    });
    // GET /api/v1/items/history/30/:itemId
    // Used to get last 30 days prices of a specific item
    route.get('/history/30/:itemId', async (req, res, next) => {
        try {
            const itemId = parseInt(req.params.itemId, 10);
            console.log(`GET /api/v1/items/history/30/${itemId}`);
            const fetchedPrices = await (0, dbRead_1.getLowestPricesByItemId)(itemId, 30);
            // console.log(fetchedItem);
            res
                .status(200)
                .json((0, apiResponseFormatter_1.default)(true, ['Lowest prices fetched successfully'], fetchedPrices));
        }
        catch (error) {
            // Pass errors to middlewares.errorHandler
            next(error);
        }
    });
    // GET /api/v1/items/:id
    // Used to find a specific item
    route.get('/:id', async (req, res, next) => {
        try {
            const itemId = parseInt(req.params.id, 10);
            console.log(`GET /api/v1/items/:id Request param: ${itemId}`);
            const fetchedItem = await (0, dbRead_1.getItemById)(itemId);
            // console.log(fetchedItem);
            res
                .status(200)
                .json((0, apiResponseFormatter_1.default)(true, ['Item fetched successfully'], fetchedItem));
        }
        catch (error) {
            // Pass errors to middlewares.errorHandler
            next(error);
        }
    });
};
//# sourceMappingURL=item.js.map