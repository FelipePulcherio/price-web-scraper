"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = verifyPassword;
const bcrypt_1 = __importDefault(require("bcrypt"));
const dbRead_1 = require("@/database/operations/dbRead");
async function verifyPassword(req, res, next) {
    const { email, password } = req.body;
    try {
        // Find user by email
        const user = await (0, dbRead_1.getUserByEmail)(email);
        if (!user) {
            return next(new Error('Invalid email or password'));
        }
        // Compare passwords
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return next(new Error('Invalid email or password'));
        }
        // Transform data
        const currentUser = {
            id: user.id || '',
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role || 'LOGGED_USER',
        };
        req.currentUser = currentUser;
        next();
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=verifyPassword.js.map