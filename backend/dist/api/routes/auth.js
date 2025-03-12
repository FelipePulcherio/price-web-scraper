"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middlewares_1 = __importDefault(require("../middlewares"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("@/config"));
const dbCreate_1 = require("@/database/operations/dbCreate");
const apiResponseFormatter_1 = __importDefault(require("@/helpers/apiResponseFormatter"));
const route = (0, express_1.Router)();
exports.default = (app) => {
    app.use('/auth', route);
    // POST /api/v1/auth/signup
    route.post('/signup', middlewares_1.default.validateSignup, async (req, res, next) => {
        console.log('POST /api/v1/auth/signup');
        try {
            const newUser = await (0, dbCreate_1.createUser)(req.body);
            if (!newUser) {
                return next(new Error('Invalid email or password'));
            }
            // Create token
            const token = jsonwebtoken_1.default.sign({
                id: newUser.id,
                firstName: newUser.firstName,
                email: newUser.email,
                role: newUser.role,
            }, config_1.default.jwt.secret, { expiresIn: config_1.default.jwt.maxAge } // This is in s
            );
            // Transform data
            const currentUser = {
                id: newUser.id || '',
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role || 'LOGGED_USER',
            };
            // Attach token to cookie
            res.cookie('jwt', token, {
                httpOnly: true,
                maxAge: config_1.default.jwt.maxAge * 1000, // This is in ms
            });
            res
                .status(201)
                .json((0, apiResponseFormatter_1.default)(true, ['User registered successfully'], currentUser));
        }
        catch (error) {
            // Pass errors to middlewares.errorHandler
            next(error);
        }
    });
    // POST /api/v1/auth/signin
    route.post('/signin', middlewares_1.default.validateSignin, middlewares_1.default.verifyPassword, async (req, res, next) => {
        console.log('POST /api/v1/auth/signin');
        try {
            // Make sure currentUser was attached
            if (!req.currentUser) {
                return next(new Error('Internal server error'));
            }
            // Create token
            const token = jsonwebtoken_1.default.sign({
                id: req.currentUser.id,
                firstName: req.currentUser.firstName,
                email: req.currentUser.email,
                role: req.currentUser.role,
            }, config_1.default.jwt.secret, { expiresIn: config_1.default.jwt.maxAge } // This is in s
            );
            // Attach token to cookie
            res.cookie('jwt', token, {
                httpOnly: true,
                maxAge: config_1.default.jwt.maxAge * 1000, // This is in ms
            });
            res
                .status(200)
                .json((0, apiResponseFormatter_1.default)(true, ['User logged in successfully'], req.currentUser));
        }
        catch (error) {
            // Pass errors to middlewares.errorHandler
            next(error);
        }
    });
    // POST /api/v1/auth/logout
    route.post('/logout', middlewares_1.default.isAuth, middlewares_1.default.detachCurrentUser, (req, res, next) => {
        console.log('POST /api/v1/auth/logout');
        try {
            res
                .status(200)
                .json((0, apiResponseFormatter_1.default)(true, ['User logged out successfully'], req.currentUser));
        }
        catch (error) {
            // Pass errors to middlewares.errorHandler
            return next(error);
        }
    });
};
//# sourceMappingURL=auth.js.map