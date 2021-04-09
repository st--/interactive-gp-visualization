// Copyright (c) 2021 ST John

import * as m from "ml-matrix";

export function sqexp(variance = 1, lengthscale = 1) {
  const twosqlength = 2 * lengthscale * lengthscale;
  return (x1, x2) => {
    const sqdist = Math.pow(x1 - x2, 2);
    return variance * Math.exp(-sqdist / twosqlength);
  };
}

export function matern12(variance = 1, lengthscale = 1) {
  return (x1, x2) => {
    const dist = Math.abs(x1 - x2);
    return variance * Math.exp(-dist / lengthscale);
  };
}

export function white(variance) {
  return (x1, x2) => {
    return x1 == x2 ? variance : 0.0;
  };
}

export function periodic(variance = 1, lengthscale = 1.4, period = 2) {
  const sqlength = lengthscale * lengthscale;
  return (x1, x2) => {
    const dist = Math.abs(x1 - x2);
    const sin2 = Math.pow(Math.sin((Math.PI * dist) / period), 2);
    return variance * Math.exp(-(2 * sin2) / sqlength);
  };
}

export function linear(variance = 1, bias = 0, center = 0) {
  return (x1, x2) => {
    return bias + variance * (x1 - center) * (x2 - center);
  };
}

export function productKernel(kernels) {
  return (x1, x2) => {
    const results = kernels.map((k) => k.apply(null, [x1, x2]));
    return results.reduce((acc, x) => acc * x, 1);
  };
}

export function sumKernel(kernels) {
  return (x1, x2) => {
    const results = kernels.map((k) => k.apply(null, [x1, x2]));
    return results.reduce((acc, x) => acc + x, 0);
  };
}

export function covMatrix(kernel, xs) {
  const dim = xs.length;
  const kernelMatrix = new m.Matrix(dim, dim);
  for (let i = 0; i < dim; ++i) {
    for (let j = i; j < dim; ++j) {
      let k = kernel(xs[i], xs[j]);
      kernelMatrix.set(i, j, k);
      kernelMatrix.set(j, i, k);
    }
  }
  return kernelMatrix;
}
