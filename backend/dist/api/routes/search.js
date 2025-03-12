"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dbRead_1 = require("@/database/operations/dbRead");
const apiResponseFormatter_1 = __importDefault(require("@/helpers/apiResponseFormatter"));
const middlewares_1 = __importDefault(require("../middlewares"));
const route = (0, express_1.Router)();
exports.default = (app) => {
    app.use('/search', route);
    // GET /api/v1/search/quick?q=
    // Used to find up to 5 items from a search
    route.get('/quick', middlewares_1.default.validateSearch, async (req, res, next) => {
        try {
            const search = req.query.q;
            console.log(`GET /api/v1/search/quick?q=${search}`);
            let fetchedItems = await (0, dbRead_1.searchItemByString)(search, 5, 1);
            // console.log(fetchedItems);
            // Transform urls
            fetchedItems = fetchedItems.map((item) => ({
                ...item,
                image: {
                    ...item.image,
                    url: item.image.url?.replace('f_auto,q_auto/', 'f_auto,q_auto/w_150,h_150/'),
                },
            }));
            res
                .status(200)
                .json((0, apiResponseFormatter_1.default)(true, ['Items fetched successfully'], fetchedItems));
        }
        catch (error) {
            // Pass errors to middlewares.errorHandler
            next(error);
        }
    });
    // GET /api/v1/search?q=
    // Used on regular searches. Use pages with 24 items
    route.get('/', middlewares_1.default.validateSearch, async (req, res, next) => {
        try {
            const search = req.query.q;
            const pageSize = 24;
            const page = parseInt(req.query.page, 10) || 1;
            console.log(`GET /api/v1/search?q=${search}`);
            const fetchedItems = await (0, dbRead_1.searchItemByString)(search, pageSize, page);
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
};
//# sourceMappingURL=search.js.map