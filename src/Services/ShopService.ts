import { Inject, Injectable } from "@tsed/di";
import { BadRequest, NotFound } from "@tsed/exceptions";
import { MYSQL_DATA_SOURCE } from "src/config/DataSources/MysqlDatasource.js";
import { Shop } from "src/models/Shop.js";
import { DataSource, Repository } from "typeorm";

import { DeviceService } from "./DeviceService.js";

@Injectable()
export class ShopService {
	@Inject(MYSQL_DATA_SOURCE)
	protected dataSource: DataSource;

	@Inject(DeviceService) protected deviceService: DeviceService;
	shopRepository: Repository<Shop>;

	async $onInit() {
		if (!this.dataSource) {
			throw new Error("DataSource is undefined!");
		}

		this.shopRepository = this.dataSource.getRepository(Shop);
	}

	async findById(id: string): Promise<Shop> {
		const shop = await this.shopRepository.findOne({ where: { id }, relations: { devices: true } });
		if (!shop) throw new NotFound("Shop Not Found");
		return shop;
	}

	async getAll(): Promise<Shop[]> {
		const shop = await this.shopRepository.find();
		if (!shop) throw new NotFound("Shop Not Found");
		return shop;
	}

	async findByTenant(tenant: string): Promise<Shop> {
		const shop = await this.shopRepository.findOneBy({ tenant });
		if (!shop) throw new NotFound("Shop Not Found");
		return shop;
	}

	async create(data: Partial<Shop>): Promise<Shop> {
		const shop = this.shopRepository.create(data);
		return await this.shopRepository.save(shop);
	}

	async getOrCreate(params: { tenant: string; deviceId: string }): Promise<Shop> {
		let shop;
		shop = await this.shopRepository.findOneBy({ tenant: params.tenant });
		// Get or create Device
		if (shop) {
			return shop;
		}
		shop = await this.create(params);
		return await this.shopRepository.save(shop);
	}

	async registerDevice(params: { deviceId: string; tenant: string }) {
		const shop = await this.shopRepository.findOneBy({ id: params.tenant });
		if (!shop) throw new BadRequest("Shop not found");
		const deviceRegistedredInShop = shop.devices.map((e) => e.deviceId).includes(params.deviceId);
		if (!deviceRegistedredInShop) {
			const device = await this.deviceService.findOrCreateByDeviceId(params);
			shop.devices.push(device);
			await shop.save();
		}
		return shop;
	}

	async auth(params: { tenant: string; apiKey: string; deviceId: string }): Promise<Shop> {
		await this.getOrCreate(params);
		return await this.registerDevice(params);
	}

	async update(id: string, updates: Partial<Shop>): Promise<Shop> {
		const shop = await this.shopRepository.findOneBy({ id });
		if (!shop) throw new Error("Shop not found");

		Object.assign(shop, updates);
		return await this.shopRepository.save(shop);
	}
}
