var Metalsmith = require("metalsmith"),
  metallic = require("metalsmith-metallic"),
  drafts = require("metalsmith-drafts"),
  layouts = require("metalsmith-layouts"),
  markdown = require("metalsmith-markdown"),
  assets = require("metalsmith-assets"),
  collections = require("metalsmith-collections"),
  autotoc = require("metalsmith-autotoc"),
  browserSync = require("browser-sync"),
  argv = require("minimist")(process.argv);
var serve = require("metalsmith-serve");
var watch = require("metalsmith-watch");
var stylus = require("metalsmith-stylus");

build(function () {
  console.log("Done building.");
});

function build(callback) {
  Metalsmith(__dirname)
    // This is the source directory
    .source("./src")

    // This is where I want to build my files to
    .destination("./build")

    // Clean the build directory before running any plugins
    .clean(true)

    // Use the drafts plugin
    .use(drafts())

    // Use metallic plugin to add syntax highlighting
    .use(metallic())

    // Use Github Flavored Markdown for content
    .use(
      markdown({
        smartypants: true,
        gfm: true,
        tables: true,
      })
    )

    // Generate a table of contents JSON for every heading.
    .use(
      autotoc({
        selector: "h1, h2, h3, h4, h5, h6",
        headerIdPrefix: "subhead",
      })
    )

    // Group my content into 4 distinct collections. These collection names
    // are defined as `collection: <name>` inside the markdown YAML.
    .use(
      collections({
        "Get Started": { sortBy: "date" },
        Tutorials: { sortBy: "date" },
        "User Authentication": { sortBy: "date" },
        "Building with React & Flux": { sortBy: "date" },
      })
    )

    // Use handlebars as layout engine.
    //.use(layouts('handlebars'))
    .use(layouts({ engine: "ejs" }))

    // Use the assets plugin to specify where assets are stored
    .use(
      assets({
        source: "./assets",
        destination: "./assets",
      })
    )

    .use(
      serve({
        port: 8000,
        verbose: true,
      })
    )
    .use(
      watch({
        paths: {
          "src/*.md": true,
          "layouts/*": "**/*",
          "assets/*.css": "**/*",
        },
      })
    )

    // Build everything!
    .build(function (err) {
      var message = err ? err : "Build complete";
      console.log(message);
      callback();
    });
}
