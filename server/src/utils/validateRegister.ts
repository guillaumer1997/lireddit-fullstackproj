export const validateRegister = (
  email: string,
  username: string,
  password: string
) => {
  if (!email.includes("@")) {
    return {
      errors: [
        {
          field: "email",
          message: "email must include an @ sign",
        },
      ],
    };
  }

  if (username.length <= 2) {
    return {
      errors: [
        {
          field: "username",
          message: "username must be greater than 2",
        },
      ],
    };
  }

  if (username.includes("@")) {
    return {
      errors: [
        {
          field: "username",
          message: "username cannot include an @",
        },
      ],
    };
  }

  if (password.length <= 2) {
    return {
      errors: [
        {
          field: "password",
          message: "password must be greater than 2",
        },
      ],
    };
  }
  return null;
};
