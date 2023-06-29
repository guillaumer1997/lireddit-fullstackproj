import React from "react";
import { Formik, Form } from "formik";
import {
  Box,
  Button,
} from "@chakra-ui/react";

import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { useRegisterMutation } from "../generated/gql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";

interface registerProps {}


const Register: React.FC<registerProps> = ({}) => {
  const router = useRouter();
  const [, register] = useRegisterMutation()
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "", username: "", password: "" }}
        onSubmit={async (values, {setErrors}) => {
          const response = await register(values);
          if(response.data?.register.errors){
            setErrors(
              toErrorMap(response.data?.register.errors)  
            )
          }
          else if (response.data.register.user){
            //this worked
            router.push('/');
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="username"
              placeholder="username"
              label="Username"
            />
            <Box mt={4}>
              <InputField
                name="email"
                placeholder="email"
                label="email"
                type="email"
              />
            </Box>
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              color={'teal'}
            >
              register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Register);
