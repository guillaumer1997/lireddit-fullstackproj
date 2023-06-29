
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: "http://localhost:4000/graphql",
  documents: "src/graphql/**/*.graphql",
  generates: {
    "src/generated/gql.tsx": {
      plugins: ["typescript-urql", "typescript", "typescript-operations"]
    }
  }
};

export default config;
