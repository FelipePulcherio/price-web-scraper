"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const config_1 = __importDefault(require("@/config"));
const api_1 = __importDefault(require("@/api"));
// Code from: https://github.com/santiq/bulletproof-nodejs/
exports.default = ({ app }) => {
    // Use cors for integration with frontend
    const corsOptions = {
        origin: ['https://price-web-scraper-frontend.vercel.app'],
        credentials: true,
    };
    app.use((0, cors_1.default)(corsOptions));
    // Transforms the raw string of req.body into json
    app.use(express_1.default.json());
    // Cookie parser
    app.use((0, cookie_parser_1.default)());
    // Load API routes
    app.use(config_1.default.api.prefix, (0, api_1.default)());
    console.log(config_1.default.api.prefix);
};
//# sourceMappingURL=express.js.map