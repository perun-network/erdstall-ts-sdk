"use strict";

import Address from "./address";
import * as API from "./api";
import Future from "../util/future";

/** Describes the permission level granted to the current execution context by
	the Erdstall WebExtension. */
export enum Permission
{
	/** With this permission level, all requests made to Erdstall are
		immediately blocked, and the user will not be prompted or notified about
		them. */
	Blocked,
	/** With this permission level, all requests, whether read or write, need to
		be approved by the user manually. */
	None,
	/** With this permission level, all read requests will be automatically
		authorised without a prompt to the user, but write requests still have
		to be approved manually. */
	Read,
	/** With this permission level, all requests will be automatically
		authorised without a prompt to the user. */
	Full
}

/** Interfaces with the Erdstall WebExtension. It detects whether the Erdstall
	WebExtension is present and relays Erdstall API requests and transactions to
	it. If any request sent to the WebExtension is rejected or the WebExtension
	is not present, all requests and queries throw errors. Check WebExtension
	availability via isPresent(). */
export default abstract class WebX
{
	/** Requests authorisation of an Erdstall API request or transaction. */
	static async authorise(req: API.Request): Promise<API.Request>
	{ return req; }

	/** Retrieves the user's Erdstall address. */
	static async address(): Promise<Address>
	{ return WebX.mockUser; }
	
	/** Retrieves the user's Erdstall balance. */
	static async balance(): Promise<bigint>
	{ return WebX.mockBalance; }

	/** Queries the current execution context's permission level. */
	static async permission(): Promise<Permission>
	{ return WebX.mockPermission; }

	/** Indicates whether the WebExtension is present. */
	static isPresent(): boolean { return true; }


	// mock area

	private static mockUser: Future<Address> = new Future<Address>();
	private static mockBalance: Future<bigint> = new Future<bigint>();
	private static mockPermission: Future<Permission> = new Future<Permission>();

	static mockInit(user: Address, balance: bigint, permission: Permission): void
	{
		this.mockUser.fulfill(user);
		this.mockBalance.fulfill(balance);
		this.mockPermission.fulfill(permission);
	}
}