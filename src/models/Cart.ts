import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

import { ScanMode } from "../enums/ScanMode.js";

@Entity()
export class Cart extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "enum", enum: ScanMode, default: ScanMode.ADD })
	mode: ScanMode;

	@Column({ type: "json", nullable: true })
	data: any;
}
