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

  return (w) => {
    const t = t1.map((t1_val, idx) => (1 - w) * t1_val + w * t2[idx]);
    const A1 = P0.clone()
      .mulRowVector(frac(t1, t, t1, t0))
      .add(P1.clone().mulRowVector(frac(t, t0, t1, t0)));
    const A2 = P1.clone()
      .mulRowVector(frac(t2, t, t2, t1))
      .add(P2.clone().mulRowVector(frac(t, t1, t2, t1)));
    const A3 = P2.clone()
      .mulRowVector(frac(t3, t, t3, t2))
      .add(P3.clone().mulRowVector(frac(t, t2, t3, t2)));
    const B1 = A1.clone()
      .mulRowVector(frac(t2, t, t2, t0))
      .add(A2.clone().mulRowVector(frac(t, t0, t2, t0)));
    const B2 = A2.clone()
      .mulRowVector(frac(t3, t, t3, t1))
      .add(A3.clone().mulRowVector(frac(t, t1, t3, t1)));
    const C = B1.mulRowVector(frac(t2, t, t2, t1)).add(
      B2.mulRowVector(frac(t, t1, t2, t1))
    );

    return C;
  };
}
