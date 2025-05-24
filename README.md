<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./app/public/images/logo/logo-w.svg">
  <img width="250px" alt="Zisk logo" src="./app/public/images/logo/logo-b.svg">
</picture>

The open-source, local-first personal finance app.

> [!IMPORTANT]
> Zisk is in a pre-alpha state, and only suitable for use by developers
>

This is the mono-repo source for services used to run Zisk.

## Services

### App
This is the frontend for Zisk. Core dependencies include:
 - PouchDB
 - React
 - Material-UI
 - Emotion
 - Tanstack Router
 - Tanstack Query
 - React-Hook-Form
 - Zod
 - Zustand

Please see `app/README.md` for more info.

### Server

Please see `server/README.md` for more info.
