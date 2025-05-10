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

		const seller = this.deviceRepo.create({
			...data,
			shop,
			cart
		});

		return await this.deviceRepo.save(seller);
	}

	async update(id: string, updates: Partial<Device>): Promise<Device> {
		const seller = await this.deviceRepo.findOneBy({ id });
		if (!seller) throw new NotFound("Seller not found");

		Object.assign(seller, updates);
		await this.deviceRepo.save(seller);
		return this.findById(id);
	}

	async findById(id: string): Promise<Device> {
		const seller = await this.deviceRepo.findOne({
			where: { id },
			relations: { shop: true, cart: true }
		});
		if (!seller) throw new NotFound("Seller not found");
		return seller;
	}

	async findByDeviceId(deviceId: string): Promise<Device> {
		const seller = await this.deviceRepo.findOne({
			where: { deviceId },
			relations: { shop: true, cart: true }
		});
		if (!seller) throw new NotFound("Seller not found");
		return seller;
	}

	async getCartById(id: string): Promise<Cart> {
		const seller = await this.findById(id);
		if (!seller.cart) throw new NotFound("Cart not found for this seller");
		return seller.cart;
	}

	async getCartByDeviceId(deviceId: string): Promise<Cart> {
		const device = await this.findByDeviceId(deviceId);
		if (!device.cart) throw new NotFound("Cart not found for this seller");
		return device.cart;
	}

	async scan(epc: string, deviceId: string): Promise<any> {
		const seller = await this.findByDeviceId(deviceId);
		const tenant = seller.shop.tenant;
		const cart = seller.cart;
		const data = await this.epcService.decode({ epc, tenant });
		const existingData = cart.data ?? {};
		const existingProducts = Array.isArray(existingData.products) ? existingData.products : [];

		cart.data = {
			products: [...existingProducts, data]
		};
		await cart.save();
		return cart;
	}

	async emptyCart(deviceId: string) {
		const seller = await this.findByDeviceId(deviceId);
		let cart = seller.cart;
		cart.data = null;
		await cart.save();
		return cart;
	}
}
