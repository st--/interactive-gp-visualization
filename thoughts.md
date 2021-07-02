# Thoughts around building this visualization

## Linear algebra

[TensorFlow.js](https://www.tensorflow.org/js) was the obvious first thought, but unfortunately, this provides neither a matrix-solve nor a Cholesky operation, and hence is unusable for Gaussian processes. [Numeric.js](https://github.com/sloisel/numeric), used by several other GP visualisations I came across, looks like it is dead at this point, and I could not figure out how to get it to import within Svelte. Actively developed, [mathjs](https://mathjs.org/docs/datatypes/matrices.html) looked like a very promising option, but unfortunately I ran into the same [Svelte import issue](https://stackoverflow.com/questions/57824242/import-stdlib-js-in-svelte). In the end, I settled on [ml-matrix](https://github.com/mljs/matrix) which imported out of the box and provides Cholesky and all other relevant operations.

Other linear algebra libraries I haven't investigated further are [numbers.js](http://numbers.github.io/), [linear-algebra-js](https://rohan-sawhney.github.io/linear-algebra-js/) (looks interesting but a very small project, not actively maintained) and [LALOLib / ML.js](https://mlweb.loria.fr/lalolab/lalolib.html) which does not integrate with NPM and only provides the source as direct downloads (no Git). I might look into [vectorious](https://github.com/mateogianolio/vectorious) at a later date (it does not provide Cholesky though).

Gotchas with ml-matrix: e.g. add() is in-place and transpose() is just a view, so you may want to clone() a matrix before adding to it!

## Rendering LaTeX

MathJax vs Katex
