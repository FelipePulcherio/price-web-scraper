"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dbRead_1 = require("@/database/operations/dbRead");
const attachCurrentUser = async (req, res, next) => {
    try {
        let currentUser;
        // User without a token
        if (!req.token) {
            currentUser = {
                id: '',
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                role: 'REGULAR_USER',
            };
            req.currentUser = currentUser;
            return next();
        }
        // User with a token
        const userRecord = await (0, dbRead_1.getUserById)(req.token.id);
        if (!userRecord) {
            return next(new Error('Unauthorized'));
        }
        // Transform data
        currentUser = {
            id: userRecord.id || '',
            firstName: userRecord.firstName,
            lastName: userRecord.lastName,
            email: userRecord.email,
            phone: userRecord.phone,
            role: userRecord.role || 'LOGGED_USER',
        };
        req.currentUser = currentUser;
        return next();
    }
    catch (error) {
        return next(error);
    }
};
exports.default = attachCurrentUser;
//# sourceMappingURL=dettachCurrentUser.js.map