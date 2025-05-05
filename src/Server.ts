import "@tsed/platform-log-request"; // remove this import if you don&#x27;t want log request
import "@tsed/platform-express"; // /!\ keep this import
import "@tsed/ajv";
import "./config/DataSources/MysqlDatasource.js";

import { join } from "node:path";

import { Configuration } from "@tsed/di";
import { application } from "@tsed/platform-http";

import { MYSQL_DATA_SOURCE } from "./config/DataSources/MysqlDatasource.js";
import { config } from "./config/index.js";
import * as rest from "./controllers/rest/index.js";

@Configuration({
	...config,
	acceptMimes: ["application/json"],
	httpPort: process.env.PORT || 8081,
	httpsPort: false, // CHANGE
	imports: [MYSQL_DATA_SOURCE],
	mount: {
		"/rest": [...Object.values(rest)]
	},
	middlewares: [
		"cors",
		"cookie-parser",
		"compression",
		"method-override",
		"json-parser",
		{ use: "urlencoded-parser", options: { extended: true } }
	],
	views: {
		root: join(process.cwd(), "../views"),
		extensions: {
			ejs: "ejs"
		}
	}
})
export class Server {
	protected app = application();
}
