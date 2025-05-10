import { Inject, Injectable } from "@tsed/di";
import { NotFound } from "@tsed/exceptions";
import { MYSQL_DATA_SOURCE } from "src/config/DataSources/MysqlDatasource.js";
import { Shop } from "src/models/Shop.js";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class ShopService {
	@Inject(MYSQL_DATA_SOURCE)
	protected dataSource: DataSource;

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

	async update(id: string, updates: Partial<Shop>): Promise<Shop> {
		const shop = await this.shopRepository.findOneBy({ id });
		if (!shop) throw new Error("Shop not found");

		Object.assign(shop, updates);
		return await this.shopRepository.save(shop);
	}
}
