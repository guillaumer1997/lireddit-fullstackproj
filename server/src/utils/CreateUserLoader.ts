import DataLoader from 'dataloader'
import { User } from '../entities/User';
import { In } from 'typeorm';

export const createUserLoader = () => new DataLoader<number, User>(async userIds => {
    const users = await User.find({
        where: {id: In(userIds)}
    })

    const userIdToUser: Record<number, User> ={}
    users.forEach(u => {
        userIdToUser[u.id] = u
    })


   const maps = userIds.map((userId) => userIdToUser[userId])
   return maps
});