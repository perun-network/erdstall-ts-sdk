// SPDX-License-Identifier: Apache-2.0
"use strict";

import WebSocket from "isomorphic-ws";

export const UninitializedConn = "uninitialized connection";

/**
 * Describes a provider which can exchange messages with an Enclave over an
 * untrusted message broker commonly referred to as the operator.
 */
export interface EnclaveProvider {
	/**
	 * Connects this entity to the enclave.
	 */
	connect(): void;
	/**
	 * Sends data to the enclave.
	 *
	 * @param data - The data to send.
	 * @throws An error when the connection was not setup beforehand with
	 * connect().
	 */
	send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void;
	/**
	 * Callback handler when the link gets closed.
	 */
	onclose?: ((this: EnclaveProvider, ev: CloseEvent) => any) | null;
	/**
	 * Callback handler when an error related to the connection is encountered.
	 */
	onerror?: ((this: EnclaveProvider, ev: Event) => any) | null;
	/**
	 * Callback handler when a message is received over the connection.
	 */
	onmessage?: ((this: EnclaveProvider, ev: MessageEvent) => any) | null;
	/**
	 * Callback handler when the connection is established.
	 */
	onopen?: ((this: EnclaveProvider, ev: Event) => any) | null;
	/**
	 * Closes the connection.
	 */
	close(): void;
}

/**
 * Implementation of an EnclaveProvider over a websocket connection.
 */
export class EnclaveWSProvider implements EnclaveProvider {
	public onopen: ((ev: Event) => any) | null;
	public onclose: ((ev: CloseEvent) => any) | null;
	public onerror: ((ev: Event) => any) | null;
	public onmessage: ((ev: MessageEvent) => any) | null;

	private url: string;
	private ws?: WebSocket;
	private initialized: boolean;

	constructor(url: URL) {
		this.url = url.toString();
		this.onopen = null;
		this.onclose = null;
		this.onerror = null;
		this.onmessage = null;
		this.initialized = false;
	}

	public connect() {
		this.close();
		this.ws = new WebSocket(this.url);
		this.ws.onmessage = this.onmessage;
		this.ws.onerror = this.onerror;
		this.ws.onopen = (e: Event): any => {
			this.initialized = true;
			if (this.onopen) this.onopen(e);
		};
		this.ws.onclose = this.onclose;
	}

	public close() {
		if (!this.ws) {
			return;
		}

		this.ws.close();
		this.ws = null;
		this.initialized = false;
	}

	public send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
		if (!this.initialized) {
			throw new Error(UninitializedConn);
		}

		this.ws.send(data);
	}
}
