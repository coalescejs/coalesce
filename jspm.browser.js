SystemJS.config({
  baseURL: "/",
  production: false,
  paths: {
    "coalesce-tests/": "tests/",
    "coalesce/": "src/",
    "github:": "jspm_packages/github/",
    "npm:": "jspm_packages/npm/"
  }
});
