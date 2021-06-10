// Copyright (c) 2021 ST John

import * as m from "ml-matrix";
import { randn } from "./mymath";

function kineticEnergy(ps) {
  return m.Matrix.pow(ps, 2).div(2).sum("column");
}

function U(qs) {
  return m.Matrix.pow(qs, 2).div(2).sum("column");
}

function grad_U(qs) {
  return qs.clone();
}

export function HMC(current_qs, epsilon = 0.1, L = 2) {
  if (!current_qs) {
    return current_qs;
  } // if undefined at start of App

  // based on Radford Neal's "MCMC using Hamiltonian dynamics", https://arxiv.org/abs/1206.1901

  // copy state ("position")
  let qs = current_qs.clone();
  // sample momentum
  let ps = randn(qs.rows, qs.columns, Math.random()); // independent standard normal variates

  // Evaluate potential and kinetic energies at start of trajectory
  const current_Us = U(qs);
  const current_Ks = kineticEnergy(ps);

  ///// Leapfrog integration
  // Make a half step for momentum at the beginning
  ps.subtract(grad_U(qs).mul(epsilon / 2));
  // Alternate full steps for position and momentum
  for (let step = 0; step < L; ++step) {
    // Make a full step for the position
    qs.add(m.Matrix.mul(ps, epsilon));
    // Make a full step for the momentum, except at end of trajectory
    if (step != L - 1) {
      ps.subtract(grad_U(qs).mul(epsilon));
    }
  }
  // Make a half step for momentum at the end.
  ps.subtract(grad_U(qs).mul(epsilon / 2));

  // Negate momentum at end of trajectory to make the proposal symmetric
  // p = -p  // kinetic energy is symmetric

  // Evaluate potential and kinetic energies at end of trajectory
  const proposed_Us = U(qs);
  const proposed_Ks = kineticEnergy(ps);

  // Accept or reject the state at end of trajectory, returning either
  // the position at the end of the trajectory or the initial position
  let rejectedCount = 0;
  for (let i = 0; i < qs.columns; ++i) {
    if (
      Math.random() <
      Math.exp(current_Us[i] - proposed_Us[i] + current_Ks[i] - proposed_Ks[i])
    ) {
      current_qs.setColumn(i, qs.getColumn(i)); // accept proposed state
    } else {
      // reject proposal; normally we would keep original position
      rejectedCount++;
      // Here, we sample a completely fresh state from our known N(0, I) distribution
      // so we do not run into numeric issues with the interpolation
      // (easier than fixing the interpolation code!)
      current_qs.setColumn(i, randn(qs.rows, 1, Math.random()));
    }
  }
  // console.log(rejectedCount / qs.columns);
  return current_qs;
}
