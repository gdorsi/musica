import { Button } from "../ui/button";
import { MdOutlineDevices } from "react-icons/md";

import { useState } from "react";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "../ui/dialog";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { copyToClipboard } from "@/ui/utils";
import { useUser } from "@/auth/useUser";
import { DocumentId } from "@automerge/automerge-repo";
import { generatePlaylistiInvitationUrl } from "@/auth/sharing";
import { useRepo } from "@automerge/automerge-repo-react-hooks";
import { Playlist } from "@musica/data/models/Playlist";
import { DidSchema } from "@musica/data/schema";

export function SharePlaylist({ trackId }: { trackId: DocumentId }) {
	const user = useUser();
	const repo = useRepo();
	const [invitationUrl, setInvitationUrl] = useState<string>();

	const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (evt) => {
		evt.preventDefault();

		const formData = new FormData(evt.currentTarget);

		const deviceId = DidSchema.parse(formData.get("deviceId"));

		const handle = repo.find<Playlist>(trackId);

		await handle.whenReady(["unavailable", "ready"]);

		const doc = handle.docSync();

		if (!doc) return;

		const invitationUrl = await generatePlaylistiInvitationUrl(
			user,
			deviceId,
			trackId,
		);

		setInvitationUrl(invitationUrl);
		copyToClipboard({
			textToCopy: invitationUrl,
			toastText: "Invitation copied on the clipboard",
		});
	};

	const handleCopyClick = () => {
		copyToClipboard({
			textToCopy: invitationUrl,
			toastText: "Invitation copied on the clipboard",
		});
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			setInvitationUrl(undefined);
		}
	};

	return (
		<>
			<Dialog onOpenChange={handleOpenChange}>
				<DialogTrigger asChild>
					<Button className="flex gap-2">
						<MdOutlineDevices /> Share the playlist
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Share the playlist</DialogTitle>
						<DialogDescription>
							<form
								className="grid w-full items-center space-y-3"
								onSubmit={handleSubmit}
							>
								{!invitationUrl && (
									<>
										<div className="flex flex-col space-y-1.5">
											<Label htmlFor="deviceId">Device id</Label>
											<Input
												id="deviceId"
												name="deviceId"
												required
												autoComplete="off"
											/>
										</div>

										<Button type="submit">Generate invitation link</Button>
									</>
								)}

								{invitationUrl && (
									<>
										<div>Invitation link</div>

										<div className="border rounded-sm p-2 overflow-auto text-nowrap">
											{invitationUrl}
										</div>

										<Button onClick={handleCopyClick}>Copy</Button>
									</>
								)}
							</form>
						</DialogDescription>
					</DialogHeader>
				</DialogContent>
			</Dialog>
		</>
	);
}
