import "dotenv-safe/config"
import { DataSource } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import path from "path"
import { Upvote } from "./entities/Upvote";

export const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    logging: true,
    //synchronize: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [Post, User, Upvote]
})


