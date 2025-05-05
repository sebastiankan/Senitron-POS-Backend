export interface IProduct {
	serial_number: string;
	item_number: string;
	epc: string;
	item_details: {
		name: string;
		sku: string;
		price: string;
	};
}
