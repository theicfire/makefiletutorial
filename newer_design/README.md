# Bedrock Documentation Site
These are the source files for [Bedrock's documentation site](https://tilomitra.github.io/bedrock). It is a static website built using [Metalsmith](http://metalsmith.io), so I put it up here as an example of a static site that can be built using it.

Here's a screenshot of what the static site looks like:

![](https://d17oy1vhnax1f7.cloudfront.net/items/0u0N220l1N2C2J3J2Q3B/Screen%20Shot%202017-01-14%20at%209.39.02%20PM.png)

[Check out this blog post](http://nodewebapps.com/2017/01/15/how-to-build-and-deploy-static-websites-using-metalsmith/) for more information on how to build static websites using NodeJS and Metalsmith.

## Features
- Writing using Github Flavored Markdown
- Using Handlebars layout
- Automatic table-of-contents and navigation based on headings
- Syntax Highlighting 
- One-line deploy to Github Pages

## Installation and Building

```
git clone git@github.com:tilomitra/bedrock-docs.git
npm install
node build.js
```

This will set up a browser-sync environment, where all your changes will automatically reload and rebuild the static site.

## To deploy to Github Pages:
```
npm run deploy --prod
```

This will push everything in the `build/` directory to the `gh-pages` branch of whatever your `origin` remote is. 
