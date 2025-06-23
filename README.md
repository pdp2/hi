# hi
Repo for my personal website.

## Development

I use [Deno](https://deno.com/) to run a local file server from the docs folder with the following command:

```
deno run --allow-net --allow-read --allow-sys https://deno.land/std/http/file_server.ts docs/
```

## Testing

To run the tests, install [Deno](https://deno.com/) and then run this command from the root of the project:

```
deno test
```

## Deployment
Commits to the `main` branch trigger a deployment to GitHub pages. The website can be viewed at https://pdp2.github.io/hi/. That's it at the moment 😎