import router from "next/router";
import { useEffect } from "react";
import { useMeQuery } from "../generated/gql";

export const useIsAuth = () => {
  const [{ data, fetching }] = useMeQuery();
  useEffect(() => {
    if (!fetching && !data?.me) {
      router.replace("/login?next=" + router.pathname);
    }
  }, [data, router]);
};
