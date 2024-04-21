[![npm](https://img.shields.io/npm/v/ava-openapi.svg)](https://www.npmjs.com/package/ava-openapi)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![Typed with TypeScript](https://flat.badgen.net/badge/icon/Typed?icon=typescript\&label\&labelColor=blue\&color=555555)](https://typescriptlang.org)
[![bundlejs](https://deno.bundlejs.com/?q=ava-openapi\&badge=detailed)](https://bundlejs.com/?q=ava-openapi)
[![downloads](http://img.shields.io/npm/dm/ava-openapi.svg?style=flat-square)](https://npmjs.org/package/ava-openapi)
[![GitHub Issues](https://img.shields.io/github/issues/arlac77/ava-openapi.svg?style=flat-square)](https://github.com/arlac77/ava-openapi/issues)
[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Farlac77%2Fava-openapi%2Fbadge\&style=flat)](https://actions-badge.atrox.dev/arlac77/ava-openapi/goto)
[![Styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Known Vulnerabilities](https://snyk.io/test/github/arlac77/ava-openapi/badge.svg)](https://snyk.io/test/github/arlac77/ava-openapi)
[![Coverage Status](https://coveralls.io/repos/arlac77/ava-openapi/badge.svg)](https://coveralls.io/github/arlac77/ava-openapi)

# ava-openapi

ava openapi testing support

```js
import test from "ava";
import { loadOpenAPI, openapiPathTest } from "ava-openapi";

test.before(async t => {
  await loadOpenAPI(
    t,
    "https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.2022-11-28.json"
  );
});

test(openapiPathTest, "/", {});
```

# install

With [npm](http://npmjs.org) do:

```shell
npm install ava-openapi
```

# license

BSD-2-Clause
