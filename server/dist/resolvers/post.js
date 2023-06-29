"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostResolver = void 0;
const Post_1 = require("../entities/Post");
const type_graphql_1 = require("type-graphql");
const isAuth_1 = require("../middleware/isAuth");
const typeorm_config_1 = require("../typeorm-config");
const Upvote_1 = require("../entities/Upvote");
const User_1 = require("../entities/User");
let PaginatedPosts = class PaginatedPosts {
};
__decorate([
    (0, type_graphql_1.Field)(() => [Post_1.Post]),
    __metadata("design:type", Array)
], PaginatedPosts.prototype, "posts", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Boolean)
], PaginatedPosts.prototype, "hasMore", void 0);
PaginatedPosts = __decorate([
    (0, type_graphql_1.ObjectType)()
], PaginatedPosts);
let PostResolver = exports.PostResolver = class PostResolver {
    textSnippet(root) {
        return root.text.slice(0, 50);
    }
    originalPoster(post, { userLoader }) {
        return userLoader.load(post.creatorId);
    }
    voteStatus(post, { upvoteLoader, req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const upvote = yield upvoteLoader.load({ postId: post.id, userId: req.session.userId });
            return upvote ? upvote.value : null;
        });
    }
    vote(postId, value, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const isUpvote = value !== -1;
            const _value = isUpvote ? 1 : -1;
            const userId = req.session.userId;
            const upvote = yield Upvote_1.Upvote.findOne({ where: {
                    postId,
                    userId
                } });
            if (upvote && upvote.value !== _value) {
                yield typeorm_config_1.dataSource.transaction((tm) => __awaiter(this, void 0, void 0, function* () {
                    yield tm.query(`
                update upvote 
                set value = ${_value}
                where "postId" = ${postId} and "userId" = ${userId};
            `);
                    yield tm.query(`
                update post
                set points = points + ${2 * _value}
                where id = ${postId};
            `);
                }));
            }
            else if (!upvote) {
                yield typeorm_config_1.dataSource.transaction((tm) => __awaiter(this, void 0, void 0, function* () {
                    yield tm.query(`
                insert into upvote ("userId", "postId", value)
                values(${userId}, ${postId}, ${_value});
            `);
                    yield tm.query(`
                update post
                set points = points + ${_value}
                where id = ${postId};`);
                }));
            }
            return true;
        });
    }
    posts(limit, cursor) {
        return __awaiter(this, void 0, void 0, function* () {
            const realLimit = Math.min(50, limit);
            const hasMoreLimit = realLimit + 1;
            const queryReplacements = [hasMoreLimit];
            let cursorIndex = 3;
            if (cursor) {
                queryReplacements.push(new Date(parseInt(cursor)));
                cursorIndex = queryReplacements.length;
            }
            const posts = yield typeorm_config_1.dataSource.query(`
            select p.*
            from public.post as p 
            ${cursor ? `where p."createdAt" < $${cursorIndex}` : ''}
            order by p."createdAt" DESC
            limit $1
        `, queryReplacements);
            return {
                posts: posts.slice(0, realLimit),
                hasMore: posts.length === (hasMoreLimit) ? true : false
            };
        });
    }
    post(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield typeorm_config_1.dataSource.query(`
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
        });
    }
    createPost(title, text, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            return Post_1.Post.create({
                title: title,
                text: text,
                creatorId: req.session.userId
            }).save();
        });
    }
    updatePost(id, title, text, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield typeorm_config_1.dataSource.createQueryBuilder()
                .update(Post_1.Post)
                .set({ title, text })
                .where('id = :id and "creatorId" = :creatorId', { id, creatorId: req.session.userId })
                .returning("*")
                .execute();
            return result.raw[0];
        });
    }
    deletePost(id, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Post_1.Post.delete({
                id,
                creatorId: req.session.userId
            });
            return true;
        });
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(() => String),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post]),
    __metadata("design:returntype", void 0)
], PostResolver.prototype, "textSnippet", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => User_1.User),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post, Object]),
    __metadata("design:returntype", void 0)
], PostResolver.prototype, "originalPoster", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => type_graphql_1.Int, { nullable: true }),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "voteStatus", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('postId', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)('value', () => type_graphql_1.Int)),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "vote", null);
__decorate([
    (0, type_graphql_1.Query)(() => PaginatedPosts),
    __param(0, (0, type_graphql_1.Arg)('limit', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)('cursor', () => String, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "posts", null);
__decorate([
    (0, type_graphql_1.Query)(() => Post_1.Post, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "post", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Post_1.Post),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("title", () => String)),
    __param(1, (0, type_graphql_1.Arg)("text", () => String)),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createPost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Post_1.Post, { nullable: true }),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("id", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)("title", () => String)),
    __param(2, (0, type_graphql_1.Arg)("text", () => String)),
    __param(3, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "updatePost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("id", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deletePost", null);
exports.PostResolver = PostResolver = __decorate([
    (0, type_graphql_1.Resolver)(Post_1.Post)
], PostResolver);
//# sourceMappingURL=post.js.map