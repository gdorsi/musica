export function promiseWithResolvers<R>() {
	let resolve = (_: R) => {};
	let reject = (_: unknown) => {};

	const promise = new Promise<R>((_resolve, _reject) => {
		resolve = _resolve;
		reject = _reject;
	});

	return {
		promise,
		resolve,
		reject,
	};
}
