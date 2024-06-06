import { InvitationEncoder } from "@dxos/client/invitations";
import { type PublicKey, useClient } from "@dxos/react-client";
import { useEffect, useState } from "react";

export type MusicCollectionItem = {
	id: string;
	fileName: string;
	title: string;
};

export type MusicCollectionDocument = { collection: MusicCollectionItem[] };

export function useJoinSpace() {
	const client = useClient();
	const [spaceKey, setSpaceKey] = useState<PublicKey>();

	// biome-ignore lint/correctness/useExhaustiveDependencies: Mount effect
	useEffect(() => {
		const params = new URLSearchParams(location.search);

		const invitationCode = params.get("invitationCode");
		const authCode = params.get("authCode");

		if (invitationCode && authCode) {
			const receivedInvitation = InvitationEncoder.decode(invitationCode);
			// accept the invitation
			const invitation = client.spaces.join(receivedInvitation);

			invitation.authenticate(authCode).then(() => {
				// space joined!
				const speceKey = invitation.get().spaceKey;

				console.log(invitation);
				if (speceKey) setSpaceKey(speceKey);
			});
		}
	}, []);

	return {
		spaceKey,
	};
}
