"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = __importDefault(require("./routes/user"));
const item_1 = __importDefault(require("./routes/item"));
const category_1 = __importDefault(require("./routes/category"));
const store_1 = __importDefault(require("./routes/store"));
const search_1 = __importDefault(require("./routes/search"));
const auth_1 = __importDefault(require("./routes/auth"));
const middlewares_1 = __importDefault(require("./middlewares"));
exports.default = () => {
    const app = (0, express_1.Router)();
    (0, auth_1.default)(app);
    (0, user_1.default)(app);
    (0, item_1.default)(app);
    (0, category_1.default)(app);
    (0, store_1.default)(app);
    (0, search_1.default)(app);
    (0, user_1.default)(app);
    app.use(middlewares_1.default.errorHandler);
    return app;
};
//# sourceMappingURL=index.js.map