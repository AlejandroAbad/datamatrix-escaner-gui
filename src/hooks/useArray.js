const { useState, useCallback } = require("react");

export default function useArray(initialList) {
	const [list, set] = useState(initialList);
	const empty = useCallback(() => set([]), [set]);
	const replace = useCallback((newList) => set(newList), [set]);
	const push = useCallback((item) => set(l => [...l, item]), [set]);
	const setAt = useCallback((index, value) => set(l => [...l.slice(0, index), value, ...l.slice(index + 1)]), [set])
	const removeAt = useCallback((index) => set(l => [...l.slice(0, index), ...l.slice(index + 1)]), [set]);
	const filter = useCallback((filterFn) => set(l => l.filter(filterFn)), [set]);
	const map = useCallback((mapFn) => set(l => [...l].map(mapFn)), [set]);
	const sort = useCallback((sortFn) => set(l => [...l].sort(sortFn)), [set]);
	const reverse = useCallback(() => set(l => [...l].reverse()), [set]);
	const mergeBefore = useCallback((arr) => set(l => [...arr].concat([...l])), [set]);
	const mergeAfter = useCallback((arr) => set(l => [...l].concat([...arr])), [set]);

	return [
		list,
		{
			set,
			empty,
			replace,
			push,
			setAt,
			removeAt,
			filter,
			map,
			sort,
			reverse,
			mergeBefore,
			mergeAfter,
		}
	];
}