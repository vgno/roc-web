Available Settings
---

# Runtime

| Name                     | Description                                                                                                                    | Path                                | CLI Flag                         | Default                       | Type                      | Required |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- | -------------------------------- | ----------------------------- | ------------------------- | -------- |
| port                     | Port for the server to use                                                                                                     | runtime.port                        | --port                           | `3000`                        | `Integer`                 | No       |
| serve                    | What folder the server should expose                                                                                           | runtime.serve                       | --serve                          | `["build/client"]`            | `Filepath / [ Filepath ]` | No       |
| favicon                  | Path to the favicon file, specially handled on the server                                                                      | runtime.favicon                     | --favicon                        | `null`                        | `String`                  | No       |
| startBundle              | Relative path to a bundle to start when calling &quot;start&quot;, not be needed in most cases                                 | runtime.startBundle                 | --startBundle                    | `null`                        | `Filepath`                | No       |

## Debug

| Name                     | Description                                                                                                                    | Path                                | CLI Flag                         | Default                       | Type                      | Required |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- | -------------------------------- | ----------------------------- | ------------------------- | -------- |
| server                   | Filter for debug messages that should be shown for the server, see https://npmjs.com/package/debug                             | runtime.debug.server                | --debug-server                   | `"roc:*"`                     | `String`                  | No       |

## Koa
Settings for how Koa should handle paths

### Lowercase

| Name                     | Description                                                                                                                    | Path                                | CLI Flag                         | Default                       | Type                      | Required |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- | -------------------------------- | ----------------------------- | ------------------------- | -------- |
| enabled                  | If paths should be transformed to lowercase                                                                                    | runtime.koa.lowercase.enabled       | --koa-lowercase-enabled          | `true`                        | `Boolean`                 | No       |
| defer                    | If this should be performed after looking for a file on disk                                                                   | runtime.koa.lowercase.defer         | --koa-lowercase-defer            | `true`                        | `Boolean`                 | No       |

### Normalize

| Name                     | Description                                                                                                                    | Path                                | CLI Flag                         | Default                       | Type                      | Required |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- | -------------------------------- | ----------------------------- | ------------------------- | -------- |
| enabled                  | If paths should be normalized, that is remove extra slashes                                                                    | runtime.koa.normalize.enabled       | --koa-normalize-enabled          | `true`                        | `Boolean`                 | No       |
| defer                    | If this should be performed after looking for a file on disk                                                                   | runtime.koa.normalize.defer         | --koa-normalize-defer            | `false`                       | `Boolean`                 | No       |

### TrailingSlashes

| Name                     | Description                                                                                                                    | Path                                | CLI Flag                         | Default                       | Type                      | Required |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- | -------------------------------- | ----------------------------- | ------------------------- | -------- |
| enabled                  | Set to true to enforce trailing slashes, false to remove them and null for no rule                                             | runtime.koa.trailingSlashes.enabled | --koa-trailingSlashes-enabled    | `true`                        | `Boolean`                 | No       |
| defer                    | If this should be performed after looking for a file on disk                                                                   | runtime.koa.trailingSlashes.defer   | --koa-trailingSlashes-defer      | `true`                        | `Boolean`                 | No       |

# Dev

| Name                     | Description                                                                                                                    | Path                                | CLI Flag                         | Default                       | Type                      | Required |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- | -------------------------------- | ----------------------------- | ------------------------- | -------- |
| debug                    | Filter for debug messages that should be shown for the server, see https://npmjs.com/package/debug                             | dev.debug                           | --dev-debug                      | `"roc:*"`                     | `String`                  | No       |
| port                     | Port for the dev server, will need to be a free range of at least 3                                                            | dev.port                            | --dev-port                       | `3001`                        | `Integer`                 | No       |
| watch                    | Files/folders that should trigger a restart of the server                                                                      | dev.watch                           | --dev-watch                      | `["config/","roc.config.js"]` | `Filepath / [ Filepath ]` | No       |
| reloadOnServerChange     | If Browsersync should reload the browser when the server is rebuilt                                                            | dev.reloadOnServerChange            | --dev-reloadOnServerChange       | `false`                       | `Boolean`                 | No       |
| open                     | If Browsersync should open the server when it has started                                                                      | dev.open                            | --dev-open                       | `false`                       | `Boolean`                 | No       |

## DevMiddleware

