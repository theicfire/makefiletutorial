var Metalsmith = require('metalsmith'),
  drafts = require('metalsmith-drafts'),
  layouts = require('metalsmith-layouts'),
  markdown = require('metalsmith-markdown'),
  assets = require('metalsmith-assets'),
  collections = require('metalsmith-collections'),
  autotoc = require('metalsmith-autotoc'),
  argv = require('minimist')(process.argv);
var serve = require('metalsmith-serve');
var watch = require('metalsmith-watch');
var sass = require('metalsmith-sass');
const hljs = require('highlight.js');
const marked = require('marked');

var renderer = new marked.Renderer();

renderer.code = function (code, infostring, escaped) {
  /**  Copied from the default implementation, with the following changes.
   * 1. Find a series of 4 spaces and convert it into tabs
   * 2. Add "hljs" to the code class. I don't get why, but metalsmith-metallic was doing this, so I copied the pattern.
   * 3. Remove this.options.langPrefix, because metalsmith-metallic didn't have this.
   */
  code = code.replace(/ {4}/g, '\t'); // Convert spaces back into tabs
  var lang = (infostring || '').match(/\S*/)[0];
  if (this.options.highlight) {
    var out = this.options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  if (!lang) {
    return '<pre><code>' + (escaped ? code : escape(code, true)) + '</code></pre>';
  }

  return (
    '<pre><code class="hljs ' +
    // this.options.langPrefix +
    escape(lang, true) +
    '">' +
    (escaped ? code : escape(code, true)) +
    '</code></pre>\n'
  );
};

build(function () {
  console.log('Done building.');
});

function build(callback) {
  const smith = Metalsmith(__dirname)
    // This is the source directory
    .source('./src')

    // This is where I want to build my files to
    .destination('./docs')

    // Clean the build directory before running any plugins
    .clean(true)

    // Use the drafts plugin
    .use(drafts())

    // Use Github Flavored Markdown for content
    .use(
      markdown({
        gfm: true,
        tables: true,
        highlight: function (code, lang) {
          // TODO what if there is no lang? highlightAuto..
          return hljs.highlight(lang, code).value;
        },
        renderer,
      }),
    )

    // Generate a table of contents JSON for every heading.
    .use(
      autotoc({
        selector: 'h1, h2, h3, h4, h5, h6',
        headerIdPrefix: 'subhead',
      }),
    )

    // Group my content into 4 distinct collections. These collection names
    // are defined as `collection: <name>` inside the markdown YAML.
    // .use(
    //   collections({
    //     "Get Started": { sortBy: "date" },
    //     Tutorials: { sortBy: "date" },
    //     "User Authentication": { sortBy: "date" },
    //     "Building with React & Flux": { sortBy: "date" },
    //   })
    // )

    // Use handlebars as layout engine.
    //.use(layouts('handlebars'))
    .use(layouts({ engine: 'ejs' }))

    .use(
      sass({
        outputStyle: 'expanded',
      }),
    )

    // Use the assets plugin to specify where assets are stored
    .use(
      assets({
        source: './assets',
        destination: './assets',
      }),
    );

  if (argv.dev) {
    smith
      .use(
        serve({
          port: 8001,
          verbose: true,
        }),
      )
      .use(
        watch({
          paths: {
            'src/*.md': true,
            'src/*': '**/**',
            'layouts/*': '**/*',
            'assets/*.css': '**/*',
          },
        }),
      );
  }

  smith.build(function (err) {
    var message = err ? err : 'Build complete';
    console.log(message);
    callback();
  });
}
