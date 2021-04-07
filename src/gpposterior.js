import * as m from "ml-matrix";
import { covMatrix } from "./kernels.js";

export function posterior(kernel, X, Y) {
  // mean(*) = K*x (Kxx⁻¹ Y)
  // cov(*, *') = K**' - K*x Kxx⁻¹ Kx*'
  function covYf(x) {
    const kvec = m.Matrix.zeros(X.length, 1);
    for (let i = 0; i < X.length; ++i) {
      kvec.set(i, 0, kernel(X[i], x));
    }
    return kvec;
  }
  const kyy = covMatrix(kernel, X);
  const kyyinv_Y = m.solve(kyy, m.ColumnVector(Y));
  function mean(xnew) {
    return covYf(xnew).transpose().mmul(kyyinv_Y).to1DArray();
  }
  function cov(x1, x2) {
    const kf1f2 = covMatrix(kernel, [x1, x2]);
    const kf1y = covYf(x1).transpose();
    const kyf2 = covYf(x2);
    // TODO: replace with symmetric Cholesky solve
    const kyyinv_kyf2 = m.solve(kyy, kyf2);
    const kf1y_kyyinv_kyf2 = kf1y.mmul(kyyinv_kyf2);
    return kf1f2.subtract(kf1y_kyyinv_kyf2);
  }
  return { mean, cov };
}
