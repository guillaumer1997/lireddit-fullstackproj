"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSource = void 0;
require("dotenv-safe/config");
const typeorm_1 = require("typeorm");
const Post_1 = require("./entities/Post");
const User_1 = require("./entities/User");
const path_1 = __importDefault(require("path"));
const Upvote_1 = require("./entities/Upvote");
exports.dataSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    logging: true,
    migrations: [path_1.default.join(__dirname, "./migrations/*")],
    entities: [Post_1.Post, User_1.User, Upvote_1.Upvote]
});
//# sourceMappingURL=typeorm-config.js.map