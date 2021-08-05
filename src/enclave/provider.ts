// SPDX-License-Identifier: Apache-2.0
"use strict";

import WebSocket from "isomorphic-ws";

export const UninitializedConn = new Error("uninitialized connection");

export interface EnclaveProvider {
	connect(): void;
	send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void;
	onclose?: ((this: EnclaveProvider, ev: CloseEvent) => any) | null;
	onerror?: ((this: EnclaveProvider, ev: Event) => any) | null;
	onmessage?: ((this: EnclaveProvider, ev: MessageEvent) => any) | null;
	onopen?: ((this: EnclaveProvider, ev: Event) => any) | null;
	close(): void;
}

export class EnclaveWSProvider implements EnclaveProvider {
	public onopen: ((ev: Event) => any) | null;
	public onclose: ((ev: CloseEvent) => any) | null;
	public onerror: ((ev: Event) => any) | null;
	public onmessage: ((ev: MessageEvent) => any) | null;

	private url: string;
	private ws?: WebSocket;

	constructor(url: URL) {
		this.url = url.toString();
		this.onopen = null;
		this.onclose = null;
		this.onerror = null;
		this.onmessage = null;
	}

	public connect() {
		if (this.ws) {
			this.ws.close();
		}
		this.ws = new WebSocket(this.url);
		this.ws.onmessage = this.onmessage;
		this.ws.onerror = this.onerror;
		this.ws.onopen = this.onopen;
		this.ws.onclose = this.onclose;
	}

	public close() {
		if (!this.ws) {
			return;
		}

		this.ws.close();
	}

	public send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
		if (!this.ws) {
			throw UninitializedConn;
		}

		this.ws.send(data);
	}
}
