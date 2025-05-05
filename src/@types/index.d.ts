declare namespace NodeJS {
	export interface ProcessEnv {
		NODE_ENV: "test" | "production";
		PORT: string;
		MYSQL_DATABASE: string;
		MYSQL_USER: string;
		MYSQL_HOST: string;
		MYSQL_PORT: string;
		MYSQL_PASSWORD: string;
		SENITRON_API_BASE_URL: string;
	}
}
