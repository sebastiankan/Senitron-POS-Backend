import { Inject, Service } from "@tsed/di";
import { Product } from "src/models/Product.js";

import { SenitronAPI } from "./SenitronAPI.js";

@Service()
export class EpcService {
	@Inject() protected senitronApiService: SenitronAPI;

	async decode(params: { tenant: string; apiKey: string | undefined; epc: string }): Promise<Product> {
		return await this.senitronApiService.decodeEpc(params);
	}
}
