import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { UserTenantMapping } from "src/userTenantMapping/entities/user-tenant-mapping.entity";

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  ARCHIVED = "archived",
}

@Entity({ name: "Users" })
export class User {
  @PrimaryColumn({ type: "uuid" })
  userId: string;

  @Column({ unique: true })
  username: string;

  @Column()
  name: string;

  @Column({ type: "date", nullable: true })
  dob: Date;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  district: string;

  @Column({ nullable: true })
  state: string;


  @CreateDateColumn({
    type: "timestamp with time zone",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: "timestamp with time zone",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @Column({ nullable: true })
  mobile: number;

  @Column({ nullable: false, default: true })
  temporaryPassword: boolean

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @Column({
    type: "enum",
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  userRoleMappings: User;

  @OneToMany(
    () => UserTenantMapping,
    (userTenantMapping) => userTenantMapping.user
  )
  userTenantMapping: UserTenantMapping[];
}
