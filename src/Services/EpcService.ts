import { Inject, Service } from "@tsed/di";
import { Product } from "src/models/Product.js";

import { SenitronAPI } from "./SenitronAPI.js";
import { ShopService } from "./ShopService.js";

@Service()
export class EpcService {
	@Inject() protected senitronApiService: SenitronAPI;
	@Inject() protected shopService: ShopService;

	async decode(params: { tenant: string; epc: string }): Promise<Product> {
		const shop = await this.shopService.findByTenant(params.tenant);
		return await this.senitronApiService.decodeEpc({ ...params, apiKey: shop.apiKey });
	}
}
