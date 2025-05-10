import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PairKey extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "varchar", length: 50, unique: true })
	posDeviceId: string;

	@Column({ type: "tinyint", unique: true })
	digits: number;
}
