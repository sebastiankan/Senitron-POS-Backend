import { Service } from "@tsed/di";
import { BadRequest } from "@tsed/exceptions";
import { Product } from "src/models/Product.js";

@Service()
export class SenitronAPI {
	async decodeEpc(params: { tenant: string; apiKey: string | undefined; epc: string }): Promise<Product> {
		if (!params.apiKey) {
			throw new BadRequest("Missing apiKey");
		}
		const apiKey = params.apiKey;
		let baseUrl = process.env.SENITRON_API_BASE_URL; // e.g., "https://example.com/farid/api/v1"
		baseUrl = baseUrl.replace("{tenant}", params.tenant);
		if (!apiKey || !baseUrl) {
			throw new Error("Missing SENITRON_API_KEY or SENITRON_API_BASE_URL in environment variables.");
		}

		const url = `${baseUrl}/epcs/decode?api_key=${apiKey}&epc=${encodeURIComponent(params.epc)}&item_details=true`;

		console.log("URL =====>>> ", url);
		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Senitron API request failed: ${response.status} ${response.statusText}`);
			}

			const data = await response.json();
			const product: Product = new Product(data);
			return product;
		} catch (error) {
			console.error("Error fetching product details from Senitron API:", error);
			throw error;
		}
	}
}
