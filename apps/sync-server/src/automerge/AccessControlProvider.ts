import {
	Message,
	NetworkAdapter,
	NetworkAdapterEvents,
	RepoMessage,
} from "@automerge/automerge-repo";

type AccessControlProviderOptions = {
	validateDocumentAccess(
		message: Message & { Authorization?: string },
	): Promise<boolean>;
};

export class AccessControlProvider {
	#options: AccessControlProviderOptions;

	constructor(options: AccessControlProviderOptions) {
		this.#options = options;
	}

	wrap(baseAdapter: NetworkAdapter) {
		const originalEmit = baseAdapter.emit;

		const { validateDocumentAccess } = this.#options;

		function emit(event: keyof NetworkAdapterEvents, message: RepoMessage) {
			if (event === "message") {
				if (message.type === "sync" || message.type === "request") {
					validateDocumentAccess(message).then((valid) => {
						if (valid) {
							originalEmit.call(baseAdapter, event, message);
						}
					});
					return;
				}
			}

			return originalEmit.call(baseAdapter, event, message);
		}

		// @ts-expect-error
		baseAdapter.emit = emit;

		return baseAdapter;
	}
}
