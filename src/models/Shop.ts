import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { Seller } from "./Seller.js";

@Entity()
export class Shop extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "varchar", length: 50 })
	name: string;

	@Column({ type: "varchar", length: 15, unique: true })
	locationId: string;

	@Column({ type: "varchar", length: 50, unique: true })
	tenant: string;

	@Column({ type: "varchar", length: 32 })
	apiKey: string;

	@OneToMany(() => Seller, (seller) => seller.shop, { cascade: true, onDelete: "CASCADE" })
	sellers: Seller[];
}
