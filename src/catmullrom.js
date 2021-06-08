// Copyright (c) 2021 ST John

import * as m from "ml-matrix";

function normpow(v1, v2, alpha) {
  return m.Matrix.subtract(v1, v2)
    .pow(2)
    .sum("column")
    .map((c) => Math.pow(c, alpha / 2));
}

export function interpolateCatmullRom(P0, P1, P2, P3) {
  // https://en.wikipedia.org/wiki/Centripetal_Catmull%E2%80%93Rom_spline
  const alpha = 0.5; // 0.5: centripetal; 0: uniform; 1: chordal

  const t0 = new Array(P0.columns).fill(0);
  const t1 = normpow(P0, P1, alpha).map((c, idx) => c + t0[idx]);
  const t2 = normpow(P1, P2, alpha).map((c, idx) => c + t1[idx]);
  const t3 = normpow(P2, P3, alpha).map((c, idx) => c + t2[idx]);

  function frac(ta, tb, tc, td) {
    // (ta-tb)/(tc-td)
    return ta.map((ta_val, idx) => (ta_val - tb[idx]) / (tc[idx] - td[idx]));
  }

  function linearInt(Pa, Pb, ta, tb, t) {
    // TODO: column-wise, where ta==tb, return Pa==Pb directly
    return Pa.clone()
      .mulRowVector(frac(tb, t, tb, ta))
      .add(Pb.clone().mulRowVector(frac(t, ta, tb, ta)));
  }

  return (w) => {
    const t = t1.map((t1_val, idx) => (1 - w) * t1_val + w * t2[idx]);
    const A1 = linearInt(P0, P1, t0, t1, t);
    const A2 = linearInt(P1, P2, t1, t2, t);
    const A3 = linearInt(P2, P3, t2, t3, t);
    const B1 = linearInt(A1, A2, t0, t2, t);
    const B2 = linearInt(A2, A3, t1, t3, t);
    const C = linearInt(B1, B2, t1, t2, t);
    return C;
  };
}
