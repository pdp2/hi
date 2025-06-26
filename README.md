# hi
Repo for my personal website.

## Pre-requisites for running locally

- Installation of [Deno](https://deno.com/)

## Development

Run a local file server from the `./docs` folder with this command:

```
deno run --allow-net --allow-read --allow-sys scripts/serve.js
```

Most of the files in the `./docs` folder should not be edited directly as they are built using the files in the `./templates` and `./posts` folder. To build run:

```
deno run --allow-read --allow-write scripts/build.js
```

❗️ Remember this 👆 before pushing your changes otherwise it will not work...

## Testing

To run the tests use this command from the root of the project:

```
deno test
```

## Deployment
Commits to the `main` branch trigger a deployment to GitHub pages. The website can be viewed at https://pdp2.github.io/hi/. That's it at the moment 😎