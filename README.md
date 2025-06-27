# hi
Repo for my personal website.

## Pre-requisites for running locally

- Installation of [Deno](https://deno.com/)

## Development

Run a local server serving files from the `./docs` folder by using this command in the terminal from the root of the project:

```
scripts/serve
```

Most of the files in the `./docs` folder should not be edited directly as they are built using the files in the `./templates` and `./posts` folder. To build run:

```
scripts/build
```

❗️ Remember this 👆 before pushing your changes otherwise it will not work...

## Testing

To run the tests use this command:

```
scripts/test
```

## Deployment
Commits to the `main` branch trigger a deployment to GitHub pages. The website can be viewed at https://pdp2.github.io/hi/. That's it at the moment 😎