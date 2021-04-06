import * as m from 'ml-matrix';

export function linspace(start, stop, num) {
	// endpoint=True behaviour from np.linspace
	const step = (stop - start) / (num - 1);
  return Array.from({length: num}, (_, i) => start + step * i);
}

export function cholesky(A) {
	const chol = new m.CholeskyDecomposition(A);
  return chol.lowerTriangularMatrix;  // L such that LL^T = A
}

export function svdSqrt(A) {
	const e = new m.EigenvalueDecomposition(A);
	const r = e.eigenvectorMatrix;
	const d = m.Matrix.zeros(r.rows, r.columns);
	for(let i = 0; i < d.rows; ++i) {
		d.set(i,i, Math.sqrt(e.realEigenvalues[i]));
	}
	return r.mmul(d);
}

export function matrixSqrt(A) {
	return svdSqrt(A);
}

function randn1() {
	return Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random())
}

export function randn(rows, cols) {
  const v = m.Matrix.zeros(rows, cols);
	for (let i = 0; i < rows; ++i) {
		for (let j = 0; j < cols; ++j) {
			v.set(i, j, randn1());
		}
	}
	return v;
}

// export function sampleMvn(meanVec, covChol, numSamples=1) {
// 	const v = randn(meanVec.length, numSamples)
// 	const meanMat = m.ColumnVector(meanVec);  // TODO fix for numSamples>1
// 	const samples = m.Matrix.add(meanMat, covChol.mmul(v));
// 	return samples;
// }

export function sampleMvn(meanVec, covSqrt, v) {
//export function sampleMvn(meanVec, covSqrt, numSamples=1) {
	//const v = randn(meanVec.length, numSamples);
	if (v === undefined) {
		return m.Matrix.zeros(meanVec.length, 1);
	}
	const Lv = covSqrt.mmul(v);
	// TODO add mean
	return Lv;
}
