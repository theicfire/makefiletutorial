Makefile Tutorial by Example
========

This is a single page website. It's built by [metalsmith](https://metalsmith.io/), and the generated files are in `docs` (picked because Github Pages only supports `/` and `/docs` as directories to serve from).

To run this locally:
- `yarn install` (If this fails to build node-sass, I've had luck with node v12.10.0)
- `yarn dev`

To deploy:
- Make changes
- `yarn build` (or `yarn dev`)
- Commit changes
- git push
