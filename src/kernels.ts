// Copyright (c) 2021 ST John

import * as m from "ml-matrix";

export type KernelFunction = (x1: number, x2: number) => number;
export type KernelConstructor = (...args: number[]) => KernelFunction;
export type Parameter = {
  name: string;
  formula: string;
  value: number;
  min: number;
  max: number;
  step: number;
  lowerBound?: number;
};
export type KernelSelection = {
  description: string;
  formula: string;
  parameters: Parameter[];
  constructor: KernelConstructor;
};

const paramVariance = {
  name: "variance",
  formula: "\\sigma^2",
  value: 1.0,
  min: 0.0,
  max: 4.0,
  step: 0.01,
  lowerBound: 0.0,
};
const paramLengthscale = {
  name: "lengthscale",
  formula: "\\ell",
  value: 1.0,
  min: 0.05,
  max: 10.0,
  step: 0.01,
  lowerBound: 1e-3,
};

export function sqexp(variance = 1, lengthscale = 1): KernelFunction {
  const twosqlength = 2 * lengthscale * lengthscale;
  return (x1, x2) => {
    const sqdist = Math.pow(x1 - x2, 2);
    return variance * Math.exp(-sqdist / twosqlength);
  };
}

export function makeSqexp(): KernelSelection {
  return {
    description: "squared-exponential",
    formula: "\\sigma^2 \\exp\\Big(-\\frac{(x-x')^2}{2\\ell^2}\\Big)",
    parameters: [paramVariance, paramLengthscale],
    constructor: sqexp,
  };
}

export function matern12(variance = 1, lengthscale = 1): KernelFunction {
  return (x1, x2) => {
    const dist = Math.abs(x1 - x2);
    return variance * Math.exp(-dist / lengthscale);
  };
}

export function makeMatern12(): KernelSelection {
  return {
    description: "exponential (Matérn 1/2)",
    formula: "\\sigma^2 \\exp\\Big(-\\frac{|x-x'|}{\\ell}\\Big)",
    parameters: [paramVariance, paramLengthscale],
    constructor: matern12,
  };
}

export function matern32(variance = 1, lengthscale = 1): KernelFunction {
  return (x1, x2) => {
    const scaledDist = (Math.sqrt(3) * Math.abs(x1 - x2)) / lengthscale;
    return variance * (1 + scaledDist) * Math.exp(-scaledDist);
  };
}

export function makeMatern32(): KernelSelection {
  return {
    description: "Matérn 3/2",
    formula:
      "\\sigma^2 \\big( 1 + \\frac{\\sqrt{3} |x-x'|}{\\ell} \\big) \\exp\\Big(-\\frac{\\sqrt{3} |x-x'|}{\\ell}\\Big)",
    parameters: [paramVariance, paramLengthscale],
    constructor: matern32,
  };
}

export function matern52(variance = 1, lengthscale = 1): KernelFunction {
  return (x1, x2) => {
    const scaledDist = (Math.sqrt(5) * Math.abs(x1 - x2)) / lengthscale;
    return (
      variance *
      (1 + scaledDist + (scaledDist * scaledDist) / 3) *
      Math.exp(-scaledDist)
    );
  };
}

export function makeMatern52(): KernelSelection {
  return {
    description: "Matérn 5/2",
    formula:
      "\\sigma^2 \\big( 1 + \\frac{\\sqrt{5} |x-x'|}{\\ell} + \\frac{5 (x-x')^2}{3 \\ell^2} \\big) \\exp\\Big(-\\frac{\\sqrt{5} |x-x'|}{\\ell}\\Big)",
    parameters: [paramVariance, paramLengthscale],
    constructor: matern52,
  };
}

export function white(variance: number): KernelFunction {
  return (x1, x2) => {
    return x1 == x2 ? variance : 0.0;
  };
}

export function periodic(
  variance = 1,
  lengthscale = 1.4,
  period = 2
): KernelFunction {
  const sqlength = lengthscale * lengthscale;
  return (x1, x2) => {
    const dist = Math.abs(x1 - x2);
    const sin2 = Math.pow(Math.sin((Math.PI * dist) / period), 2);
    return variance * Math.exp(-(2 * sin2) / sqlength);
  };
}

const paramPeriod = {
  name: "period",
  formula: "p",
  value: 2.0,
  min: 0.1,
  max: 10.0,
  step: 0.01,
  lowerBound: 1e-3,
};

export function makePeriodic(): KernelSelection {
  return {
    description: "periodic",
    formula:
      "\\sigma^2 \\exp\\Big(- 2 \\frac{\\sin^2(\\pi |x-x'|/p)}{\\ell^2}\\Big)",
    parameters: [paramVariance, paramLengthscale, paramPeriod],
    constructor: periodic,
  };
}

const paramBias = {
  name: "bias",
  formula: "\\sigma^2_b",
  value: 0.0,
  min: 0.0,
  max: 4.0,
  step: 0.01,
  lowerBound: 0.0,
};
const paramCenter = {
  name: "center",
  formula: "x_c",
  value: 2.0,
  min: -2.0,
  max: 8.0,
  step: 0.1,
};

export function linear(variance = 1, bias = 0, center = 0): KernelFunction {
  return (x1, x2) => {
    return bias + variance * (x1 - center) * (x2 - center);
  };
}

export function makeLinear(): KernelSelection {
  return {
    description: "linear",
    formula: "\\sigma^2 (x - x_c)(x' - x_c) + \\sigma^2_b",
    parameters: [paramVariance, paramBias, paramCenter],
    constructor: linear,
  };
}

export function createKernelChoices() {
  const choices: KernelSelection[] = [
    makeMatern12(), // 0
    makeMatern32(), // 1
    makeMatern52(), // 2
    makeSqexp(), // 3
    makePeriodic(), // 4
    makeLinear(), // 5
  ];
  const selected = choices[3]; // = Sqexp
  return { choices, selected };
}

export function instantiateKernel(selected: KernelSelection): KernelFunction {
  if (!selected) return sqexp();
  return selected.constructor(...selected.parameters.map((p) => p.value));
}

export function productKernel(kernels: KernelFunction[]): KernelFunction {
  return (x1, x2) => {
    const results = kernels.map((k) => k.apply(null, [x1, x2]));
    return results.reduce((acc, x) => acc * x, 1);
  };
}

export function sumKernel(kernels: KernelFunction[]): KernelFunction {
  return (x1, x2) => {
    const results = kernels.map((k) => k.apply(null, [x1, x2]));
    return results.reduce((acc, x) => acc + x, 0);
  };
}

export function covMatrix(kernel: KernelFunction, xs: number[]) {
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
