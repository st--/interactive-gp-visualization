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
