# Interactive Visualisation of Gaussian processes

This is an interactive extension of a visualisation I developed for an invited talk at the FAI seminar series at University College London.

## Other visualisations

There are plenty of other Gaussian process visualisations out there; here are some I came across so far that inspired me (if you know of others you like, please let me know!):

* Interactive tutorial: [A Visual Exploration of Gaussian Processes (distill.pub)](https://distill.pub/2019/visual-exploration-gaussian-processes/) by Jochen G&ouml;rtler, Rebecca Kehlbeck, Oliver Deussen ([source](https://github.com/distillpub/post%2d-visual-exploration-gaussian-processes), using D3.js, ml-matrix)
* Interactive tutorial: [A Practical Guide to Gaussian Processes](http://tinyurl.com/guide2gp) by Marc Peter Deisenroth, Yicheng Luo, Mark van der Wilk
* [Demo by Nicolas Durrande](https://durrande.shinyapps.io/gp_playground/) ([source](https://github.com/NicolasDurrande/shinyApps/tree/master/GP_playground), using R and Shiny)
* [Demo by Johan W&aring;gberg](http://smlbook.org/GP/) ([source](https://github.com/uu-sml/sml-book-page/tree/master/GP), using D3.js, Numeric.js)
* [Demo by Tomi Peltola](http://www.tmpl.fi/gp/) ([source](https://github.com/to-mi/gp-demo-js), using React, D3.js, Numeric.js)
* [Demo by Chi Feng](https://chi-feng.github.io/gp-demo/) ([source](https://github.com/chi-feng/gp-demo), using dat.gui, jQuery)
* [Demo by Alex Y. Chan](https://gaussianprocess.herokuapp.com/) ([source](https://github.com/aybchan/gaussianprocess), using D3.js, math.js)
* Demo by Artem Artemev, run locally ([source](https://github.com/awav/interactive-gp), using Python, GPflow, holoviews/bokeh)

## Standing on the shoulders of...

This webapp is built using [Svelte](https://svelte.dev/), [D3.js](https://d3js.org/), and [ml-matrix](https://github.com/mljs/matrix). Equations are rendered by [KaTeX](https://katex.org/). Thanks to [Ryan Davis](https://rdavis.io/articles/svelte_collapsible_card_component/) for the [CollapsibleCard](https://github.com/rsdavis/svelte-collapsible-card).

The smooth animation of different samples goes back to Philipp Hennig's technical note [Animating samples from Gaussian distributions](http://mlss.tuebingen.mpg.de/2013/Hennig_2013_Animating_Samples_from_Gaussian_Distributions.pdf). How to compute the isocontour ellipses of a bivariate Gaussian distribution is explained by Chuong B. Do in [this note](http://cs229.stanford.edu/section/gaussians.pdf).

---

# Svelte development

## Get started

Install the dependencies...

```bash
# cd into this directory
npm install
```

...then start [Rollup](https://rollupjs.org):

```bash
npm run dev
```

Navigate to [localhost:5000](http://localhost:5000). You should see your app running. Edit a component file in `src`, save it, and reload the page to see your changes.

By default, the server will only respond to requests from localhost. To allow connections from other computers, edit the `sirv` commands in package.json to include the option `--host 0.0.0.0`.

If you're using [Visual Studio Code](https://code.visualstudio.com/) we recommend installing the official extension [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode). If you are using other editors you may need to install a plugin in order to get syntax highlighting and intellisense.

## Contributing

### Using TypeScript

This repository is set up to use TypeScript.
Run the checks with
```bash
npx svelte-check
```

### Using Prettier

This repository is set up to use Prettier.
Before committing code, run
```bash
npx prettier -w src
```

## Building and running in production mode

To create an optimised version of the app:

```bash
npm run build
```

You can run the newly built app with `npm run start`. This uses [sirv](https://github.com/lukeed/sirv), which is included in your package.json's `dependencies` so that the app will work when you deploy to platforms like [Heroku](https://heroku.com).


## Single-page app mode

By default, sirv will only respond to requests that match files in `public`. This is to maximise compatibility with static fileservers, allowing you to deploy your app anywhere.

If you're building a single-page app (SPA) with multiple routes, sirv needs to be able to respond to requests for *any* path. You can make it so by editing the `"start"` command in package.json:

```js
"start": "sirv public --single"
```

## Deploying to the web

### With [Vercel](https://vercel.com)

Install `vercel` if you haven't already:

```bash
npm install -g vercel
```

Then, from within your project folder:

```bash
cd public
vercel deploy --name my-project
```

### With [surge](https://surge.sh/)

Install `surge` if you haven't already:

```bash
npm install -g surge
```

Then, from within your project folder:

```bash
npm run build
surge public my-project.surge.sh
```
