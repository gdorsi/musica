import {
	type CancellableInvitationObservable,
	Invitation,
} from "@dxos/client/invitations";
import { useSpace } from "@dxos/react-client/echo";
import { useInvitationStatus } from "@dxos/react-client/invitations";
import { useState } from "react";

export function useShareSpace() {
	const space = useSpace();
	const [invitation, setInvitation] =
		useState<CancellableInvitationObservable>();

	const status = useInvitationStatus(invitation);

	async function createNewInvitation() {
		if (!space) return;

		const invitation = space.share({
			authMethod: Invitation.AuthMethod.SHARED_SECRET,
		});

		setInvitation(invitation);
	}

	async function cancel() {
		if (invitation) {
			await invitation.cancel();
		}
		setInvitation(undefined);
	}

	let url: null | URL = null;

	if (status.invitationCode && status.authCode) {
		url = new URL(location.href);
		url.search = "";

		url.searchParams.append("invitationCode", status.invitationCode);
		url.searchParams.append("authCode", status.authCode);
	}

	async function copy() {
		if (url) {
			navigator.clipboard.writeText(url.toString());
		}
	}

	return {
		url,
		createNewInvitation,
		cancel,
		copy,
	};
}
