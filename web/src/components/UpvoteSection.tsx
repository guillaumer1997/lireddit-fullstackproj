import { Flex, IconButton, Link} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { PostSnippetFragment, PostsQuery, useVoteMutation } from "../generated/gql";

interface UpvoteSectionProps{
   post: PostSnippetFragment;
}

export const UpvoteSection: React.FC<UpvoteSectionProps> = ({post}) => {
    const[, vote] = useVoteMutation()
    return (
        <Flex direction="column" justifyContent={"center"} alignItems={"center"} mr={4}>
            <IconButton onClick={() => {
                if(post.voteStatus === 1){
                    return
                }

                vote({
                    value: 1,
                    postId: post.id
                })
             } }
             color={post.voteStatus === 1? "green" : undefined}
             boxSize={6} aria-label={"Upvote"} icon={<ChevronUpIcon/>}></IconButton>
            {post.points}
            <IconButton onClick={() => {
                if(post.voteStatus === -1){
                    return
                }
                vote({
                    value: -1,
                    postId: post.id
                })
             } }
             
             color={post.voteStatus === -1? "tomato": undefined}
            boxSize={6} aria-label={"Downvote"} icon={<ChevronDownIcon/>}></IconButton>
        </Flex>
    )
}