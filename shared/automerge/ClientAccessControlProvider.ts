import { Message, NetworkAdapter } from "@automerge/automerge-repo";
import * as A from "@automerge/automerge/next";

type ClientAccessControlProviderOptions = {
	addAuthData(
		message: Message,
		hasChanges: boolean,
	): Promise<Message & { Authorization?: string }>;
};

export class ClientAccessControlProvider {
	#options: ClientAccessControlProviderOptions;

	constructor(options: ClientAccessControlProviderOptions) {
		this.#options = options;
	}

	wrap(baseAdapter: NetworkAdapter) {
		const originalSend = baseAdapter.send;

		const { addAuthData } = this.#options;

		async function send(message: Message) {
			if (message.type === "sync" || message.type === "request") {
				let hasChanges = false;

				if (message.type === "sync" && message.data) {
					const payload = A.decodeSyncMessage(message.data);

					hasChanges = payload.changes.length > 0;
				}

				originalSend.call(baseAdapter, await addAuthData(message, hasChanges));
			} else {
				originalSend.call(baseAdapter, message);
			}
		}

		baseAdapter.send = send;

		return baseAdapter;
	}
}
