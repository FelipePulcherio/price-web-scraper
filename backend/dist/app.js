"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
const express_1 = __importDefault(require("express"));
const process_1 = __importDefault(require("process"));
const config_1 = __importDefault(require("@/config"));
const scheduler_1 = require("./schedule/scheduler");
async function startServer() {
    const app = (0, express_1.default)();
    // Import loaders
    await require('./loaders').default({ expressApp: app });
    // Server start
    const server = app.listen(config_1.default.port, () => {
        console.log(`[Server]: Server is listening on port: ${config_1.default.port}`);
    });
    function gracefulShutdown() {
        console.log('Shutting down gracefully...');
        server.close(() => {
            console.log('Server closed');
            process_1.default.exit(0);
        });
    }
    // Graceful shutdown
    process_1.default.on('SIGINT', gracefulShutdown);
    process_1.default.on('SIGTERM', gracefulShutdown);
    // Agenda start
    (0, scheduler_1.startAgenda)();
}
// Function calls
startServer();
//# sourceMappingURL=app.js.map