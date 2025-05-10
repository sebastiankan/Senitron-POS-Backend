import { Inject, Injectable } from "@tsed/di";
import { NotFound } from "@tsed/exceptions";
import { MYSQL_DATA_SOURCE } from "src/config/DataSources/MysqlDatasource.js";
import { Cart } from "src/models/Cart.js";
import { Device } from "src/models/DeviceId.js";
import { Shop } from "src/models/Shop.js";
import { DataSource, Repository } from "typeorm";

import { EpcService } from "./EpcService.js";

@Injectable()
export class DeviceService {
	@Inject(MYSQL_DATA_SOURCE)
	protected dataSource: DataSource;

	@Inject(EpcService)
	protected epcService: EpcService;

	deviceRepo: Repository<Device>;
	shopRepository: Repository<Shop>;
	cartRepository: Repository<Cart>;

	async $onInit() {
		if (!this.dataSource) throw new Error("DataSource is undefined!");

		this.deviceRepo = this.dataSource.getRepository(Device);
		this.shopRepository = this.dataSource.getRepository(Shop);
		this.cartRepository = this.dataSource.getRepository(Cart);
	}

	async create(data: Partial<Device> & { tenant: string }): Promise<Device> {
		const shop = await this.shopRepository.findOneBy({ tenant: data.tenant });
		if (!shop) throw new NotFound("Shop not found");

		const cart = this.cartRepository.create();
		await this.cartRepository.save(cart);

		const device = this.deviceRepo.create({
			...data,
			shop,
			cart
		});

		return await this.deviceRepo.save(device);
	}

	async update(id: string, updates: Partial<Device>): Promise<Device> {
		const device = await this.deviceRepo.findOneBy({ id });
		if (!device) throw new NotFound("device not found");

		Object.assign(device, updates);
		await this.deviceRepo.save(device);
		return this.findById(id);
	}

	async findById(id: string): Promise<Device> {
		const device = await this.deviceRepo.findOne({
			where: { id },
			relations: { shop: true, cart: true }
		});
		if (!device) throw new NotFound("device not found");
		return device;
	}

	async findOrCreateByDeviceId(params: { deviceId: string; tenant: string }): Promise<Device> {
		let device = await this.deviceRepo.findOne({
			where: { deviceId: params.deviceId, shop: { tenant: params.tenant } },
			relations: { shop: true, cart: true }
		});
		if (!device) {
			device = await this.create(params);
		}
		return device;
	}

	async findByDeviceId(deviceId: string): Promise<Device> {
		const device = await this.deviceRepo.findOne({
			where: { deviceId },
			relations: { shop: true, cart: true }
		});
		if (!device) throw new NotFound("device not found");
		return device;
	}

	async getCartById(id: string): Promise<Cart> {
		const device = await this.findById(id);
		if (!device.cart) throw new NotFound("Cart not found for this device");
		return device.cart;
	}

	async getCartByDeviceId(deviceId: string): Promise<Cart> {
		const device = await this.findByDeviceId(deviceId);
		if (!device.cart) throw new NotFound("Cart not found for this device");
		return device.cart;
	}

	async scan(params: { apiKey: string; epc: string; deviceId: string }): Promise<any> {
		const device = await this.findByDeviceId(params.deviceId);
		const tenant = device.shop.tenant;
		const cart = device.cart;
		const apiKey = params.apiKey;
		const epc = params.epc;
		const data = await this.epcService.decode({ epc, apiKey, tenant });
		const existingData = cart.data ?? {};
		const existingProducts = Array.isArray(existingData.products) ? existingData.products : [];

		cart.data = {
			products: [...existingProducts, data]
		};
		await cart.save();
		return cart;
	}

	async emptyCart(deviceId: string) {
		const device = await this.findByDeviceId(deviceId);
		let cart = device.cart;
		cart.data = null;
		await cart.save();
		return cart;
	}
}
