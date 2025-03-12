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
    app.use('/categories', route);
    // GET /api/v1/categories/
    // Used to find all categories
    route.get('/', async (req, res, next) => {
        try {
            console.log('GET /api/v1/categories/');
            const fetchedCategories = await (0, dbRead_1.getAllCategories)();
            // console.log(fetchedCategories);
            res
                .status(200)
                .json((0, apiResponseFormatter_1.default)(true, ['Categories fetched successfully'], fetchedCategories));
        }
        catch (error) {
            // Pass errors to middlewares.errorHandler
            next(error);
        }
    });
};
//# sourceMappingURL=category.js.map