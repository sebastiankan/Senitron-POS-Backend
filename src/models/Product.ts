import { IProduct } from "src/@types/IProduct.js";

export class Product implements IProduct {
	serial_number: string;
	item_number: string;
	epc: string;
	item_details: {
		name: string;
		sku: string;
		price: string;
		varianId?: string | undefined;
	};

	constructor(data: any) {
		this.serial_number = data.serial_number;
		this.item_number = data.item_number;
		this.epc = data.epc;
		this.item_details = {
			name: data.item_details?.name || "",
			sku: data.item_details?.sku || "",
			price: data.item_details?.price || "0.00",
			varianId: data.item_details?.attr13
		};
	}

	static fromApi(data: any): Product {
		return new Product(data);
	}
}
