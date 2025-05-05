// src/config/DataSources/MysqlDatasource.ts
import { registerProvider } from "@tsed/di";
import { Logger } from "@tsed/logger";
import dotenv from "dotenv";
import glob from "fast-glob";
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
		const __dirname = path.dirname(fileURLToPath(import.meta.url));
		const files = await glob(path.resolve(__dirname, "../../dist/models/*.js"));
		const entities = (
			await Promise.all(
				files.map(async (file) => {
					const module = await import(file);
					return Object.values(module).find((exp) => typeof exp === "function");
				})
			)
		).filter((e): e is Function => typeof e === "function");

		console.log("=============================");
		console.log("Entities", entities);
		console.log("=============================");

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
