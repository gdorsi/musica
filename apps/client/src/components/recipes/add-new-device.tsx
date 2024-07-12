import { Button } from "../ui/button";
import { MdOutlineDevices } from "react-icons/md";

import { DidSchema } from "@musica/shared/schema";
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
import { copyToClipboard } from "@/utils";
import { generateInvitationURL } from "@/auth/registration";
import { useUser } from "@/auth/useUser";

export function AddNewDevice() {
	const user = useUser();
	const [invitationUrl, setInvitationUrl] = useState<string>();

	const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (evt) => {
		evt.preventDefault();

		const formData = new FormData(evt.currentTarget);

		const deviceId = DidSchema.parse(formData.get("deviceId"));

		const invitationUrl = await generateInvitationURL(user, deviceId);

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
						<MdOutlineDevices /> Pair a device
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Pair a new device</DialogTitle>
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
