import { Controller, Inject } from "@tsed/di";
import { BodyParams, HeaderParams, QueryParams } from "@tsed/platform-params";
import { Get, Post, Put } from "@tsed/schema";
import { Shop } from "src/models/Shop.js";
import { ShopService } from "src/Services/ShopService.js";

@Controller("/shops")
export class ShopController {
	@Inject() private shopService: ShopService;

	@Post("/")
	async create(@BodyParams() shopData: Partial<Shop>): Promise<Shop> {
		return await this.shopService.create(shopData);
	}

	@Post("/auth")
	async auth(@HeaderParams("deviceId") deviceId: string, @BodyParams() params: { tenant: string; apiKey: string }): Promise<Shop> {
		return await this.shopService.auth({ ...params, deviceId });
	}

	@Put("/")
	async update(@QueryParams("id") id: string, @BodyParams() shopData: Partial<Shop>): Promise<Shop> {
		return await this.shopService.update(id, shopData);
	}

	@Get("/")
	async getOne(@QueryParams("id") id: string): Promise<Shop | null> {
		return await this.shopService.findById(id);
	}

	@Get("/all")
	async getAll(): Promise<Shop[] | null> {
		return await this.shopService.getAll();
	}
}
