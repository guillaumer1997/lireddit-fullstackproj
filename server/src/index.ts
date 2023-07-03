import "reflect-metadata";
import "dotenv-safe/config";
import { COOKIE_NAME, __prod__ } from "./constants";
import express, { json } from "express";
import { ApolloServer } from "@apollo/server";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import redis from "ioredis";
import session from "express-session";
import { MyContext } from "./types";
import cors from "cors";
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from "@apollo/server/plugin/landingPage/default";
import { expressMiddleware } from "@apollo/server/express4";
import { dataSource } from "./ormconfig";
import { createUserLoader } from "./utils/CreateUserLoader";
import { createUpvoteLoader } from "./utils/createUpvoteLoader";

const main = async () => {
  await dataSource.initialize();
  await dataSource.runMigrations();

  //create app
  const app = express();
  const redisClient = new redis(process.env.REDIS_URL);
  const RedisStore = require("connect-redis").default;
  app.set("proxy", 1);

  let redisStore = new RedisStore({
    client: redisClient,
    disableTouch: true,
  });

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: redisStore,
      secret: process.env.SESSION_SECRET,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years
        httpOnly: true,
        sameSite: "lax",
        secure: __prod__, //cookie only works in https
        domain: __prod__ ? ".guillaumerdev.com" : undefined,
      },
      saveUninitialized: false,
      resave: false,
    })
  );

  let plugins: any = [];
  if (process.env.NODE_ENV === "production") {
    plugins = [
      ApolloServerPluginLandingPageProductionDefault({
        embed: true,
        graphRef: "myGraph@prod",
        includeCookies: true,
      }),
    ];
  } else {
    plugins = [
      ApolloServerPluginLandingPageLocalDefault({
        embed: true,
        includeCookies: true, // very important
      }),
    ];
  }

  const apolloServer = new ApolloServer<MyContext>({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    plugins: plugins,
  });
  await apolloServer.start();

  app.use(
    "/",
    json(),
    // expressMiddleware accepts the same arguments:
    // an Apollo Server instance and optional configuration options
    expressMiddleware(apolloServer, {
      context: async ({ req, res }) => ({
        req,
        res,
        redisClient,
        userLoader: createUserLoader(),
        upvoteLoader: createUpvoteLoader(),
      }),
    })
  );

  //apolloServer.applyMiddleware({app, cors:false});
  app.listen(parseInt(process.env.PORT), () => {
    console.log("server started on localhost:4000");
  });
};

main();
