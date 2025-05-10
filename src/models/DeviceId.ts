import type { Relation } from "typeorm";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import { Cart } from "./Cart.js";
import { Shop } from "./Shop.js";

@Entity()
export class Device extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "varchar", length: 50 })
	name: string;

	@Column({ type: "varchar", length: 16, unique: true })
	deviceId: string;

	@ManyToOne(() => Shop, (shop) => shop.devices, { onDelete: "CASCADE" })
	@JoinColumn()
	shop: Relation<Shop>;

	@OneToOne(() => Cart)
	@JoinColumn()
	cart: Cart;
}
// /farid/api/v1/epcs/decode?api_key=bf5088da266fedf0db5759&epc=C74A611C3C0630000000272E&item_details=true
