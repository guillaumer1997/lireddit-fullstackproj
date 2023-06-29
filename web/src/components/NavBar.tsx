import { Box, Button, Flex, Heading, Link} from "@chakra-ui/react";
import { useLogoutMutation, useMeQuery } from "../generated/gql";
import router, { useRouter } from "next/router";
import { isServer } from "../utils/isServer";

interface NavBarProps{

}

export const NavBar: React.FC<NavBarProps> = ({}) => {
    const[{data, fetching}] = useMeQuery({
        pause: isServer()
    })
    const[{fetching: logoutFetching}, logout] = useLogoutMutation()
    let body = null

    //loading data
    if (isServer() || fetching){
        body = null
        //user is logged in
    } else if (!data?.me){
        body = (
                
                <><Link mr={2} href="/login">login</Link><Link href="/register">register</Link></>
            
        )
        //user is not logged in
    } else{
        body = (
            <Flex align={"center"}>
                <Box mr={6}>
                    <Button as={Link}>
                    <Link href="/create-post">
                        create post
                    </Link>
                    </Button>
                </Box>
                <Box mr={2}>{data.me.username}</Box>
                <Button onClick = {async () => {
                    await logout({})
                    router.reload()
                }} 
                isLoading = {logoutFetching}
                variant="link">logout</Button>
            </Flex>
        )
    }
    return(

        <Flex zIndex={1} position="sticky" top={0} bg='tomato' p ={4}>
            <Flex flex={1} m="auto" align={"center"} maxW={800}>
            <Link href="/">
                <Heading>LiReddit</Heading>
            </Link>
            <Box ml={'auto'}>{body}</Box>
            </Flex>
        </Flex>
    )
}