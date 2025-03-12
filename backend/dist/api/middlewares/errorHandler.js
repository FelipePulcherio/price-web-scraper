"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = errorHandler;
const apiResponseFormatter_1 = __importDefault(require("@/helpers/apiResponseFormatter"));
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
function errorHandler(err, req, res, next) {
    // Default values
    let statusCode = 500;
    let messages = ['Internal server error'];
    // Handle Zod Errors
    if (err instanceof zod_1.ZodError) {
        statusCode = 400;
        messages = ['Bad Request'];
        err.errors.map((error) => {
            if (!(error.message.includes('Required') ||
                error.message.includes('Unrecognized key'))) {
                messages.push(`${error.path.join('.')}: ${error.message}`);
            }
        });
    }
    // Handle Prisma Errors
    else if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            // Unique constraint error
            statusCode = 409;
            messages = [`${err.meta?.target}: Already in use`];
        }
    }
    // Handle Regular Errors
    else if (err instanceof Error) {
        if (err.message.includes('Invalid email or password')) {
            statusCode = 401;
            messages = [err.message];
        }
        if (err.message.includes('Not found')) {
            statusCode = 404;
            messages = [err.message];
        }
        if (err.message.includes('Unauthorized')) {
            statusCode = 401;
            messages = [err.message];
        }
    }
    res.status(statusCode).json((0, apiResponseFormatter_1.default)(false, messages, null));
}
//# sourceMappingURL=errorHandler.js.map