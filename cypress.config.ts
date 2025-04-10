import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    projectId: "puuciy",
    baseUrl: "http://localhost:3000",
    setupNodeEvents(_on, _config) {
      // implement node event listeners here
    },
  },
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
});
