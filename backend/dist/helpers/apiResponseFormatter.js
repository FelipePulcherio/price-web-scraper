"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = apiResponseFormatter;
function apiResponseFormatter(success, messages, data) {
    return {
        timestamp: new Date(),
        success,
        messages,
        data,
    };
}
//# sourceMappingURL=apiResponseFormatter.js.map