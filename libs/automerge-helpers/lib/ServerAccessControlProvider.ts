import {
	Message,
	NetworkAdapter,
	NetworkAdapterEvents,
	RepoMessage,
} from "@automerge/automerge-repo";
import * as A from "@automerge/automerge/next";

type ServerAccessControlProviderOptions = {
	validateDocumentAccess(
		message: Message & { Authorization?: string },
		hasChanges: boolean,
	): Promise<boolean>;
};

export class ServerAccessControlProvider {
	#options: ServerAccessControlProviderOptions;

	constructor(options: ServerAccessControlProviderOptions) {
		this.#options = options;
	}

	wrap(baseAdapter: NetworkAdapter) {
		const originalEmit = baseAdapter.emit;

		const { validateDocumentAccess } = this.#options;

		function emit(event: keyof NetworkAdapterEvents, message: RepoMessage) {
			if (event === "message") {
				if (message.type === "sync" || message.type === "request") {
					let hasChanges = false;

					if (message.type === "sync" && message.data) {
						const payload = A.decodeSyncMessage(message.data);

						hasChanges = payload.changes.length > 0;
					}

					validateDocumentAccess(message, hasChanges).then((valid) => {
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
