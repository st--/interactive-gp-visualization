// Copyright (c) 2021 ST John

export type IndicesAndFrac = {
  idx1: number;
  idx2: number;
  w1: number;
  w2: number;
};

export function getIndexInSorted(array, target) {
  let low = 0;
  let high = array.length;
  while (low < high) {
    let mid = (low + high) >>> 1;
    if (target > array[mid]) low = mid + 1;
    else high = mid;
  }
  return low;
}

export function getIndicesAndFrac(xs, xnew): IndicesAndFrac {
  const idx = getIndexInSorted(xs, xnew);
  const idx1 = idx > 0 ? idx - 1 : idx;
  const idx2 = idx > 0 ? idx : idx + 1;
  const x1 = xs[idx1];
  const x2 = xs[idx2];
  const w1 = (x2 - xnew) / (x2 - x1);
  const w2 = (xnew - x1) / (x2 - x1);
  return { idx1, idx2, w1, w2 };
}
