"use strict";

import {AssetID, AssetTypeName} from "#erdstall/crypto";
import {Asset, Amount, Tokens, ChainAssets} from "#erdstall/ledger/assets";
import {
	WildcardTx,
	UnsignedTx,
	TxReceipt,
	SignedTx,
	DepositTx,
	WithdrawTx,
	TxSigner,
	TxSender
} from "#erdstall/ledger/backend";
import { Chain } from "#erdstall/ledger";

import {ChainProofChunk} from "#erdstall/api/responses";
import {SubstrateAddress, SubstrateSigner} from "#erdstall/crypto/substrate";

import { ApiPromise } from "@polkadot/api";
import { Keyring } from "@polkadot/keyring";

type U64 = bigint;
type H256 = Uint8Array;
type Address = string;

enum AssetType {
	Fungible = 0,
	NFT = 1
};


interface InternalDepositRequest {
	origin: number;
	assetType: AssetType;
	primaryId: H256;
	secondaryId: H256;
};

interface InternalWithdrawRequest {
	epoch: U64;
	origin: Chain;
	assetOrigin: Chain; // duplicate, unused field... Set it to origin.
	account: Address;
	exitFlag: boolean;
	chunkIndex: number;
	chunkLast: number;
	assetType: AssetType;
	primaryId: H256;
	secondaryId: H256;
};

type Sig = Uint8Array;


interface TxStatus {
	isFinalized: boolean;
}
type StatusCallback = (update: {
	txHash: any,
	events?: any[],
	status: TxStatus,
	isInBlock: boolean,
	isFinalized: boolean,
	isError: boolean,
	dispatchError: any
}) => void;

interface SignedExtrinsic {
	nonce: any;

	// returns unsubscribe operation
	send(callback?: StatusCallback): () => void;

	toHuman(): any;
}
interface ExtrinsicReturn {
	signAsync(keypair: any, nonce: {nonce: bigint}): Promise<SignedExtrinsic>;
	toHuman(): any;
};

interface InternalApi {
	deposit(deposit: InternalDepositRequest): ExtrinsicReturn;
	withdraw(bp: InternalWithdrawRequest, sig: Sig): ExtrinsicReturn;
};

export class UnsignedSubstrateTransaction extends UnsignedTx {
	#native: ExtrinsicReturn;

