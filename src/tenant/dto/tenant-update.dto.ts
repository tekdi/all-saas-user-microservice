import { Expose, Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
export enum TenantStatus { Active = 'active', Inactive = 'inactive', }
export class TenantUpdateDto {
    

    @Expose()
    tenantId: string;

    @Expose()
    createdAt: string;

    @Expose()
    updatedAt: string;

    //tenant name
    @ApiProperty({
        type: String,
        description: "Tenant name",
        default: "",
    })
    // @IsString()
    @Expose()
    name: string;

    //domain
    @ApiPropertyOptional({
        type: String,
        description: "Domain Name",
        default: "",
    })
    // @IsString()
    @Expose()
    domain: string;

    //status
    @ApiProperty({
        type: String,
        description: "The status of Tenant",
    })
    @IsOptional()
    @IsEnum(TenantStatus, { message: 'Status must be one of: active, inactive', })
    @Expose() 
    status: TenantStatus;

    //params
    @ApiPropertyOptional({
        type: Object,
        description: "Params",
        default: "",
    })
    @Expose()
    params: object;

    constructor(obj?: Partial<TenantUpdateDto>) {
        if (obj) {
            Object.assign(this, obj);
        }
    }
}