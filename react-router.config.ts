import type { Config } from "@react-router/dev/config";
import { CASE_STUDIES } from "./src/data/case-studies.ts";

export default {
  appDirectory: "src",
  ssr: false,
  async prerender({ getStaticPaths }) {
    return [...getStaticPaths(), ...CASE_STUDIES.map((cs) => `/case-studies/${cs.slug}`)];
  },
} satisfies Config;
