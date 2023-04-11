// Copyright (c) 2021 ST John

export type Point = {
  x: number;
  y: number;
};

export type DataAtX = {
  ys: number[];
  mean: number;
  variance: number;
  k1: number;
  k2: number;
};

export type CovProps = { width: number; length: number; angle: number };

export type PlotProps = {
  mean: boolean;
  confidence: boolean;
  samples: boolean;
  marginals: boolean;
  withNoise: boolean;
};
