// Copyright (c) 2021 ST John

import * as m from "ml-matrix";
import { randomNormal, randomLcg } from "d3-random";

export function linspace(start, stop, num, endpoint = true) {
  const div = endpoint ? num - 1 : num;
  const step = (stop - start) / div;
  return Array.from({ length: num }, (_, i) => start + step * i);
}

export function gaussian(mean, variance) {
  return (y) =>
    Math.exp(-Math.pow(y - mean, 2) / (2 * variance)) /
    Math.sqrt(2 * Math.PI * variance);
}

export function covEllipse(covMat) {
  // https://www.visiondummy.com/2014/04/draw-error-ellipse-representing-covariance-matrix/
  // http://cs229.stanford.edu/section/gaussians.pdf
  const e = new m.EigenvalueDecomposition(covMat);
  const eigvals = e.realEigenvalues;
  const largestEigvec = e.eigenvectorMatrix.getColumn(0);
  const alpha = Math.atan2(largestEigvec[1], -largestEigvec[0]);
  return {
    width: Math.sqrt(eigvals[0]),
    length: Math.sqrt(eigvals[1]),
    angle: (alpha * 180) / Math.PI,
  };
}

export function cholesky(A) {
  const chol = new m.CholeskyDecomposition(A);
  return chol.lowerTriangularMatrix; // L such that LL^T = A
}

export function svdSqrt(A) {
  const e = new m.EigenvalueDecomposition(A);
  const r = e.eigenvectorMatrix;
  const d = m.Matrix.zeros(r.rows, r.columns);
  for (let i = 0; i < d.rows; ++i) {
    d.set(i, i, Math.sqrt(e.realEigenvalues[i]));
  }
  return r.mmul(d);
}

export function symmetrise(A) {
  const At = A.transpose();
  const symA = m.Matrix.add(A, At).div(2);
  return symA;
}

export function matrixSqrt(A) {
  return cholesky(symmetrise(A));
}

export function randn(rows, cols, seed) {
  const randn1 = randomNormal.source(randomLcg(seed))();
  const v = m.Matrix.zeros(rows, cols);
  for (let j = 0; j < cols; ++j) {
    for (let i = 0; i < rows; ++i) {
      v.set(i, j, randn1());
    }
  }
  return v;
}

export function sampleMvn(meanVec, covSqrt, v) {
  // returns samples from a multivariate normal distribution N(meanVec, covSqrt covSqrtᵀ)
  // v is a Matrix in which each column vector is ~ N(0, I)

  if (!v || covSqrt.columns != v.rows) {
    return m.Matrix.zeros(meanVec.length, 1);
  }
  const Lv = covSqrt.mmul(v);
  return Lv.addColumnVector(meanVec);
}

export function sampleMvnTrajectory(meanVec, covSqrt, v, numFrames) {
  // returns array of smoothly animated samples from a multivariate normal distribution
  // see https://math.stackexchange.com/a/1930880/901583 or the detailed explanation:
  // http://mlss.tuebingen.mpg.de/2013/Hennig_2013_Animating_Samples_from_Gaussian_Distributions.pdf

  if (!v || covSqrt.columns != v.rows) {
    return Array.from({ length: numFrames }, (_, i) =>
      m.Matrix.zeros(meanVec.length, 1)
    );
  }

  const vNorm = m.Matrix.pow(v, 2)
    .sum("column")
    .map((c) => Math.sqrt(c)); // ‖v‖
  const vNormed = v.clone().divRowVector(vNorm); // v/‖v‖

  const u = randn(v.rows, v.columns, Math.random()); // u ~ Normal(0, 1)
  const uDotVnormed = m.Matrix.mul(u, vNormed).sum("column"); // uᵀv/‖v‖

  const t = m.Matrix.sub(u, vNormed.clone().mulRowVector(uDotVnormed)); // u - uᵀv/‖v‖
  // now t ⟂ v

  const tNorm = m.Matrix.pow(t, 2)
    .sum("column")
    .map((c) => Math.sqrt(c)); // ‖t‖
  const tNormed = t.clone().divRowVector(tNorm); // t/‖t‖

  const thetas = linspace(0, 2 * Math.PI, numFrames, false); // skip endpoint
  const frameVs = thetas.map((theta) => {
    return m.Matrix.mul(vNormed, Math.cos(theta))
      .add(m.Matrix.mul(tNormed, Math.sin(theta)))
      .mulRowVector(vNorm); // cos(θ)v + sin(θ)t/‖t‖ * ‖v‖
  });
  return frameVs.map((v) => sampleMvn(meanVec, covSqrt, v));
}
