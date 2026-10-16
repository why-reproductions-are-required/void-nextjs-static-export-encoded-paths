import { defineConfig } from "void/config";

export default defineConfig({
  inference: {
    appType: "static",
    build: "npm run build",
    outputDir: "out",
  },
  routing: {
    rewrites: {
      "/package/*": "/package/[...slug].html",
    },
    fallbacks: {
      "/*": "/index.html",
    },
  },
});
