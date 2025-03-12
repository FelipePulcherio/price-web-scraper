"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("./express"));
const prisma_1 = __importDefault(require("./prisma"));
exports.default = ({ expressApp }) => {
    const prismaClient = prisma_1.default;
    console.log('Prisma loaded');
    (0, express_1.default)({ app: expressApp });
    console.log('Express loaded');
};
//# sourceMappingURL=index.js.map