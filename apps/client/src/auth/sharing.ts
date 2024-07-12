import * as ucans from "@ucans/ucans";

import { SharePlaylistPayloadSchema } from "../data/schema";
import { AuthStorage } from "./lib/storage";
import { getPlaylistSharingDelegation } from "./permissions";
import { DocumentId, Repo } from "@automerge/automerge-repo";
import { RootDocument } from "@musica/shared/models/RootDocument";
import { User } from "@musica/shared/models/User";
import { Did } from "@musica/shared/schema";

export async function generatePlaylistiInvitationUrl(
	user: User,
	target: Did,
	playlistId: DocumentId,
) {
	const url = new URL(location.origin);

	const ucan = await getPlaylistSharingDelegation(user.id, target, playlistId);

	url.search = "share";
	url.hash = encodeURIComponent(
		JSON.stringify(
			SharePlaylistPayloadSchema.parse({
				u: ucan,
				d: playlistId,
			}),
		),
	);

	return url.toString();
}

export async function acceptPlaylistInvitation(
	repo: Repo,
	user: User,
	invitation: string,
) {
	const payload = SharePlaylistPayloadSchema.parse(
		JSON.parse(decodeURIComponent(invitation)),
	);

	await ucans.validate(payload.u);
	await AuthStorage.storeUcanProof(payload.u);

	const rootDocument = repo.find<RootDocument>(user.rootDocument);
	const playlist = repo.find<RootDocument>(payload.d);

	await rootDocument.whenReady();

	rootDocument.change((doc) => {
		if (!doc.playlists.includes(playlist.documentId)) {
			doc.playlists.push(playlist.documentId);
		}
	});

	return true;
}
