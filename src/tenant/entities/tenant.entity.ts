import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity({ name: "Tenants" })
export class Tenants {
    @PrimaryGeneratedColumn("uuid")
    tenantId: string;

    @Column({ type: 'text'})
    name: string;

    @Column({ type: 'text', nullable: true })
    domain: string | null;    

    @Column({
        type: 'text',
        default: 'active',
        enum: ['active', 'inactive', 'archive'],
    })
    status: 'active' | 'inactive' | 'archive';

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

    @Column({ type: 'jsonb', nullable: true })
    params: Record<string, any>;

    @Column({ type: 'uuid', nullable: true })
    createdBy: string | null;
    @Column({ type: 'uuid', nullable: true })
    updatedBy: string | null;
}