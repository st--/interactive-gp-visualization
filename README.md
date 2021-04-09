# Interactive Visualisation of Gaussian processes

## Other visualisations

There are plenty of other Gaussian process visualisations out there; here are some I came across so far (if you know of others you like, please let me know!):

* [A Visual Exploration of Gaussian Processes (distill.pub)](https://distill.pub/2019/visual-exploration-gaussian-processes/) ([source](https://github.com/distillpub/post%2d-visual-exploration-gaussian-processes), using D3.js, ml-matrix)
* [Demo by Nicolas Durrande](https://durrande.shinyapps.io/gp_playground/) ([source](https://github.com/NicolasDurrande/shinyApps/tree/master/GP_playground), using R and Shiny)
* [Demo by Johan W&aring;gberg](http://smlbook.org/GP/) ([source](https://github.com/uu-sml/sml-book-page/tree/master/GP), using D3.js, Numeric.js, katex)
* [Demo by Tomi Peltola](http://www.tmpl.fi/gp/) ([source](https://github.com/to-mi/gp-demo-js), using React, D3.js, Numeric.js)
* [Demo by Chi Feng](https://chi-feng.github.io/gp-demo/) ([source](https://github.com/chi-feng/gp-demo), using dat.gui, jQuery)
* [Demo by Alex Y. Chan](https://gaussianprocess.herokuapp.com/) ([source](https://github.com/aybchan/gaussianprocess), using D3.js, math.js)
* Demo by Artem Artemev, run locally ([source](https://github.com/awav/interactive-gp), using Python, GPflow, holoviews/bokeh)

---

# Svelte development

## Get started

Install the dependencies...

```bash
cd svelte-app
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

### Using Prettier

This repository is set up to use Prettier.
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
