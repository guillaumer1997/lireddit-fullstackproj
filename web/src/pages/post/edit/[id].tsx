import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../../utils/createUrqlClient";
import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import  { useRouter } from "next/router";
import { InputField } from "../../../components/InputField";
import { Layout } from "../../../components/Layout";
import createPost from "../../create-post";
import { usePostQuery, useUpdatePostMutation } from "../../../generated/gql";
import { title } from "process";
import { isServer } from "../../../utils/isServer";

export const EditPost=({}) => {
    const router = useRouter()
    const postId = typeof router.query.id  === 'string' ? parseInt(router.query.id) : -1
    const [{data,error,  fetching}] = usePostQuery({
        pause: postId === -1,
        variables: {
            id: postId
        }
    })
    const [, updatePost] = useUpdatePostMutation()

    if(fetching || isServer()){
        return(
            <div>...loading</div>
        )
    }

    if(!data?.post){
        return(
            <Layout>
                <Box>could not find post</Box>
            </Layout>
        )
    }

    return(
        <Layout variant = {"small"}>
            <Formik
                initialValues={{ title: data.post.title, text: data.post.text}}
                onSubmit={async (values) => {  
                    await updatePost({id: postId, ...values})   
                    router.push("/")       
                }}
            >
                {({ isSubmitting }) => (
                <Form>
                    <InputField
                            name="title"
                            placeholder="title"
                            label="title" 
                    />
                    <Box mt={4}>
                        <InputField
                                name="text"
                                placeholder="text..."
                                label="body" 
                                textArea={true}                        
                        />
                    </Box>
                    <Button
                        mt={4}
                        type="submit"
                        isLoading={isSubmitting}
                        color={'teal'}
                    >
                    edit post
                    </Button>
                </Form>
                )}
            </Formik>
        </Layout>
    )
}

export default withUrqlClient(createUrqlClient)(EditPost)
