import * as ucans from "@ucans/ucans";

import {
	type User,
	type RootDocument,
	type Did,
	SharePlaylistPayloadSchema,
} from "../data/schema";
import { AuthStorage } from "./lib/storage";
import { getPlaylistSharingDelegation } from "./permissions";
import { DocumentId, Repo } from "@automerge/automerge-repo";

export async function generatePlaylistiInvitationUrl(
	user: User,
	target: Did,
	trackId: DocumentId,
	tracks: DocumentId[],
) {
	const url = new URL(location.origin);

	const ucan = await getPlaylistSharingDelegation(
		user.id,
		target,
		trackId,
		tracks,
	);

	url.search = "share";
	url.hash = encodeURIComponent(
		JSON.stringify(
			SharePlaylistPayloadSchema.parse({
				u: ucan,
				d: trackId,
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

	rootDocument.change((doc) => {
		if (!doc.playlists.includes(playlist.documentId)) {
			doc.playlists.push(playlist.documentId);
		}
	});

	return true;
}
