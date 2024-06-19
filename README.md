# Musica

A local-first collaborative app for music creators

## First setup

We use `pnpm` as package manager.

If not already installed, to install `pnpm` run `corepack enable`

To install all the dependencies run `pnpm i`

## Useful commands

To run the project in dev mode run `pnpm run dev`

We use [shadcdn/ui](https://ui.shadcn.com/) for the UI components.

To add a new component run:
- From the workspace root `pnpm component-add [component]`
- From apps/client: `pnpx shadcn-ui@latest add [component]`

The outcome is the same, so use the one you prefer
