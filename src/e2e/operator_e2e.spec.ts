import { EthereumSigner } from "#erdstall/crypto/ethereum";
import { SubstrateSigner } from "#erdstall/crypto/substrate";
import { Signer } from "#erdstall/ledger/backend";
import {
	mkDefaultEthereumSessionConstructor
} from "#erdstall/ledger/backend/ethereum";
import { Session, BackendSessionConstructors } from "#erdstall";
import { TxStatusCode } from "#erdstall/api/responses";
import { AssetID } from "#erdstall/crypto";
import { Chain } from "#erdstall/ledger";
import { ChainAssets, Tokens } from "#erdstall/ledger/assets";
import { expect } from "chai";

let lastIt: Promise<unknown> = Promise.resolve();
function itAsync<T>(desc: string, fn: (x?: unknown) => Promise<T>): Promise<T> {
	let accept: (res: T) => unknown, reject: (err: any) => unknown;
	const exec = new Promise<T>((a, r) => { accept = a; reject = r; });

	it(desc, (done) => {
		lastIt.then((v) => {
			lastIt = exec;
			exec.then(() => done(), done);
			fn(v).then(accept, reject);
		});
	})
	return exec;
}

function describeV<T>(desc: string, fn: () => T, timeout?: number): T {
	let result: T = undefined as T;
	describe(desc, function(this: any) {
		if(timeout) this.timeout(timeout!);
		result = fn.call(this);
	});
	return result;
}


function e2e_operator(operator_url?: URL) {
	const { ethSession, substSession} = describeV(
		"Setup: Ethereum account session & Substrate account session", () => {
		const keys = itAsync("Setting up accounts", async () => {
			const eth = EthereumSigner.generateCustodialAccount().signer;
			const subst = (await SubstrateSigner.generateCustodialAccount()).signer;
			return { eth, subst };
		});

		const enclaveUrl = operator_url ?? new URL("ws://127.0.0.1:1337/ws");

		const backendCtors = { } as BackendSessionConstructors; // no backends for now

		const ethSession = itAsync("Setting up eth session", async () =>
			await Session.create<["ethereum"]>(
				(await keys).eth,
				enclaveUrl,
				backendCtors));

		const substSession = itAsync("Setting up substrate session", async () =>
			await Session.create<["substrate"]>(
				(await keys).subst,
				enclaveUrl,
				backendCtors));

		itAsync("Connecting", async () => Promise.all([
			(await ethSession).initialize(),
			(await substSession).initialize()]));

		itAsync("Subscribing to receipts", async () => Promise.all([
			(await ethSession).subscribeSelf(),
			(await substSession).subscribeSelf()]));

		return { ethSession, substSession };
	}, 5000);

	after(async () => {
		(await ethSession).disconnect();
		(await substSession).disconnect();
	});

	const tokenName = new Uint8Array(32);

	for(let i = 0; i < 2; i++)
	describeV(`Minting a token on Ethereum account${i ? " again (should fail)" : ""}`, () =>
	{
		let handle = itAsync("Sending transaction", async () =>
			await (await ethSession).mint(tokenName, 1n));
		itAsync("Awaiting confirmation", async () =>
			await (await handle).accepted);
		itAsync(`Expecting ${i?"failed":"successful"} receipt`, async () => {
			const r = await (await handle).receipt;
			expect(r.status, "Transaction status code").to.equal(
				i ? TxStatusCode.Fail : TxStatusCode.Success);
		});
	}, 5000);

	describeV("Transferring minted token to Substrate account", () =>
	{
		const acc = itAsync("Fetching balance", async () =>
			await (await ethSession).getOwnAccount());
		const handle = itAsync("Sending transaction", async () =>
			await (await ethSession).transferTo(
				(await acc).values,
				(await substSession).address));
		itAsync("Awaiting confirmation", async () => (await handle).accepted);
		itAsync("Expecting successful receipt", async () => {
			const r = await (await handle).receipt;
			expect(r.status, "Transaction status code").to.equal(
				TxStatusCode.Success);
		});
	}, 5000);


	for(let i = 0; i < 2; i++)
	describeV(`Transferring minted token back to Ethereum account${i ?" again (should fail)":""}`, () =>
	{
		const handle = itAsync("Sending transaction", async () => {
			const userToken = AssetID.erdstallUserToken(
				(await ethSession).address, tokenName);
			const values = new ChainAssets();
			values.addAsset(Chain.Erdstall, userToken, new Tokens([1n]));

			return await (await substSession).transferTo(
				values,
				(await ethSession).address);
		});
		itAsync("Awaiting confirmation", async () => (await handle).accepted);
		itAsync(`Awaiting ${i?"failed":"successful"} receipt`, async () => {
			const r = await (await handle).receipt;
			expect(r.status, "Transaction status code").to.equal(
				i ? TxStatusCode.Fail : TxStatusCode.Success);
		});
	}, 5000);
}

describe("Operator basic end-to-end test", () => e2e_operator());