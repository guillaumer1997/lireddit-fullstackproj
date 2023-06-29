import DataLoader from 'dataloader'
import { In } from 'typeorm';
import { Upvote } from '../entities/Upvote';

export const createUpvoteLoader = () => new DataLoader<{postId: number; userId: number}, Upvote | null>
(async (keys) => {

    const userIds = keys.map(id => id.userId)
    const postIds = keys.map(id => id.postId)

    const upvotes = await Upvote.find({ where: {
        userId: In(userIds),
        postId: In(postIds)
    }})
    const upvoteIdsToUpvote: Record<string, Upvote> ={}
    upvotes.forEach((u) => {
        upvoteIdsToUpvote[`${u.userId}|${u.postId}`] = u
    })


   return keys.map((key) => upvoteIdsToUpvote[`${key.userId}|${key.postId}`])
});