import { DeleteIcon, EditIcon } from "@chakra-ui/icons"
import { Box, IconButton } from "@chakra-ui/react"
import Link from "next/link"
import { Post, useDeletePostMutation, useMeQuery } from "../generated/gql"

interface EditDeletePostButtonsProps{
    postId: number
    creatorId: number
}

export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({postId, creatorId}) => {

        const[, deletePost] = useDeletePostMutation()
        const[{data: meData}] = useMeQuery()

        if(meData?.me?.id !== creatorId){
            return null
        }
        
        return (
        <Box>
            <IconButton  mr={4} alignSelf={"center"} ml="auto" aria-label={"Delete Post"} icon={<DeleteIcon/>} onClick={() => {
                deletePost({id: postId})
            }}></IconButton>
                <Link href="/post/edit/[id]" as={`/post/edit/${postId}`}>
                    <IconButton  alignSelf={"center"} ml="auto" aria-label={"Edit Post"} icon={<EditIcon/>}>
                    </IconButton>
                </Link>
        </Box> 
        )
}