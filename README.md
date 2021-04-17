# UnIT ABRA

This repository contains source code of a web parking reservation system.
It was created as part of [UnIT hackathon 2021](https://unit.bestprague.cz/), specifically for [ABRA](https://www.abra.eu/) challenge.

## Development

To start developing, install [Node.js](https://nodejs.org/en/download/releases/) (version `12.x`) and run the following commands.

```bash
npm install
npm run dev
```

Recommended IDE is [Visual Studio Code](https://code.visualstudio.com/) with extension [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode).

The application is developed in [Svelte](https://svelte.dev/) (similar to [React](https://reactjs.org/) but faster) using [SvelteKit](https://kit.svelte.dev/) (similar to [Next.js](https://nextjs.org/) for React).
Modern JavaScript is used for both server-side and client-side code and [Sass](https://sass-lang.com/) is used for styling.

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md).

## Deployment

The application can be deployed to Heroku out of the box.
Just beware that the ABRA FLEXI API which is used on the backend does not allow us to set dates with timezones, hence timezone must be in sync.
This can be done easily by [setting environment variable `TZ`](https://stackoverflow.com/a/9849524) on Heroku.

```bash
TZ=Europe/Prague
```

## Authors

- [Jan Joneš](https://github.com/jjonescz)
- [Jana Řežábková](https://github.com/janarez)
- [Martin Vejbora](https://github.com/vejbomar)
