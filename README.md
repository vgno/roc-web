# roc-web

Base egg for web applications built with Roc. Uses __Koa__ and __Webpack__ internally.

## Important

### favicon
This egg expects that there exists a folder named `static` and inside it at least a `favicon.png` in the root from where the application is started. That means that if a user starts it in `/User/admin` the `static` folder is expected to be located at `/User/admin/static`.

### static folder
All files that are added to this folder will be exposed from the server. Is expected to be located in the same folder from which the server is started as mentioned above.
Using this you could for instance create a `index.html`
 file and add it to the static folder then when browsing the application you will be seeing that same `index.html` in your browser.
