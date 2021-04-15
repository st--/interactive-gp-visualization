import { zip } from "d3-array";

export function pathGenerator(xScale, yScale, xOffset = 0, yOffset = 0) {
  return (xs, ys, reversed) => {
    const zipped = reversed ? zip(xs, ys).reverse() : zip(xs, ys);
    const points = zipped.map(
      (p) => `${xScale(p[0]) + xOffset},${yScale(p[1]) + yOffset}`
    );
    return `M${points.join("L")}`;
  };
}
