"use strict";

export default class Future<T> extends Promise<T>
{
	public fulfill: any;
	public reject: any;

	constructor()
	{
		super((fulfill, reject) => {
			this.fulfill = fulfill;
			this.reject = reject;
		});
	}
}