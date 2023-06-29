"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("dotenv-safe/config");
const constants_1 = require("./constants");
const express_1 = __importStar(require("express"));
const server_1 = require("@apollo/server");
const type_graphql_1 = require("type-graphql");
const hello_1 = require("./resolvers/hello");
const post_1 = require("./resolvers/post");
const user_1 = require("./resolvers/user");
const ioredis_1 = __importDefault(require("ioredis"));
const express_session_1 = __importDefault(require("express-session"));
const cors_1 = __importDefault(require("cors"));
const default_1 = require("@apollo/server/plugin/landingPage/default");
const express4_1 = require("@apollo/server/express4");
const typeorm_config_1 = require("./typeorm-config");
const CreateUserLoader_1 = require("./utils/CreateUserLoader");
const createUpvoteLoader_1 = require("./utils/createUpvoteLoader");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    yield typeorm_config_1.dataSource.initialize();
    yield typeorm_config_1.dataSource.runMigrations();
    const app = (0, express_1.default)();
    const redisClient = new ioredis_1.default(process.env.REDIS_URL);
    const RedisStore = require("connect-redis").default;
    app.set("proxy", 1);
    let redisStore = new RedisStore({
        client: redisClient,
        disableTouch: true
    });
    app.use((0, cors_1.default)({
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }));
    app.use((0, express_session_1.default)({
        name: constants_1.COOKIE_NAME,
        store: redisStore,
        secret: process.env.SESSION_SECRET,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
            httpOnly: true,
            sameSite: 'lax',
            secure: constants_1.__prod__,
            domain: constants_1.__prod__ ? ".guillaumerdev.com" : undefined
        },
        saveUninitialized: false,
        resave: false
    }));
    let plugins = [];
    if (process.env.NODE_ENV === "production") {
        plugins = [
            (0, default_1.ApolloServerPluginLandingPageProductionDefault)({
                embed: true,
                graphRef: "myGraph@prod",
                includeCookies: true,
            }),
        ];
    }
    else {
        plugins = [
            (0, default_1.ApolloServerPluginLandingPageLocalDefault)({
                embed: true,
                includeCookies: true,
            }),
        ];
    }
    const apolloServer = new server_1.ApolloServer({
        schema: yield (0, type_graphql_1.buildSchema)({
            resolvers: [hello_1.HelloResolver, post_1.PostResolver, user_1.UserResolver],
            validate: false
        }),
        plugins: plugins
    });
    yield apolloServer.start();
    app.use('/', (0, express_1.json)(), (0, express4_1.expressMiddleware)(apolloServer, {
        context: ({ req, res }) => __awaiter(void 0, void 0, void 0, function* () { return ({ req, res, redisClient, userLoader: (0, CreateUserLoader_1.createUserLoader)(), upvoteLoader: (0, createUpvoteLoader_1.createUpvoteLoader)() }); }),
    }));
    app.listen(parseInt(process.env.PORT), () => {
        console.log('server started on localhost:4000');
    });
});
main();
//# sourceMappingURL=index.js.map