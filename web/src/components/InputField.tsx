import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Textarea,
} from "@chakra-ui/react";
import { useField } from "formik";
import React, { InputHTMLAttributes } from "react";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> &
  InputHTMLAttributes<HTMLTextAreaElement> & {
    label: string;
    name: string;
    textArea?: boolean;
  };

export const InputField: React.FC<InputFieldProps> = ({
  label,
  textArea,
  size,
  ...props
}) => {
  const [field, { error }] = useField(props);
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label} </FormLabel>
      {textArea ? (
        <Textarea {...field} {...props} id={field.name}></Textarea>
      ) : (
        <Input {...field} {...props} id={field.name}></Input>
      )}
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
};
