import test from "ava";
import { loadOpenAPI, openapiPathTest } from "ava-openapi";

test.before(async t => {
  await loadOpenAPI(
    t,
    "https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/ghec/ghec.2022-11-28.json"
  );
});

test(openapiPathTest, "/app", {});
