import { Injectable } from "@tsed/di";
import { Logger } from "@tsed/logger";
import dotenv from "dotenv";
import { DataSource } from "typeorm";

dotenv.config();

export const MYSQL_DATA_SOURCE = Symbol.for("MysqlDataSource");

@Injectable({
	provide: MYSQL_DATA_SOURCE,
	type: DataSource,
	useAsyncFactory: async (logger: Logger) => {
		await new Promise<void>((resolve) => setTimeout(resolve, 5000)); // Optional delay
		const baseDir = process.env.NODE_ENV === "production" ? "dist" : "src";

		const MysqlDataSource = new DataSource({
			type: "mysql",
			entities: process.env.NODE_ENV === "production" ? ["dist/models/*.js"] : ["src/models/*.ts"], // migrations: [`${baseDir}/migrations/**/*.{ts,js}`],
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
	deps: [Logger],
	hooks: {
		$onDestroy(dataSource: DataSource) {
			return dataSource.isInitialized && dataSource.close();
		}
	}
})
export class MysqlDatasourceProvider {}
