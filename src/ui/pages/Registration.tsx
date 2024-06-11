import { registerUser } from "@/state/auth";
import type React from "react";
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
import type { AuthData } from "@/state/auth";

const FormSchema = z.object({
	name: z.string(),
	syncServer: z.string(),
});

export function Registration(props: { onSuccess: (auth: AuthData) => void }) {
	const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (evt) => {
		evt.preventDefault();

		const formData = new FormData(evt.currentTarget);

		const payload = FormSchema.parse(Object.fromEntries(formData.entries()));

		const auth = await registerUser(payload);
		props.onSuccess(auth);
	};

	return (
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
						<Label htmlFor="syncServer">Your sync server</Label>
						<Input
							id="syncServer"
							name="syncServer"
							required
							autoComplete="off"
							value="127.0.0.1:3000"
							pattern="\d{1-3}\.\d{1-3}\.\d{1-3}(:\d+)?"
						/>
					</div>

					<Button type="submit">Register</Button>
				</form>
			</CardContent>
		</Card>
	);
}
