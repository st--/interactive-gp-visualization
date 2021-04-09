import { zip } from "d3-array";

export function pathGenerator(xScale, yScale) {
  return (xs, ys, reversed) => {
    const zipped = reversed ? zip(xs, ys).reverse() : zip(xs, ys);
    const points = zipped.map((p) => `${xScale(p[0])},${yScale(p[1])}`);
    return `M${points.join("L")}`;
  };
}

export function offset(delta, func) {
  return (y) => delta + func(y);
}