| Name                     | Description                                                                                                                    | Path                                | CLI Flag                         | Default                       | Type                      | Required |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- | -------------------------------- | ----------------------------- | ------------------------- | -------- |
| noInfo                   | If no info should be sent to the console                                                                                       | dev.devMiddleware.noInfo            | --dev-devMiddleware-noInfo       | `true`                        | `Boolean`                 | No       |
| quiet                    | If nothing should be sent to the console                                                                                       | dev.devMiddleware.quiet             | --dev-devMiddleware-quiet        | `false`                       | `Boolean`                 | No       |

## HotMiddleware

| Name                     | Description                                                                                                                    | Path                                | CLI Flag                         | Default                       | Type                      | Required |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- | -------------------------------- | ----------------------------- | ------------------------- | -------- |
| reload                   | If the browser should be reloaded if it fails to hot update the code                                                           | dev.hotMiddleware.reload            | --dev-hotMiddleware-reload       | `false`                       | `Boolean`                 | No       |
| noInfo                   | If no info should be sent to the console                                                                                       | dev.hotMiddleware.noInfo            | --dev-hotMiddleware-noInfo       | `false`                       | `Boolean`                 | No       |
| quiet                    | If nothing should be sent to the console                                                                                       | dev.hotMiddleware.quiet             | --dev-hotMiddleware-quiet        | `false`                       | `Boolean`                 | No       |

# Build

| Name                     | Description                                                                                                                    | Path                                | CLI Flag                         | Default                       | Type                      | Required |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- | -------------------------------- | ----------------------------- | ------------------------- | -------- |
| path                     | The basepath for the application                                                                                               | build.path                          | --build-path                     | `"/"`                         | `Filepath`                | No       |
| assets                   | An array of files to include into the build process                                                                            | build.assets                        | --build-assets                   | `null`                        | `[ Filepath ]`            | No       |
| mode                     | What mode the application should be built for. Possible values are &quot;dev&quot;, &quot;dist&quot; and &quot;test&quot;      | build.mode                          | --build-mode                     | `"dist"`                      | `/^dev|dist|test$/i`      | No       |
| target                   | For what target the application should be built for. Possible values are &quot;client&quot; &amp; &quot;server&quot;           | build.target                        | --build-target                   | `["client","server"]`         | `[ /^client|server$/i ]`  | No       |
| disableProgressbar       | Should the progress bar be disabled for builds                                                                                 | build.disableProgressbar            | --build-disableProgressbar       | `false`                       | `Boolean`                 | No       |
| outputName               | The name of the generated application bundle, will be appended &quot;roc.js&quot;                                              | build.outputName                    | --build-outputName               | `"app"`                       | `String`                  | No       |
| moduleBuild              | NOT IMPLEMENTED YET                                                                                                            | build.moduleBuild                   | --build-moduleBuild              | `false`                       | `Unknown`                 | No       |
| moduleStyle              | NOT IMPLEMENTED YET                                                                                                            | build.moduleStyle                   | --build-moduleStyle              | `null`                        | `Unknown`                 | No       |
| koaMiddlewares           | The koa middlewares to add to the server instance, will be added after the default  middlewares                                | build.koaMiddlewares                | --build-koaMiddlewares           | `"koa-middlewares.js"`        | `Filepath`                | No       |
| useDefaultKoaMiddlewares | If Roc should use internally defined koa middlewares, please look at the  documentation for what middlewares that are included | build.useDefaultKoaMiddlewares      | --build-useDefaultKoaMiddlewares | `true`                        | `Boolean`                 | No       |

## Entry

| Name                     | Description                                                                                                                    | Path                                | CLI Flag                         | Default                       | Type                      | Required |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- | -------------------------------- | ----------------------------- | ------------------------- | -------- |
| client                   | The client entry point file                                                                                                    | build.entry.client                  | --build-entry-client             | `"src/client/index.js"`       | `Filepath`                | No       |
| server                   | The server entry point file                                                                                                    | build.entry.server                  | --build-entry-server             | `"src/server/index.js"`       | `Filepath`                | No       |

## OutputPath

| Name                     | Description                                                                                                                    | Path                                | CLI Flag                         | Default                       | Type                      | Required |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- | -------------------------------- | ----------------------------- | ------------------------- | -------- |
| client                   | The output directory for the client build                                                                                      | build.outputPath.client             | --build-outputPath-client        | `"build/client"`              | `Filepath`                | No       |
| server                   | The output directory for the server build                                                                                      | build.outputPath.server             | --build-outputPath-server        | `"build/server"`              | `Filepath`                | No       |
