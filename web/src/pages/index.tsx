import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import {
  useDeletePostMutation,
  useMeQuery,
  usePostsQuery,
  useUpdatePostMutation,
} from "../generated/gql";
import { isServer } from "../utils/isServer";
import { Layout } from "../components/Layout";
import Link from "next/link";
import { Box, Flex, Heading, Stack, Text, Button } from "@chakra-ui/react";
import { useState } from "react";
import { UpvoteSection } from "../components/UpvoteSection";
import { EditDeletePostButtons } from "../components/EditDeletePostButtons";

const Index = () => {
  const [variables, setVariables] = useState({ limit: 15, cursor: null });
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });
  console.log("data:", data);
  let body = null;

  if (fetching || isServer()) {
    body = <div>..loading</div>;
  } else {
    body = (
      <>
        <Stack spacing={8}>
          {data.posts.posts.map((p) =>
            !p ? null : (
              <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
                <UpvoteSection post={p}></UpvoteSection>
                <Box flex={1}>
                  <Link href="/post/[id]" as={`/post/${p.id}`}>
                    <Heading fontSize="xl">{p.title}</Heading>
                  </Link>
                  <Text>posted by {p.originalPoster.username}</Text>
                  <Flex align={"center"}>
                    <Text mt={4} flex={1}>
                      {p.textSnippet}
                    </Text>
                    <Box ml="auto">
                      <EditDeletePostButtons
                        postId={p.id}
                        creatorId={p.originalPoster.id}
                      />
                    </Box>
                  </Flex>
                </Box>
              </Flex>
            )
          )}
        </Stack>
        {data.posts.hasMore ? (
          <Flex>
            <Button
              onClick={() => {
                setVariables({
                  limit: variables.limit,
                  cursor:
                    data.posts.posts[data.posts.posts.length - 1].createdAt,
                });
              }}
              m="auto"
              my={8}
            >
              load more
            </Button>
          </Flex>
        ) : null}
      </>
    );
  }

  return (
    <Layout>
      <br />
      {body}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
