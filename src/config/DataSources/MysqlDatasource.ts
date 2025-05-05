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
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const entitiesPath = path.resolve(__dirname, "../../models/*.js");

console.log("Entities path (resolved):", entitiesPath);

registerProvider<DataSource>({
	provide: MYSQL_DATA_SOURCE,
	type: DataSource,
	deps: [Logger],
	async useAsyncFactory(logger: Logger) {
		console.log("MysqlDatasourceProvider factory is running");
		console.log("Entities paths =====>>>> ", [entitiesPath]);
		const MysqlDataSource = new DataSource({
			type: "mysql",
			entities: [`${__dirname}/../../models/*.js`],
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
