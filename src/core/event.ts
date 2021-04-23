"use strict";

export default class EventEmitter<T>
{
	private handlers: any;

	constructor() { this.handlers = {}; }

	on(event: T, handler: any): this
	{
		let e = event as unknown as string;
		if(!(e in this.handlers))
			this.handlers[e] = [];
		this.handlers[e].push(handler);

		return this;
	}

	off(event: T, handler: any): this
	{
		let e = event as unknown as string;
		if(!(e in this.handlers))
			return this;

		let hs = this.handlers[e];
		let i = hs.indexOf(handler);
		if(i !== -1)
			this.handlers[e] = hs.slice(0, i-1).concat(hs.slice(i+1));

		return this;
	}

	emit(event: T, ...values: any[]): this
	{
		let e = event as unknown as string;
		if(e in this.handlers)
			this.handlers[e].forEach((handler: any) => handler(...values));
		return this;
	}
}