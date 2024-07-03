import * as idb from "idb-keyval";
import * as ucans from "@ucans/ucans";
import { UserSchema, User } from "@musica/data/models/User";

async function getKeypairFromStorage(key: string) {
	const keypair = await idb.get(key);

	if (!keypair) throw new Error("the keypair is missing!");

	return new ucans.EcdsaKeypair(keypair.keypair, keypair.publicKey, false);
}

export const AuthStorage = {
	getUserData() {
		const value = localStorage.getItem("currentUser");

		if (value === null) return value;

		return UserSchema.parse(JSON.parse(value));
	},
	async storeUserData(value: User) {
		localStorage.setItem(
			"currentUser",
			JSON.stringify(UserSchema.parse(value)),
		);
	},
	getUcanProofs() {
		return idb.get<string[]>("ucan-proofs");
	},
	async storeUcanProof(proof: string) {
		const currentProofs = await idb.get<string[]>("ucan-proofs");

		if (currentProofs) {
			idb.set("ucan-proofs", currentProofs.concat(proof));
		}

		return idb.set("ucan-proofs", [proof]);
	},
	getKeypair(userId: User["id"]) {
		return getKeypairFromStorage(userId);
	},
	storeKeypair(userId: User["id"], keypair: ucans.EcdsaKeypair) {
		return idb.set(userId, keypair);
	},
	getTempJoinKeypair() {
		return getKeypairFromStorage("joinKeypair");
	},
	storeTempJoinKeypair(keypair: ucans.EcdsaKeypair) {
		return idb.set("joinKeypair", keypair);
	},
	cleanTempJoinKeypair() {
		return idb.del("joinKeypair");
	},
};
