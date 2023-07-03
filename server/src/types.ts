import { Request, Response } from "express";
import "express-session";
import { Redis } from "ioredis";
import { createUserLoader } from "./utils/CreateUserLoader";
import { createUpvoteLoader } from "./utils/createUpvoteLoader";

declare module "express-session" {
  export interface Session {
    userId: number;
  }
}

export type MyContext = {
  req: Request;
  redisClient: Redis;
  res: Response;
  userLoader: ReturnType<typeof createUserLoader>;
  upvoteLoader: ReturnType<typeof createUpvoteLoader>;
};
