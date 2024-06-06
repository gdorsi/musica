import { ClientProvider, Config, Local, Defaults } from "@dxos/react-client";
import { App } from "./App";
import { MusicCollectionItem } from "./state/types";

const config = async () => new Config(Local(), Defaults());

const createWorker = () =>
	new SharedWorker(new URL("./shared-worker", import.meta.url), {
		type: "module",
		name: "dxos-client-worker",
	});

const Loader = () => null;

export const Bootstrap = () => {
	return (
		<ClientProvider
			config={config}
			createWorker={createWorker}
			fallback={Loader}
			onInitialized={async (client) => {
				client.addSchema(MusicCollectionItem);

				const searchParams = new URLSearchParams(location.search);
				if (
					!client.halo.identity.get() &&
					!searchParams.has("deviceInvitationCode")
				) {
					await client.halo.createIdentity();
				}
			}}
		>
			<App />
		</ClientProvider>
	);
};
