import { Expose, Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
export enum TenantStatus { Active = 'active', Archived = 'archived', Inactive = 'inactive', }
export class TenantCreateDto {
    

    @Expose()
    tenantId: string;

    @Expose()
    createdAt: string;

    @Expose()
    updatedAt: string;

    @Expose()
    createdBy: string;

    @Expose()
    updatedBy: string;

    //tenant name
    @ApiProperty({
        type: String,
        description: "Tenant name",
        default: "",
    })
    @IsString()
    @IsNotEmpty()
    @Expose()
    name: string;

    //domain
    @ApiPropertyOptional({
        type: String,
        description: "Domain Name",
        default: null,
    })
    @IsString()
    @IsOptional()
    @Expose()
    domain?: string | null;
    

    //status
    // @ApiProperty({
    //     type: String,
    //     description: "The status of Tenant",
    // })
    // @IsOptional()
    // @IsEnum(TenantStatus, { message: 'Status must be one of: active, archived, inactive', })
    // @Expose() 
    // status: TenantStatus;

    //params
    @ApiPropertyOptional({
        type: Object,
        description: "Params",
        default: "",
    })
    @Expose()
    params: object;

    constructor(obj?: Partial<TenantCreateDto>) {
        if (obj) {
            Object.assign(this, obj);
        }
    }
}