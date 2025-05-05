import { Controller, Inject } from "@tsed/di";
import { QueryParams } from "@tsed/platform-params";
import { Get, Returns, string } from "@tsed/schema";
import { EpcService as EpcService } from "src/Services/EpcService.js";

@Controller("/epc")
export class EpcController {
	@Inject() protected epcService: EpcService;

	@Get("/decode")
	@(Returns(200).ContentType("application/json"))
	async decodeEpc(@QueryParams() params: Map<string, string>) {
		return await this.epcService.decode({
			tenant: params.get("tenant")!,
			epc: params.get("epc")!
		});
	}
}
