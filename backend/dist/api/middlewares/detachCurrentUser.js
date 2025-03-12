"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const detachCurrentUser = async (req, res, next) => {
    try {
        const currentUser = {
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
    catch (error) {
        return next(error);
    }
};
exports.default = detachCurrentUser;
//# sourceMappingURL=detachCurrentUser.js.map