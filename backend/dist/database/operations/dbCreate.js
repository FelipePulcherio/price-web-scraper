"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.createEvent = createEvent;
const prisma_1 = __importDefault(require("@/loaders/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
// FUNCTIONS
async function createUser(data) {
    try {
        const { firstName, lastName, email, phone, password } = data;
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const newUser = await prisma_1.default.user.create({
            data: {
                firstName,
                lastName,
                email,
                phone,
                password: hashedPassword,
                updatedById: '01010101-ffff-1111-ffff-010101010101',
            },
        });
        return newUser;
    }
    catch (error) {
        // Throw error to whoever called this
        throw error;
    }
}
async function createEvent(data) {
    try {
        const events = data;
        await prisma_1.default.events.createMany({
            data: events.map((event) => ({
                itemId: event.itemId,
                storeId: event.storeId,
                price: event.price,
                fromJob: event.fromJob,
                status: event.status,
            })),
            skipDuplicates: true,
        });
    }
    catch (error) {
        // Throw error to whoever called this
        console.error('Error creating events:', error);
        throw new Error(error instanceof Error ? error.message : 'Unknown error.');
    }
}
//# sourceMappingURL=dbCreate.js.map