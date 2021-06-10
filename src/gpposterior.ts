// Copyright (c) 2021 ST John

import * as m from "ml-matrix";
import { covMatrix } from "./kernels";
import { cholesky, symmetrise } from "./mymath";

export function prior(kernel) {
  function mean(xs) {
    return xs.map((_) => 0.0);
  }
  function cov(xs) {
    return covMatrix(kernel, xs);
  }
  return { mean, cov, kernel };
}

export function posterior(kernel, X, Y, noiseVariance = 0.0) {
  // mean(*) = K*x (Kxx⁻¹ Y)
  // cov(*, *') = K**' - K*x Kxx⁻¹ Kx*'
  function covYf(xs) {
    const kyf = m.Matrix.zeros(X.length, xs.length);
    for (let i = 0; i < X.length; ++i) {
      for (let j = 0; j < xs.length; ++j) {
        kyf.set(i, j, kernel(X[i], xs[j]));
      }
    }
    return kyf;
  }

  const noiseVarianceMatrix = m.Matrix.eye(X.length, X.length, noiseVariance);
  const kyy = covMatrix(kernel, X).add(noiseVarianceMatrix);
  //const L = cholesky(symmetrise(kyy));
  const kyyinv_Y = m.solve(kyy, m.Matrix.columnVector(Y));
  //const kyyinv_Y = m.solve(L.transpose(), m.solve(L, m.Matrix.columnVector(Y)));

  function mean(xs) {
    const kyf = covYf(xs);
    return kyf.transpose().mmul(kyyinv_Y).to1DArray();
  }

  function cov(xs) {
    const kff = covMatrix(kernel, xs);
    const kyf = covYf(xs);
    // TODO: replace with symmetric Cholesky solve
    const kyyinv_kyf = m.solve(kyy, kyf);
    //const Linv_kyf = m.solve(L.transpose(), m.solve(L, kyf));
    const kfy_kyyinv_kyf = kyf.transpose().mmul(kyyinv_kyf);
    //const kfy_kyyinv_kyf = Linv_kyf.transpose().mmul(Linv_kyf);
    return kff.subtract(kfy_kyyinv_kyf);
  }

  return { mean, cov, kernel: (x1, x2) => cov([x1, x2]).get(1, 0) };
}
