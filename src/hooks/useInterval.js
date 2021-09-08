import { useEffect, useRef } from 'react';

export default function useInterval(callback, delay) {
	const savedCallback = useRef();
	const refIntervalId = useRef();

	// Remember the latest callback.
	useEffect(() => {
		savedCallback.current = callback;
	}, [callback]);

	// Set up the interval.
	useEffect(() => {
		function tick() {
			savedCallback.current();
		}
		if (delay !== null) {
			refIntervalId.current = setInterval(tick, delay);
			return () => clearInterval(refIntervalId.current);
		}
	}, [delay]);

	return refIntervalId;
}