export function getSVGpoint(svg, e) {
  const pt = svg.createSVGPoint();
  // pass event coordinates
  pt.x = e.clientX;
  pt.y = e.clientY;
  // transform to SVG coordinates
  const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
  return svgP;
}