	get native(): any { return this.#native.toHuman(); }

	constructor(tx: WildcardTx, native: ExtrinsicReturn)
	{
		super(tx);
		this.#native = native;
	}

	override async sign(s: TxSigner, session: any): Promise<SignedTx> {
		if(!(s instanceof SubstrateTxSigner))
			throw new Error("Not a substrate TX signer");

		const signed = await s.signTransaction(this.#native, session, this.chain);

		return new SignedSubstrateTransaction(
			this.description,
			signed,
			s.address);
	}
}

export class SignedSubstrateTransaction extends SignedTx
{
	#native: SignedExtrinsic;
	#sender: SubstrateAddress;

	constructor(
		desc: WildcardTx,
		native: SignedExtrinsic,
		sender: SubstrateAddress)
	{
		super(desc);
		this.#native = native;
		this.#sender = sender.clone();
	}

	override get sender(): SubstrateAddress { return this.#sender; }

	override get native() { return this.#native.toHuman(); }
	override get nonce(): bigint { return this.#native.nonce.toBigInt(); }

	override async send(s: TxSender): Promise<TxReceipt>
	{
		let accept: (x: boolean) => void, reject: (err:any) => void;
		const success = new Promise<boolean>((accept_, reject_) => {
			accept = accept_;
			reject = reject_;
		});

		const unlisten = await this.#native.send((update: {
			txHash: any,
			events?: any[],
			status: TxStatus,
			isFinalized: boolean,
			isError: boolean,
			dispatchError: any
		}) => {
			if(update.isError || update.dispatchError)
			{
				console.error(update.events);
				console.error(update.dispatchError);
				accept(false);
				return;
			}

			if(update.isFinalized)
			{
				accept(true);
			}
		});

		success.finally(unlisten);

		return {
			tx: this,
			success: success,
			nativePending: undefined,
			hash: new Uint8Array(32),
		};
	}

	override unsign(): UnsignedSubstrateTransaction {
		return new UnsignedSubstrateTransaction(
			this.description,
			this.#native as any as ExtrinsicReturn);
	}
}

// The pallet uses a little endian byte array.
function bigintToH256(n: bigint): H256
{
	const bytes = new Uint8Array(32);

	for(let i = 0; i < 32; i++)
	{
		bytes[i] = Number(n & 0xffn);
		n >>= 8n;
	}

	if(n) {
		throw new Error("not a valid 256-bit integer.");
	}

	return bytes;
}

// Catch any misspelled or ommitted/defaulted arguments.
// Checks that no argument was superfluous or misspelled and accidentally defaulted.
function check(args:any, tx: ExtrinsicReturn): ExtrinsicReturn {
	let apiArgs: any = tx.toHuman().method.args;
	const errors = [];
	for(let arg in args)
	{
		if(!(arg in apiArgs))
			throw new Error(`'${arg}' is not part of the API arguments.`);

		for(let field in args[arg])
			if(!(field in apiArgs[arg]))
				errors.push(`We passed field ${arg}.${field}, but it does not exist in the API.`);
		for(let field in apiArgs[arg])
			if(!(field in args[arg]))
				errors.push(`Field ${arg}.${field} was not passed, so it got defaulted`);
	}

	if(errors.length)
		throw new Error(`Malformed API args:\n - ${errors.join("\n - ")}`);

	return tx;
}

export class SubstrateTxSigner extends TxSigner {
	#api: ApiPromise;
	#signer: SubstrateSigner;

	get address() { return this.#signer.address(); }

	constructor(chain: Chain, api: ApiPromise, signer: SubstrateSigner)
	{
		let fetchNonce = async () =>
			(await this.#api.rpc.system.accountNextIndex(
				this.#signer.address().toString()
			)).toBigInt();
		super(chain, fetchNonce);
		this.#api = api;
		this.#signer = signer;
	}

	async signTransaction(
		tx: ExtrinsicReturn,
		session: any,
		chain: Chain): Promise<SignedExtrinsic>
	{
		this.require(session, chain);
		let nonce = await this.incNonce(session, chain);
		
		// Somehow, the keyring type is important here...
		const keyring = new Keyring({type: "sr25519"});
		const keyringPair = keyring.addFromPair(this.#signer.keyPair);

		return await tx.signAsync(keyringPair, { nonce });
	}
}

export class SubstrateTxSender extends TxSender {
	constructor(chain: Chain)
		{ super(chain); }

	async send(tx: SignedTx): Promise<TxReceipt>
		{ throw new Error("The tx sends itself..."); }
}

export class API
{
	#chain: Chain;

	constructor(
		chain: Chain,
		private api: InternalApi)
	{ this.#chain = chain; }

	deposit(kind: AssetID, amount: Asset): UnsignedTx[]
	{
		let shared: any = {
			origin: kind.origin(),
			assetType: kind.type(),
			primaryId: kind.localID()
		};

		let txs: UnsignedTx[] = [];
		switch(kind.type())
		{
		case AssetType.Fungible:
		{
			if(!(amount instanceof Amount))
				throw new Error(`Amount has wrong type.`);

			let asset_deposit = {...shared,
				secondaryId: bigintToH256(amount.value)
			};

			const assets = new ChainAssets;
			assets.addAsset(kind.origin(), kind.localID(), amount);
			txs.push(new UnsignedSubstrateTransaction(
				new DepositTx(this.#chain, assets),
				check({asset_deposit}, this.api.deposit(asset_deposit))));
		} break;
		case AssetType.NFT:
		{
			if(!(amount instanceof Tokens))
				throw new Error(`Amount has wrong type.`);

			for(let id of amount.value)
			{
				let asset_deposit = {...shared,
					secondaryId: bigintToH256(id)
				};

				const assets = new ChainAssets;
				assets.addAsset(kind.origin(), kind.localID(), new Tokens([id]));

				txs.push(new UnsignedSubstrateTransaction(
					new DepositTx(this.#chain, assets),
					check({asset_deposit}, this.api.deposit(asset_deposit))));
			}
		} break;
		default:
			throw new Error(`unhandled asset type ${
				AssetTypeName(kind.type())}`);
		}

		// todo: sign them.
		// todo: create awaitable transaction wrapper, use it also for eth txs.
		return txs;
	}

	// Withdraw a single chainproof chunk.
	withdraw({proofs, chunk, user, exit, epoch}: {
		proofs: ChainProofChunk[],
		chunk: number,
		user: SubstrateAddress,
		exit: boolean,
		epoch: bigint,
	}): UnsignedTx[] {
		// currently, the on-chain implementation insists that we only pass a single fungible or NFT per transaction/chunk. So we are going to assert here. In case this ever changes, we are sure not to miss this.
		let assets = proofs[chunk].funds.ordered();
		if(assets.length != 1)
			throw new Error(`Expected BP chunk to have only one asset, has ${assets.length}`);

		let [kind, amount] = assets[0];
		let shared: any = {
			epoch,
			origin: kind.origin(),
			assetOrigin: kind.origin(),
			account: user,
			exitFlag: exit,
			chunkIndex: chunk,
			chunkLast: proofs.length-1,
			assetType: kind.type(),
			primaryId: kind.localID()
		};
		let signature = proofs[chunk].sig.toBytes();

		const withdrawTx = new WithdrawTx({
			chain: this.#chain,
			proofChunk: proofs[chunk],
			chunkIndex: chunk,
			chunkCount: proofs.length,
			epoch: epoch,
			account: user
		});

		switch(kind.type())
		{
		case AssetType.Fungible:
		{
			if(!(amount instanceof Amount))
				throw new Error(`Amount has wrong type.`);

			let balance_proof = {...shared,
				secondaryId: bigintToH256(amount.value)
			};

			return [new UnsignedSubstrateTransaction(
				withdrawTx,
				check(
					{balance_proof, signature},
					this.api.withdraw(balance_proof, signature)))];
		} break;
		case AssetType.NFT:
		{
			if(!(amount instanceof Tokens))
				throw new Error(`Amount has wrong type.`);

			if(amount.value.length != 1)
				throw new Error(`Expected BP chunk to have one NFT, has ${amount.value.length}`);

			let balance_proof = {...shared,
				secondaryId: bigintToH256(amount.value[0])
			};
			return [new UnsignedSubstrateTransaction(
				withdrawTx,
				check(
					{balance_proof, signature},
					this.api.withdraw(balance_proof, signature)))];
		} break;
		default:
			throw new Error(`unhandled asset type ${
				AssetTypeName(kind.type())}`);
		}
	}
}

/*
import type { ApiTypes, AugmentedSubmittable, SubmittableExtrinsic, SubmittableExtrinsicFunction } from '@polkadot/api-base/types';
import type { Data } from '@polkadot/types';
import type { Bytes, Compact, Null, Option, U8aFixed, Vec, bool, u128, u16, u32, u64, u8 } from '@polkadot/types-codec';
import type { AnyNumber, IMethod, ITuple } from '@polkadot/types-codec/types';
import type { AccountId32, Call, H256, MultiAddress } from '@polkadot/types/interfaces/runtime';

export type __AugmentedSubmittable = AugmentedSubmittable<() => unknown>;
export type __SubmittableExtrinsic<ApiType extends ApiTypes> = SubmittableExtrinsic<ApiType>;
export type __SubmittableExtrinsicFunction<ApiType extends ApiTypes> = SubmittableExtrinsicFunction<ApiType>;

declare module '@polkadot/api-base/types/submittable' {
  interface AugmentedSubmittables<ApiType extends ApiTypes> {
    wildcard: {
      challenge: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>, []>;
      deposit: AugmentedSubmittable<(assetDeposit: PalletAjunaWildcardAssetAssetDeposit | { origin?: any; assetType?: any; primaryId?: any; secondaryId?: any } | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [PalletAjunaWildcardAssetAssetDeposit]>;
      freeze: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>, []>;
      propagateFreeze: AugmentedSubmittable<(freezeProof: PalletAjunaWildcardAssetFreezeProof | { epoch?: any; origin?: any; identifier?: any } | string | Uint8Array, clientKey: SpCoreSr25519Public | string | Uint8Array, clientKeySignature: SpCoreSr25519Signature | string | Uint8Array, proofSignature: SpCoreSr25519Signature | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [PalletAjunaWildcardAssetFreezeProof, SpCoreSr25519Public, SpCoreSr25519Signature, SpCoreSr25519Signature]>;
      refundFrozen: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>, []>;
      respondChallenge: AugmentedSubmittable<(balanceProof: PalletAjunaWildcardAssetBalanceProof | { epoch?: any; origin?: any; account?: any; exitFlag?: any; chunkIndex?: any; chunkLast?: any; assetOrigin?: any; assetType?: any; primaryId?: any; secondaryId?: any } | string | Uint8Array, signature: SpCoreSr25519Signature | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [PalletAjunaWildcardAssetBalanceProof, SpCoreSr25519Signature]>;
      respondZeroChallenge: AugmentedSubmittable<(zeroProof: PalletAjunaWildcardAssetZeroBalanceProof | { epoch?: any; origin?: any; account?: any } | string | Uint8Array, signature: SpCoreSr25519Signature | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [PalletAjunaWildcardAssetZeroBalanceProof, SpCoreSr25519Signature]>;
      setAdministrator: AugmentedSubmittable<(administrator: AccountId32 | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [AccountId32]>;
      setParameters: AugmentedSubmittable<(startTime: Option<u64> | null | Uint8Array | u64 | AnyNumber, epochDuration: Option<u64> | null | Uint8Array | u64 | AnyNumber, signerKey: Option<SpCoreSr25519Public> | null | Uint8Array | SpCoreSr25519Public | string) => SubmittableExtrinsic<ApiType>, [Option<u64>, Option<u64>, Option<SpCoreSr25519Public>]>;
      withdraw: AugmentedSubmittable<(balanceProof: PalletAjunaWildcardAssetBalanceProof | { epoch?: any; origin?: any; account?: any; exitFlag?: any; chunkIndex?: any; chunkLast?: any; assetOrigin?: any; assetType?: any; primaryId?: any; secondaryId?: any } | string | Uint8Array, signature: SpCoreSr25519Signature | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [PalletAjunaWildcardAssetBalanceProof, SpCoreSr25519Signature]>;
      withdrawFrozen: AugmentedSubmittable<(balanceProof: PalletAjunaWildcardAssetBalanceProof | { epoch?: any; origin?: any; account?: any; exitFlag?: any; chunkIndex?: any; chunkLast?: any; assetOrigin?: any; assetType?: any; primaryId?: any; secondaryId?: any } | string | Uint8Array, signature: SpCoreSr25519Signature | string | Uint8Array) => SubmittableExtrinsic<ApiType>, [PalletAjunaWildcardAssetBalanceProof, SpCoreSr25519Signature]>;
      [key: string]: SubmittableExtrinsicFunction<ApiType>;
    };
  } // AugmentedSubmittables
} // declare module

 */