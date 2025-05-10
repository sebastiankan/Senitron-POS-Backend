import { Controller, Inject } from "@tsed/di";
import { BodyParams, HeaderParams, QueryParams } from "@tsed/platform-params";
import { Delete, Get, Head, Post, Put, Returns, Summary } from "@tsed/schema";
import { Cart } from "src/models/Cart.js";
import { Device } from "src/models/DeviceId.js";
import { DeviceService } from "src/Services/DeviceService.js";

@Controller("/devices")
export class DeviceController {
	@Inject() private deviceService: DeviceService;

	@Post("/")
	@Summary("Create a new Device and link to a shop and cart")
	@Returns(201, Device)
	async create(@BodyParams() data: Partial<Device> & { tenant: string }): Promise<Device> {
		return this.deviceService.create(data);
	}

	@Put("/")
	@Summary("Update an existing Device by ID")
	@Returns(200, Device)
	async update(@QueryParams("id") id: string, @BodyParams() updates: Partial<Device>): Promise<Device> {
		return this.deviceService.update(id, updates);
	}

	@Get("/")
	@Summary("Get Device by ID")
	@Returns(200, Device)
	async getById(@QueryParams("id") id: string): Promise<Device> {
		return this.deviceService.findById(id);
	}

	@Get("/by-device")
	@Summary("Get Device by deviceId")
	@Returns(200, Device)
	async getByStaffId(@QueryParams("deviceId") deviceId: string): Promise<Device> {
		return this.deviceService.findByDeviceId(deviceId);
	}

	@Get("/cart")
	@Summary("Get cart by Device ID")
	@Returns(200, Cart)
	async getCartById(@QueryParams("id") id: string): Promise<Cart> {
		return this.deviceService.getCartById(id);
	}

	@Get("/by-device/cart")
	@Summary("Get cart by deviceId")
	@Returns(200, Cart)
	async getCartByStaffId(@QueryParams("deviceId") deviceId: string): Promise<Cart> {
		return this.deviceService.getCartByDeviceId(deviceId);
	}

	@Get("/by-device/scan")
	@Summary("Import Scanned epc to cart by deviceId")
	@Returns(200, Cart)
	async scanByDevice(
		@HeaderParams("apiKey") apiKey: string,
		@QueryParams("deviceId") deviceId: string,
		@QueryParams("epc") epc: string
	): Promise<Cart> {
		return this.deviceService.scan({ epc, deviceId, apiKey });
	}

	@Delete("/by-device/scan")
	@Summary("Empty cart by deviceId")
	@Returns(200, Cart)
	async emptyBystaff(@QueryParams("deviceId") deviceId: string): Promise<Cart> {
		return this.deviceService.emptyCart(deviceId);
	}
}
