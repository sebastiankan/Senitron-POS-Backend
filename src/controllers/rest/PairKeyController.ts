import { Controller, Inject } from "@tsed/di";
import { BadRequest } from "@tsed/exceptions";
import { BodyParams, QueryParams } from "@tsed/platform-params";
import { Get, Post } from "@tsed/schema";
import { PairKey } from "src/models/PairKey.js";
import { PairKeyService } from "src/Services/PairKeyService.js";

@Controller("/pair-keys")
export class PairKeyController {
	@Inject() private pairKeyService: PairKeyService;

	@Post("/generate")
	async generate(@BodyParams("posDeviceId") posDeviceId: string): Promise<PairKey> {
		throw new BadRequest("Test error");
		return await this.pairKeyService.generate(posDeviceId);
	}

	@Get("/by-device")
	async getByPosDeviceId(@QueryParams("posDeviceId") posDeviceId: string): Promise<PairKey | null> {
		return await this.pairKeyService.findByPosDeviceId(posDeviceId);
	}

	@Get("/device-digits")
	async getPosDeviceId(@QueryParams("digits") digits: number): Promise<string | undefined> {
		return await this.pairKeyService.getPosDeviceIdByDigits(digits);
	}
}
