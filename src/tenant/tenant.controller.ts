import { Body, Controller, Delete, Get, Patch, Post, Query, Req, Res, SerializeOptions, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { ApiBadRequestResponse, ApiBasicAuth, ApiBody, ApiCreatedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { TenantCreateDto } from './dto/tenant-create.dto';
import { TenantUpdateDto } from './dto/tenant-update.dto';
import { Request,Response } from "express";
import { JwtAuthGuard } from "src/common/guards/keycloak.guard";
@Controller('tenant')
@UseGuards(JwtAuthGuard)
export class TenantController {
    constructor(
        private tenantService: TenantService,
    ) { }
    //Get tenant information
    @Get("/read")
    @ApiBasicAuth("access-token")
    @UsePipes(new ValidationPipe())
    @ApiCreatedResponse({ description: "Tenant Data Fetch" })
    @ApiForbiddenResponse({ description: "Forbidden" })
    @SerializeOptions({
        strategy: "excludeAll",
    })
    public async getTenants(
        @Req() request: Request,
        @Res() response: Response
    ) {
        return await this.tenantService.getTenants(request, response);
    }

    //Create a new tenant
    @Post("/create")
    @ApiBody({type :TenantCreateDto})
    @UsePipes(new ValidationPipe({ transform: true }))
    @ApiCreatedResponse({ description: "Tenant Created Successfully" })
    @ApiForbiddenResponse({ description: "Forbidden" })
    @ApiBadRequestResponse({ description: "Bad request." })
    @SerializeOptions({
        strategy: "excludeAll",
    })
    public async createTenants(
        @Req() request: Request,
        @Res() response: Response,
        @Body() tenantCreateDto: TenantCreateDto,
        @Query("userId") userId: string | null = null
    ) {
        tenantCreateDto.createdBy = userId;
        return await this.tenantService.createTenants(request, tenantCreateDto, response);
    }

    //Delete a tenant
    @Delete("/delete")
    @ApiCreatedResponse({ description: "Tenant Data Fetch" })
    @ApiForbiddenResponse({ description: "Forbidden" })
    @SerializeOptions({
        strategy: "excludeAll",
    })
    public async deleteTenants(
        @Req() request: Request,
        @Res() response: Response,
        @Query("id") id: string
    ) {
        const tenantId = id;
        return await this.tenantService.deleteTenants(request, tenantId, response);
    }


    //Update a tenant
    @Patch("/update")
    @ApiBody({ type: TenantUpdateDto })
    @UsePipes(new ValidationPipe({ transform: true }))
    @ApiCreatedResponse({ description: "Tenant Data Fetch" })
    @ApiForbiddenResponse({ description: "Forbidden" })
    @SerializeOptions({
        strategy: "excludeAll",
    })
    public async updateTenants(
        @Req() request: Request,
        @Res() response: Response,
        @Body() tenantUpdateDto: TenantUpdateDto,
        @Query("id") id: string,
        @Query("userId") userId: string | null = null
    ) {
        const tenantId = id;
        tenantUpdateDto.updatedBy = userId;
        return await this.tenantService.updateTenants(request, tenantId, response,tenantUpdateDto);
    }
}