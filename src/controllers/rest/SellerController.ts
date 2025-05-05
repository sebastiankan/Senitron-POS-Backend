import { Controller, Inject } from "@tsed/di";
import { BodyParams, PathParams, QueryParams } from "@tsed/platform-params";
import { Delete, Get, Post, Put, Returns, Summary } from "@tsed/schema";
import { Cart } from "src/models/Cart.js";
import { Seller } from "src/models/Seller.js";
import { SellerService } from "src/Services/SellerService.js";

@Controller("/sellers")
export class SellerController {
	@Inject() private sellerService: SellerService;

	@Post("/")
	@Summary("Create a new seller and link to a shop and cart")
	@Returns(201, Seller)
	async create(@BodyParams() data: Partial<Seller> & { locationId: string }): Promise<Seller> {
		return this.sellerService.create(data);
	}

	@Put("/")
	@Summary("Update an existing seller by ID")
	@Returns(200, Seller)
	async update(@QueryParams("id") id: string, @BodyParams() updates: Partial<Seller>): Promise<Seller> {
		return this.sellerService.update(id, updates);
	}

	@Get("/")
	@Summary("Get seller by ID")
	@Returns(200, Seller)
	async getById(@QueryParams("id") id: string): Promise<Seller> {
		return this.sellerService.findById(id);
	}

	@Get("/by-staff")
	@Summary("Get seller by staffMemberId")
	@Returns(200, Seller)
	async getByStaffId(@QueryParams("staffMemberId") staffMemberId: string): Promise<Seller> {
		return this.sellerService.findByStaffMemberId(staffMemberId);
	}

	@Get("/cart")
	@Summary("Get cart by seller ID")
	@Returns(200, Cart)
	async getCartById(@QueryParams("id") id: string): Promise<Cart> {
		return this.sellerService.getCartById(id);
	}

	@Get("/by-staff/cart")
	@Summary("Get cart by staffMemberId")
	@Returns(200, Cart)
	async getCartByStaffId(@QueryParams("staffMemberId") staffMemberId: string): Promise<Cart> {
		return this.sellerService.getCartByStaffMemberId(staffMemberId);
	}

	@Get("/by-staff/scan")
	@Summary("Import Scanned epc to cart by staffMemberId")
	@Returns(200, Cart)
	async scanBystaff(@QueryParams("staffMemberId") staffMemberId: string, @QueryParams("epc") epc: string): Promise<Cart> {
		return this.sellerService.scan(epc, staffMemberId);
	}

	@Delete("/by-staff/scan")
	@Summary("Empty cart by staffMemberId")
	@Returns(200, Cart)
	async emptyBystaff(@QueryParams("staffMemberId") staffMemberId: string): Promise<Cart> {
		return this.sellerService.emptyCart(staffMemberId);
	}
}
