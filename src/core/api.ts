"use strict";
/** This file contains all Erdstall requests and transactions. */

import Address from "./address";
import Values from "../value/value";

type Signature = Uint8Array;

/** All Erdstall requests and transactions fulfill this interface. Many requests
	need to be authenticated and/or authorised by the Erdstall WebExtension
	before they can be sent to the Erdstall network. */
export interface Request
{
	Request: null;
	Authentication?: RequestAuthentication;
}

/** Authentication and authorisation fields for Erdstall requests and
	transactions. */
export interface RequestAuthentication
{
	Sender: Address;
	ReplayIsNonce: boolean;
	Replay: bigint; // Nonce or API token for replay protection.
	Signature: Signature;
}

/** Checks whether a request was authenticated by the Erdstall WebExtension. */
export function isAuthenticated(req: Request): boolean {
	return req.Authentication !== undefined;
}

/** Transfer transaction. */
export interface TransferTX extends Request
{
	TransferTX: null;
	Amount: Values;
	Recipient: Address;
}
/** Creates a new transfer transaction with the requested recipient and
	amount. */
export function newTransferTX(
	amount: Values,
	recipient: Address
): TransferTX
{
	return {
		Request: null, TransferTX: null,
		Amount: amount,
		Recipient: recipient
	};
}

/** Erdstall Exit transaction. */
export interface ExitTX extends Request { ExitTX: null; }
/** Creates an Exit transaction. */
export function newExitTX(): ExitTX { return { Request: null, ExitTX: null }; }

/** Represents a market trade offer. Contains both the offered basket, as well
	as the expected basket to trade for, and an expiry date indicating for how
	long the offer is valid. */
export interface TradeOffer {
	Owner: Address;
	Offer: Values;
	Expiry: Number;
	Request: Values;
	Signature: Uint8Array;
}

/** Represents an attempt to accept a trade offer, which is referenced via a
	hash. */
export interface TradeAccept {
	OfferHash: Uint8Array;
	Address: Address;
	Signature: Uint8Array;
}

/** A market trade transaction contains a trade offer by one user and a matching
	accept statement by another user. Together, they authenticate a swapping of
	assets. */
export interface TradeTX extends Request {
	TradeTX: null;
	Offer: TradeOffer;
	Accept: TradeAccept;
}

/** Mint transactions request that a certain token be minted. */
export interface MintTX extends Request {
	MinTX: null;
	Token: Address;
	ID: bigint;
}