import { Flex, Button, Box } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import Link from 'next/link';
import router from 'next/router';
import React, { useState } from 'react'
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { toErrorMap } from '../utils/toErrorMap';
import { useForgotPasswordMutation } from '../generated/gql';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';

const ForgotPassword: React.FC<{}> = ({}) => {
    const[complete, setComplete] = useState(false)
    const[, forgotPassword] = useForgotPasswordMutation()
    return (
        <Wrapper variant="small">
        <Formik
          initialValues={{ email: ""}}
          onSubmit={async (values, {setErrors}) => {
            await forgotPassword(values);
            setComplete(true)
          }}
        >
          {({ isSubmitting }) => complete? (
          <Box>
            if an account with that email exists, we sent you an email
          </Box>) : (
            <Form>
              <InputField
                name="email"
                placeholder="email"
                label="email"
              />
              <Button
                mt={4}
                type="submit"
                isLoading={isSubmitting}
                color={'teal'}
              >
                submit
              </Button>
            </Form>
          )}
        </Formik>
      </Wrapper>
    )
}

export default withUrqlClient(createUrqlClient)(ForgotPassword)