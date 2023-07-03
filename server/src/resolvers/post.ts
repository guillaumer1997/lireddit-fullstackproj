import { MyContext } from "../types";
import { Post } from "../entities/Post";
import {
  Resolver,
  Query,
  Arg,
  Int,
  Mutation,
  Ctx,
  UseMiddleware,
  FieldResolver,
  Root,
  Field,
  ObjectType,
} from "type-graphql";
import { isAuth } from "../middleware/isAuth";
import { dataSource } from "../ormconfig";
import { Upvote } from "../entities/Upvote";
import { User } from "../entities/User";

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];

  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @FieldResolver(() => User)
  originalPoster(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(post.creatorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { upvoteLoader, req }: MyContext
  ) {
    const upvote = await upvoteLoader.load({
      postId: post.id,
      userId: req.session.userId,
    });
    return upvote ? upvote.value : null;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const isUpvote = value !== -1;
    const _value = isUpvote ? 1 : -1;
    const userId = req.session.userId;

    const upvote = await Upvote.findOne({
      where: {
        postId,
        userId,
      },
    });

    if (upvote && upvote.value !== _value) {
      await dataSource.transaction(async (tm) => {
        await tm.query(`
                update upvote 
                set value = ${_value}
                where "postId" = ${postId} and "userId" = ${userId};
            `);

        await tm.query(`
                update post
                set points = points + ${2 * _value}
                where id = ${postId};
            `);
      });
    } else if (!upvote) {
      await dataSource.transaction(async (tm) => {
        await tm.query(`
                insert into upvote ("userId", "postId", value)
                values(${userId}, ${postId}, ${_value});
            `);

        await tm.query(`
                update post
                set points = points + ${_value}
                where id = ${postId};`);
      });
    }

    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const hasMoreLimit = realLimit + 1;

    const queryReplacements: any[] = [hasMoreLimit];

    let cursorIndex = 3;
    if (cursor) {
      queryReplacements.push(new Date(parseInt(cursor)));
      cursorIndex = queryReplacements.length;
    }

    const posts = await dataSource.query(
      `
            select p.*
            from public.post as p 
            ${cursor ? `where p."createdAt" < $${cursorIndex}` : ""}
            order by p."createdAt" DESC
            limit $1
        `,
      queryReplacements
    );

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === hasMoreLimit ? true : false,
    };
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg("id", () => Int) id: number): Promise<Post | null> {
    const post = await dataSource.query(`
        select p.id,
        p."createdAt",
        p."updatedAt",
        p.title,
        p.points,
        p.text,
        p."creatorId"
        from post as p
        where p.id = ${id}
        `);

    return post[0];
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("title", () => String) title: string,
    @Arg("text", () => String) text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({
      title: title,
      text: text,
      creatorId: req.session.userId,
    }).save();
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title", () => String) title: string,
    @Arg("text", () => String) text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const result = await dataSource
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
      .returning("*")
      .execute();

    return result.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    await Post.delete({
      id,
      creatorId: req.session.userId,
    });
    return true;
  }
}
