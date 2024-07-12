import { Button } from "../ui/button";
import { useState } from "react";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "../ui/dialog";
import { copyToClipboard } from "@/utils";
import { createJoinKeypair } from "@/auth/registration";

export function JoinDevice() {
	const [did, setDid] = useState<string>();

	const handleJoinClick = async () => {
		const keypair = await createJoinKeypair();
		setDid(keypair.did());
		handleCopyClick();
	};

	const handleCopyClick = () => {
		copyToClipboard({
			textToCopy: did,
			toastText: "Device id copied on the clipboard",
		});
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button onClick={handleJoinClick}>Join Device</Button>
			</DialogTrigger>
			<DialogContent className="max-w-[550px] w-[550px]">
				<DialogHeader>
					<DialogTitle>Add a new device</DialogTitle>
					<DialogDescription className="grid items-center space-y-3">
						<div>This device id</div>
						<div>
							<pre className="border rounded-sm p-2">{did}</pre>
						</div>

						<Button onClick={handleCopyClick}>Copy</Button>
					</DialogDescription>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}
