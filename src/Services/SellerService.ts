import { Inject, Injectable } from "@tsed/di";
import { BadRequest, NotFound } from "@tsed/exceptions";
import { MYSQL_DATA_SOURCE } from "src/config/DataSources/MysqlDatasource.js";
import { Cart } from "src/models/Cart.js";
import { Seller } from "src/models/Seller.js";
import { Shop } from "src/models/Shop.js";
import { DataSource, Repository } from "typeorm";

import { EpcService } from "./EpcService.js";

@Injectable()
export class SellerService {
	@Inject(MYSQL_DATA_SOURCE)
	protected dataSource: DataSource;

	@Inject(EpcService)
	protected epcService: EpcService;

	sellerRepository: Repository<Seller>;
	shopRepository: Repository<Shop>;
	cartRepository: Repository<Cart>;

	async $onInit() {
		if (!this.dataSource) throw new Error("DataSource is undefined!");

		this.sellerRepository = this.dataSource.getRepository(Seller);
		this.shopRepository = this.dataSource.getRepository(Shop);
		this.cartRepository = this.dataSource.getRepository(Cart);
	}

	async create(data: Partial<Seller> & { locationId: string }): Promise<Seller> {
		const shop = await this.shopRepository.findOneBy({ locationId: data.locationId });
		if (!shop) throw new NotFound("Shop not found");

		const cart = this.cartRepository.create();
		await this.cartRepository.save(cart);

		const seller = this.sellerRepository.create({
			...data,
			shop,
			cart
		});

		return await this.sellerRepository.save(seller);
	}

	async update(id: string, updates: Partial<Seller>): Promise<Seller> {
		const seller = await this.sellerRepository.findOneBy({ id });
		if (!seller) throw new NotFound("Seller not found");

		Object.assign(seller, updates);
		await this.sellerRepository.save(seller);
		return this.findById(id);
	}

	async findById(id: string): Promise<Seller> {
		const seller = await this.sellerRepository.findOne({
			where: { id },
			relations: { shop: true, cart: true }
		});
		if (!seller) throw new NotFound("Seller not found");
		return seller;
	}

	async findByStaffMemberId(staffMemberId: string): Promise<Seller> {
		const seller = await this.sellerRepository.findOne({
			where: { staffMemberId },
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

	async getCartByStaffMemberId(staffMemberId: string): Promise<Cart> {
		const seller = await this.findByStaffMemberId(staffMemberId);
		if (!seller.cart) throw new NotFound("Cart not found for this seller");
		return seller.cart;
	}

	async scan(epc: string, staffMemberId: string): Promise<any> {
		const seller = await this.findByStaffMemberId(staffMemberId);
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

	async emptyCart(staffMemberId: string) {
		const seller = await this.findByStaffMemberId(staffMemberId);
		let cart = seller.cart;
		cart.data = null;
		await cart.save();
		return cart;
	}
}
