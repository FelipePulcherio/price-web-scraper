"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSignup = validateSignup;
exports.validateSignin = validateSignin;
exports.validateSearch = validateSearch;
const zod_1 = require("zod");
const signupSchema = zod_1.z.strictObject({
    firstName: zod_1.z.string().min(2).max(50),
    lastName: zod_1.z.string().min(2).max(50),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().min(10).max(15),
    password: zod_1.z.string().min(8),
});
function validateSignup(req, res, next) {
    try {
        signupSchema.parse(req.body);
        next();
    }
    catch (err) {
        next(err);
    }
}
const signinSchema = zod_1.z.strictObject({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
function validateSignin(req, res, next) {
    try {
        signinSchema.parse(req.body);
        next();
    }
    catch (err) {
        next(err);
    }
}
const searchSchema = zod_1.z.strictObject({
    q: zod_1.z.string().min(1),
    page: zod_1.z.string().min(1).optional(),
});
function validateSearch(req, res, next) {
    try {
        searchSchema.parse(req.query);
        next();
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=validation.js.map