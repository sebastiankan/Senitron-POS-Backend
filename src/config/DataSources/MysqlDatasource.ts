// src/config/DataSources/MysqlDatasource.ts
import { registerProvider } from "@tsed/di";
import { Logger } from "@tsed/logger";
import dotenv from "dotenv";
import { dirname } from "path";
import path from "path";
import { DataSource } from "typeorm";
import { fileURLToPath } from "url";

dotenv.config();

export const MYSQL_DATA_SOURCE = Symbol.for("MysqlDataSource");

registerProvider<DataSource>({
	provide: MYSQL_DATA_SOURCE,
	type: DataSource,
	deps: [Logger],
	async useAsyncFactory(logger: Logger) {
		const __filename = fileURLToPath(import.meta.url);
		const __dirname = dirname(__filename);

		console.log("Entities path (resolved):", path.resolve(__dirname, "../../../dist/models/*.js"));

		const MysqlDataSource = new DataSource({
			type: "mysql",
			entities: [
				// 👇 This is what fixes your issue:
				path.resolve(__dirname, "../../../dist/models/*.js")
			],
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
