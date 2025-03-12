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
    app.use('/stores', route);
    // GET /api/v1/stores/
    // Used to find all stores
    route.get('/', async (req, res, next) => {
        try {
            console.log('GET /api/v1/stores/');
            const fetchedStores = await (0, dbRead_1.getAllStores)();
            // console.log(fetchedStores);
            res
                .status(200)
                .json((0, apiResponseFormatter_1.default)(true, ['Stores fetched successfully'], fetchedStores));
        }
        catch (error) {
            // Pass errors to middlewares.errorHandler
            next(error);
        }
    });
};
//# sourceMappingURL=store.js.map