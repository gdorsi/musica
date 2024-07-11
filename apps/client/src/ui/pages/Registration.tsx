import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { z } from "zod";
import { JoinDevice } from "../components/recipes/join-device";
import { useState } from "react";
import { AuthData } from "@/auth/auth";
import { registerUser } from "@/auth/registration";

const FormSchema = z.object({
	name: z.string(),
	syncServer: z.optional(z.string()),
});

export function Registration(props: { onSuccess: (auth: AuthData) => void }) {
	const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (evt) => {
		evt.preventDefault();

		const formData = new FormData(evt.currentTarget);

		const payload = FormSchema.parse(Object.fromEntries(formData.entries()));

		const auth = await registerUser(payload);
		props.onSuccess(auth);
	};

	const [withSyncServer, setWithSyncServer] = useState(false);

	return (
		<>
			<div className="absolute right-3 top-3">
				<JoinDevice />
			</div>
			<Card className="w-[350px] m-auto">
				<CardHeader>
					<CardTitle>Create a new account</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						className="grid w-full items-center space-y-3"
						onSubmit={handleSubmit}
					>
						<div className="flex flex-col space-y-1.5">
							<Label htmlFor="name">Your name</Label>
							<Input id="name" name="name" required autoComplete="off" />
						</div>

						<div className="flex flex-col space-y-1.5">
							<Label className="flex space-x-1.5">
								<input
									type="checkbox"
									onChange={(evt) => setWithSyncServer(evt.target.checked)}
								/>
								<span>Sync server</span>
							</Label>
							{withSyncServer && (
								<Input
									id="syncServer"
									name="syncServer"
									required
									autoComplete="off"
									value="127.0.0.1:8787"
								/>
							)}
						</div>

						<Button type="submit">Register</Button>
					</form>
				</CardContent>
			</Card>
		</>
	);
}
