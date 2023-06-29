import { devtoolsExchange } from "@urql/devtools";
import {  fetchExchange , Exchange, stringifyVariables, gql} from "urql";
import { NullArray, Resolver, Variables, cacheExchange } from "@urql/exchange-graphcache";
import { LogoutMutation, MeQuery, MeDocument, LoginMutation, RegisterMutation, VoteMutationVariables, DeletePostMutationVariables } from "../generated/gql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import{pipe, tap} from "wonka"
import  router  from "next/router";
import { isServer } from "./isServer";

const errorExchange: Exchange = ({forward}) => (ops$) => {
  return pipe(
    forward(ops$),
    tap(({error}) => {
      if(error){
        if(error?.message.includes("not authenticated")){
          router.replace("/login")
        }
      }
    })
  )
}

export const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    console.log(entityKey, fieldName)
    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`
    const isCached = cache.resolve(cache.resolve(entityKey, fieldKey) as string, "posts")
    info.partial = isCached? false : true
    
    let hasMore = true;
    let results: string[] = []
    fieldInfos.forEach(fi => {
      const key = (cache.resolve(entityKey, fi.fieldKey)) as string
      const data = cache.resolve(key, "posts") as string []
      const _hasMore = cache.resolve(key, "hasMore")
      if(!_hasMore){
        hasMore = _hasMore as boolean
      }
      results.push(...data)
      console.log(results)
    })


    return {
      __typename: "PaginatedPosts",
      hasMore: hasMore,
      posts: results
    }
  };
};


export const createUrqlClient = (ssrExchange: any, ctx: any) => {

  let cookie= ""

  if(isServer() && ctx){
    cookie = ctx.req.headers.cookie
  }

  return {
    url: "http://localhost:4000/graphql",
    exchanges: [devtoolsExchange, cacheExchange({
      keys: {
        PaginatedPosts: () => null
      },
      resolvers: {
        Query: {
          posts: cursorPagination()
        }
      },
      updates: {
        Mutation: {

          deletePost: (_result, args, cache, info) => {
            cache.invalidate({__typename: 'Post', id: (args as DeletePostMutationVariables).id})
          },
          vote: (_result, args, cache, info) => {
            const {postId, value} = args as VoteMutationVariables
            const data = cache.readFragment(
              gql`
                fragment _ on Post{
                  id
                  points
                  voteStatus
                }
              `,
              {id: postId}
            ) as any

            if(data){
              if(data.voteStatus === args.value){
                return
              }
              const newPoints = data.points + ((!data.voteStatus ? 1 : 2) * value)
              cache.writeFragment(
                gql`
                  fragment _ on Post{ 
                    points
                    voteStatus
                  }
                `
                ,
                {id: postId, points: newPoints, voteStatus: value}
              )
            }
          },
          createPost: (_result, args, cache, info) => {
            const allFields = cache.inspectFields('Query')
            const fieldInfos = allFields.filter((info) => info.fieldName === 'posts')
            fieldInfos.forEach((fi) => {
              cache.invalidate('Query', 'posts', fi.arguments)
            })
          },
          logout: (_result, args, cache, info) => {
            
            betterUpdateQuery<LogoutMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              () => ({ me: null })
            );
          },
          login: (_result, args, cache, info) => {
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.login.errors) {
                  return query;
                } else {
                  return {
                    me: result.login.user,
                  };
                }
              }
            );
          },
          register: (_result, args, cache, info) => {
            betterUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.register.errors) {
                  return query;
                } else {
                  return {
                    me: result.register.user,
                  };
                }
              }
            );
          },
        },
      },
    }),  errorExchange, fetchExchange, ssrExchange,],
    fetchOptions:{
      credentials: "include" as const,
      headers: cookie ? {
        cookie
      } : undefined
    }
  }}

