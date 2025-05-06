// src/config/DataSources/MysqlDatasource.ts
import { registerProvider } from "@tsed/di";
import { Logger } from "@tsed/logger";
import dotenv from "dotenv";
import { DataSource } from "typeorm";

import * as entities from "../../models/index.js";

dotenv.config();

export const MYSQL_DATA_SOURCE = Symbol.for("MysqlDataSource");

registerProvider<DataSource>({
	provide: MYSQL_DATA_SOURCE,
	type: DataSource,
	deps: [Logger],
	async useAsyncFactory(logger: Logger) {
		const MysqlDataSource = new DataSource({
			type: "mysql",
			entities: entities,
			host: process.env.MYSQL_HOST!,
			port: Number.parseInt(process.env.MYSQL_PORT!),
			username: process.env.MYSQL_USER!,
			password: process.env.MYSQL_PASSWORD!,
			database: process.env.MYSQL_DATABASE!,
			synchronize: true,
			logger: "simple-console",
			logging: ["error"]
		});

		await MysqlDataSource.initialize();
		logger.info("Connected with TypeORM to database: MySQL");

		return MysqlDataSource;
	},
	hooks: {
		$onDestroy(dataSource) {
			return dataSource.isInitialized && dataSource.close();
		}
	}
});
