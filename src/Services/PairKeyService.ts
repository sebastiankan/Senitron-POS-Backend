import { Inject, Injectable } from "@tsed/di";
import { MYSQL_DATA_SOURCE } from "src/config/DataSources/MysqlDatasource.js";
import { PairKey } from "src/models/PairKey.js";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class PairKeyService {
	@Inject(MYSQL_DATA_SOURCE)
	protected dataSource: DataSource;

	pairKeyrepo: Repository<PairKey>;

	async $onInit() {
		if (!this.dataSource) throw new Error("DataSource is undefined!");
		this.pairKeyrepo = this.dataSource.getRepository(PairKey);
	}

	/**
	 * Generates a unique pair key for a given POS device ID.
	 *
	 * This method first checks if a pair key already exists for the provided
	 * POS device ID. If it exists, the existing pair key is returned. If not,
	 * it generates a new 6-digit unique number that does not conflict with
	 * any existing pair keys in the repository. The new pair key is then
	 * saved and returned.
	 *
	 * @param posDeviceId - The unique identifier of the POS device for which the pair key is generated.
	 * @returns A promise that resolves to the generated or existing `PairKey` object.
	 * @throws An error if saving the new pair key to the repository fails.
	 */
	async generate(posDeviceId: string) {
		let pairKey = await this.findByPosDeviceId(posDeviceId);
		if (pairKey) return pairKey;

		let number;
		do {
			number = Math.floor(100000 + Math.random() * 900000);
		} while (await this.pairKeyrepo.findOne({ where: { digits: number } }));

		pairKey = new PairKey();
		pairKey.posDeviceId = posDeviceId;
		pairKey.digits = number;
		return await this.pairKeyrepo.save(pairKey);
	}

	async findByPosDeviceId(posDeviceId: string) {
		const pairKey = await this.pairKeyrepo.findOne({
			where: { posDeviceId }
		});
		return pairKey;
	}

	async getPosDeviceIdByDigits(digits: number) {
		const pairKey = await this.pairKeyrepo.findOne({
			where: { digits }
		});
		return pairKey?.posDeviceId;
	}
}
