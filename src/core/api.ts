"use strict";
/** This file contains all Erdstall requests and transactions. */

import Address from "./address";

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
	AuthIsNonce: boolean;
	Auth: bigint; // Nonce or API token.
}
/** Checks whether a request was authenticated by the Erdstall WebExtension. */
export function isAuthenticated(req: Request): boolean {
	return req.Authentication !== undefined;
}

/** Transfer transaction. */
export interface TransferTX extends Request
{
	TransferTX: null;
	Amount: bigint;
	Recipient: Address;
}
/** Creates a new transfer transaction with the requested recipient and
	amount. */
export function newTransferTX(
	amount: bigint,
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