"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middlewares_1 = __importDefault(require("../middlewares"));
const apiResponseFormatter_1 = __importDefault(require("@/helpers/apiResponseFormatter"));
const route = (0, express_1.Router)();
exports.default = (app) => {
    app.use('/users', route);
    // GET /api/v1/users/me
    // Used when user tries to keep connected
    route.get('/me', middlewares_1.default.isAuth, middlewares_1.default.attachCurrentUser, async (req, res, next) => {
        console.log('GET /api/v1/users/me');
        // console.log(req.body);
        // New user without a token
        // Won't crash the app but the result is null
        if (!req.token) {
            res
                .status(200)
                .json((0, apiResponseFormatter_1.default)(true, ['User not authenticated'], req.currentUser));
        }
        else {
            res
                .status(200)
                .json((0, apiResponseFormatter_1.default)(true, ['User authenticated'], req.currentUser));
        }
        try {
        }
        catch (error) {
            // console.error('Error fetching user:', error);
            next(error); // Pass errors to middleware
        }
    });
};
//# sourceMappingURL=user.js.map