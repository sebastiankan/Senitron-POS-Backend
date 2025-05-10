import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { Device } from "./DeviceId.js";

@Entity()
export class Shop extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "varchar", length: 50, unique: true })
	tenant: string;

	@OneToMany(() => Device, (device) => device.shop, { cascade: true, onDelete: "CASCADE" })
	devices: Device[];
}
