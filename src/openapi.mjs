import SwaggerParser from "@apidevtools/swagger-parser";
import { Validator } from "jsonschema";
import { streamToString } from "browser-stream-util";

export async function loadOpenAPI(t, url) {
  t.context.api = await SwaggerParser.validate(url);
  if (!t.context.url) {
    t.context.url = t.context.api.servers[0].url;
  }
}

export function asArray(value) {
  return Array.isArray(value) ? value : value === undefined ? [] : [value];
}

/**
 * Strips away etag flags (weak and the like)
 * @param {string|null} etag
 * @returns {string|undefined} raw etag
 */
export function rawTagData(etag) {
  return etag?.replace(/W\//, "");
}

/**
 *
 * @param {*} t
 * @param {string} path
 * @param {Object} allExpected
 */
export async function assertOpenapiPath(t, path, allExpected) {
  const definionPerPath = t.context.api.paths?.[path];
  t.truthy(definionPerPath, `Does not exists in api: ${path}`);

  const parameters = definionPerPath.parameters || [];
  const validator = new Validator();

  for (const [method, definition] of Object.entries(definionPerPath)) {
    if (method === "parameters") {
      continue;
    }
    for (const [definitionResponseCode, definitionResponse] of Object.entries(
      definition.responses
    )) {
      const expected =
        asArray(allExpected[method] || {}).find(
          e => e[definitionResponseCode]
        ) || {};

      const headers = new Headers();
      const options = { method, headers };

      if (t.context.token) {
        headers.append("Authorization", `Bearer ${t.context.token}`);
      }

      let pathParameters = {};

      for (const parameter of parameters) {
        if (parameter.in === "path") {
          pathParameters[parameter.name] =
            allExpected[method]?.parameters?.[parameter.name];
        }
      }

      let extraTitle = "";

      switch (definitionResponseCode) {
        case "401":
          extraTitle = " unauthorized";
          headers.delete("Authorization");
          break;
        case "404":
          extraTitle = " without parameters";
          pathParameters = {};
          break;
        case "406":
          headers.append("accept", "application/xml");
          extraTitle = " none acceptable type";
          break;
        case "415":
          headers.append("Content-Type", "application/unknown");
          options.body = "unknown";
          break;
        default:
          let body = expected[definitionResponseCode]?.request?.body || expected.request?.body

          if (body) {
            switch (typeof body) {
              case "object":
                headers.append("Content-Type", "application/json");
                options.body = JSON.stringify(body);
                break;
              case "string":
                headers.append("Content-Type", "text/plain");
                options.body = body;
            }
          }
      }

      const url = path.replaceAll(
        /\{(\w+)\}/g,
        (match, a) => pathParameters[a]
      );

      let response = await fetch(t.context.url + url, options);

      if (definitionResponseCode === "304") {
        const etag = rawTagData(response.headers.get("etag"));
        if (etag) {
          extraTitle = " etag";
          headers.append("If-None-Match", etag);
          response = await fetch(t.context.url + url, options);
        }
      }

      t.log(
        `${method} ${url} ${
          options.body || ""
        }${extraTitle} (${definitionResponseCode}) ${
          response.status
        } ${JSON.stringify(expected)}`
      );

      t.is(
        response.status,
        parseInt(definitionResponseCode),
        `Unexpected status code ${method} ${path}`
      );

      t.truthy(
        definitionResponse,
        `Unexpected status code ${response.status} ${method} ${path}`
      );

      let body = response.body ? await streamToString(response.body) : "";
      let contentType = response.headers.get("content-type");
      contentType = contentType?.split(/\s*;\s*/)[0];

      const definitionContent = definitionResponse?.content?.[contentType];

      if (!definitionContent && response.status === "200") {
        t.fail(
          `Unsupported content type '${contentType}' ${response.status} ${method} ${path}`
        );
      }

      if (definitionResponse?.content) {
        const e = expected[definitionResponseCode];

        switch (contentType) {
          case "application/json":
            body = JSON.parse(body);

          case "text/plain":
          case "application/text":
            if (definitionContent?.schema) {
              const validationResult = validator.validate(
                body,
                definitionContent.schema
              );

              /*console.log(
                body,
                contentType,
                validationResult
              );*/
              if (validationResult.errors.length > 0) {
                t.log(validationResult.errors.join(","));

                t.is(validationResult.errors.length, 0, "validation errors");
              }
            }
            break;

          default:
            t.log(
              `Unsupported content type '${contentType}' ${method} ${path}`
            );
        }
      }
    }
  }
}

/**
 *
 * @param {*} t
 * @param {string|RegExp} path
 * @param {Object} expected
 */
export async function openapiPathTest(t, path, expected = {}) {
  if (path instanceof RegExp) {
    for (const matchingPath of Object.keys(t.context.api.paths).filter(p =>
      p.match(path)
    )) {
      await assertOpenapiPath(t, matchingPath, expected);
    }
  } else {
    await assertOpenapiPath(t, path, expected);
  }
}

openapiPathTest.title = (providedTitle = "openapi", path, expected = {}) =>
  `${providedTitle} ${path} ${Object.keys(expected)}`.trim();
