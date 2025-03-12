"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_jwt_1 = require("express-jwt");
const config_1 = __importDefault(require("@/config"));
const getTokenFromHeader = (req) => {
    if ((req.headers.authorization &&
        req.headers.authorization.split(' ')[0] === 'Token') ||
        (req.headers.authorization &&
            req.headers.authorization.split(' ')[0] === 'Bearer')) {
        return req.headers.authorization.split(' ')[1];
    }
    // console.log('Token or Bearer not found');
    return undefined;
};
const isAuth = (0, express_jwt_1.expressjwt)({
    secret: config_1.default.jwt.secret,
    algorithms: [config_1.default.jwt.algorithm],
    requestProperty: 'token',
    getToken: getTokenFromHeader,
    credentialsRequired: false, // Allows requests without a token (Handles new User)
});
exports.default = isAuth;
//# sourceMappingURL=isAuth.js.map