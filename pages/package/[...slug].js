import { useRouter } from "next/router";

export default function Package() {
  const { query, isReady } = useRouter();
  return <h1>Package: {isReady ? query.slug?.join("/") : "loading"}</h1>;
}
