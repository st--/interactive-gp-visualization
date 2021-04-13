// Copyright (c) 2021 ST John

import * as m from "ml-matrix";

const paramVariance = {
  name: "variance",
  value: 1.0,
  min: 0.1,
  max: 10.0,
  step: 0.1,
};
const paramLengthscale = {
  name: "lengthscale",
  value: 1.0,
  min: 0.1,
  max: 10.0,
  step: 0.1,
};

export function sqexp(variance = 1, lengthscale = 1) {
  const twosqlength = 2 * lengthscale * lengthscale;
  return (x1, x2) => {
    const sqdist = Math.pow(x1 - x2, 2);
    return variance * Math.exp(-sqdist / twosqlength);
  };
}

export function makeSqexp() {
  return {
    description: "squared exponential (exponentiated quadratic)",
    parameters: [paramVariance, paramLengthscale],
    kernel: sqexp,
  };
}

export function matern12(variance = 1, lengthscale = 1) {
  return (x1, x2) => {
    const dist = Math.abs(x1 - x2);
    return variance * Math.exp(-dist / lengthscale);
  };
}

export function makeMatern12() {
  return {
    description: "exponential (Matérn 1/2)",
    parameters: [paramVariance, paramLengthscale],
    kernel: matern12,
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

const paramPeriod = {
  name: "period",
  value: 2.0,
  min: 1.0,
  max: 5.0,
  step: 0.1,
};

export function makePeriodic() {
  return {
    description: "periodic",
    parameters: [paramVariance, paramLengthscale, paramPeriod],
    kernel: periodic,
  };
}

const paramBias = { name: "bias", value: 0.0, min: 0.0, max: 5.0, step: 0.1 };
const paramCenter = {
  name: "center",
  value: 2.0,
  min: -2.0,
  max: 8.0,
  step: 0.1,
};

export function linear(variance = 1, bias = 0, center = 0) {
  return (x1, x2) => {
    return bias + variance * (x1 - center) * (x2 - center);
  };
}

export function makeLinear() {
  return {
    description: "linear",
    parameters: [paramVariance, paramBias, paramCenter],
    kernel: linear,
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
