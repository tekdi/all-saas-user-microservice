import { HttpStatus, Injectable } from '@nestjs/common';
import { Tenants } from './entities/tenant.entity';
import { Cohort } from '../cohort/entities/cohort.entity';
import { In, Repository } from 'typeorm';
import APIResponse from "src/common/responses/response";
import { InjectRepository } from '@nestjs/typeorm';
import { API_RESPONSES } from '@utils/response.messages';
import { APIID } from '@utils/api-id.config';
import jwt_decode from "jwt-decode";
import { UserTenantMapping } from 'src/userTenantMapping/entities/user-tenant-mapping.entity';
import { RolesAndPrivilegesConfig } from '@utils/rolesAndPrivilegesConfig';
import { PostgresRoleService } from 'src/adapters/postgres/rbac/role-adapter';
import { request, response } from 'express';
import { CreateRolesDto } from 'src/rbac/role/dto/role.dto';
import { PostgresAssignPrivilegeService } from 'src/adapters/postgres/rbac/privilegerole.adapter';
import { CreatePrivilegeRoleDto } from 'src/rbac/assign-privilege/dto/create-assign-privilege.dto';
import { UserRoleMapping } from 'src/rbac/assign-role/entities/assign-role.entity';
@Injectable()
export class TenantService {
    constructor(
        @InjectRepository(Cohort)
        private cohortRepository: Repository<Cohort>,
        @InjectRepository(Tenants)
        private tenantRepository: Repository<Tenants>,
        @InjectRepository(UserTenantMapping)
        private UserTenantMappingRepository: Repository<UserTenantMapping>,
        @InjectRepository(UserRoleMapping)
        private UserRoleMappingRepository : Repository<UserRoleMapping>,
        private roleService:PostgresRoleService,
        private rolePrivilegeService : PostgresAssignPrivilegeService,
    ) { }

    public async getTenants(request, response) {
        let apiId = APIID.TENANT_LIST;
        const authToken = request.headers["authorization"];
        const token = authToken.split(" ")[1];
        const decoded = jwt_decode(token);
        const userId = decoded["sub"];
    
        try {
            let result: any[] = [];
  
            // Check for Super Admin role
            const isSuperAdmin = await this.roleService.isSuperAdmin(userId);
    
            if (isSuperAdmin) {
                // Fetch all active tenants for Super Admin
                result = await this.tenantRepository.find({
                    where: { status: 'active' },
                });
            } else {
                // Fetch tenant IDs for the current user
                const userTenants = await this.UserTenantMappingRepository.find({
                    where: { userId },
                });
    
                const tenantIds = userTenants.map((ut) => ut.tenantId);
    
                if (!tenantIds.length) {
                    return APIResponse.error(
                        response,
                        apiId,
                        API_RESPONSES.NOT_FOUND,
                        "No tenants mapped to the user.",
                        HttpStatus.NOT_FOUND
                    );
                }
    
                result = await this.tenantRepository.find({
                    where: {
                        tenantId: In(tenantIds),
                        status: 'active',
                    },
                });
            }
    
            if (result.length === 0) {
                return APIResponse.error(
                    response,
                    apiId,
                    API_RESPONSES.NOT_FOUND,
                    API_RESPONSES.TENANT_NOT_FOUND,
                    HttpStatus.NOT_FOUND
                );
            }
    
            // Step 3: Attach roles to each tenant
            for (let tenantData of result) {
                const tenantRoles = await this.tenantRepository.query(
                    `SELECT * FROM public."Roles" WHERE "tenantId" = $1`,
                    [tenantData.tenantId]
                );
    
                tenantData['role'] = tenantRoles.map((roleData) => ({
                    roleId: roleData.roleId,
                    name: roleData.name,
                    code: roleData.code
                }));
            }
    
            return APIResponse.success(
                response,
                apiId,
                result,
                HttpStatus.OK,
                API_RESPONSES.TENANT_GET
            );
        } catch (error) {
            const errorMessage = error.message || API_RESPONSES.INTERNAL_SERVER_ERROR;
            return APIResponse.error(
                response,
                apiId,
                API_RESPONSES.INTERNAL_SERVER_ERROR,
                errorMessage,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // private async isSuperAdmin(roleIds: string[]): Promise<boolean> {
    //     if (!roleIds.length) return false;
    
    //     const result = await this.tenantRepository.query(
    //         `SELECT * FROM public."Roles" WHERE "roleId" = ANY($1) AND "code" = 'super_admin'`,
    //         [roleIds]
    //     );
    
    //     return result.length > 0;
    // }
    

    public async createTenants(request, tenantCreateDto, response) {
        let apiId = APIID.TENANT_CREATE;
        // tenantCreateDto.status=tenantCreateDto.status || 'active'
        try {
            let checkExitTenants = await this.tenantRepository.find({
                where: {
                    "name": tenantCreateDto?.name
                }
            }
            )
            if (checkExitTenants.length > 0) {
                return APIResponse.error(
                    response,
                    apiId,
                    API_RESPONSES.CONFLICT,
                    API_RESPONSES.TENANT_EXISTS,
                    HttpStatus.CONFLICT
                );
            }
            let result = await this.tenantRepository.save(tenantCreateDto);
            if(result) {
                await this.createRolesAndAssignPrivileges(result.tenantId)

            }
            return APIResponse.success(
                response,
                apiId,
                result,
                HttpStatus.CREATED,
                API_RESPONSES.TENANT_CREATE
            );
        } catch (error) {
            const errorMessage = error.message || API_RESPONSES.INTERNAL_SERVER_ERROR;
            return APIResponse.error(
                response,
                apiId,
                API_RESPONSES.INTERNAL_SERVER_ERROR,
                errorMessage,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    public async deleteTenants(request, tenantId, response) {
        let apiId = APIID.TENANT_DELETE;
        try {
            let checkExitTenants = await this.tenantRepository.find({
                where: {
                    "tenantId": tenantId
                }
            }
            )
            if (checkExitTenants.length === 0) {
                return APIResponse.error(
                    response,
                    apiId,
                    API_RESPONSES.CONFLICT,
                    API_RESPONSES.TENANT_NOT_FOUND,
                    HttpStatus.CONFLICT
                );
            }
            let cohorts = await this.cohortRepository.find({
                where: { "tenantId":tenantId, },
            });
            let cohortsArchived = await this.cohortRepository.find({
                where: { "tenantId":tenantId,"status":"active" },
            });
            if(cohortsArchived.length>0) {
                return APIResponse.error(
                    response,
                    apiId,
                    API_RESPONSES.CONFLICT,
                    API_RESPONSES.TENANT_COHORT_EXISTS,
                    HttpStatus.CONFLICT
                );
            }

            // let result = await this.tenantRepository.delete(tenantId);
            if(checkExitTenants.length>0) {
                let query = `UPDATE public."Tenants"
                SET "status" = 'archived'
                WHERE "tenantId" = $1`;
                const affectedrows = await this.cohortRepository.query(query, [
                tenantId,
                ]);
                return APIResponse.success(
                    response,
                    apiId,
                    affectedrows[1],
                    HttpStatus.OK,
                    API_RESPONSES.TENANT_DELETE,
                );
            }    
        } catch (error) {
            const errorMessage = error.message || API_RESPONSES.INTERNAL_SERVER_ERROR;
            return APIResponse.error(
                response,
                apiId,
                API_RESPONSES.INTERNAL_SERVER_ERROR,
                errorMessage,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    public async updateTenants(request, tenantId, response,tenantUpdateDto) {
        let apiId = APIID.TENANT_UPDATE;
        try {
            // if (tenantUpdateDto.tenantId && tenantUpdateDto.tenantId !== tenantId) {
            //     return APIResponse.error(
            //         response,
            //         apiId,
            //         API_RESPONSES.CONFLICT,
            //         API_RESPONSES.TENANTID_CANNOT_BE_CHANGED,
            //         HttpStatus.CONFLICT
            //     );
            // }
            let checkExitTenants = await this.tenantRepository.find({
                where: {
                    "tenantId": tenantId
                }
            }
            )
            if (checkExitTenants.length === 0) {
                return APIResponse.error(
                    response,
                    apiId,
                    API_RESPONSES.CONFLICT,
                    API_RESPONSES.TENANT_NOT_FOUND,
                    HttpStatus.CONFLICT
                );
            }

            let result = await this.tenantRepository.update(
                tenantId,
                tenantUpdateDto
            );
            return APIResponse.success(
                response,
                apiId,
                result,
                HttpStatus.OK,
                API_RESPONSES.TENANT_UPDATE
            );
        } catch (error) {
            const errorMessage = error.message || API_RESPONSES.INTERNAL_SERVER_ERROR;
            return APIResponse.error(
                response,
                apiId,
                API_RESPONSES.INTERNAL_SERVER_ERROR,
                errorMessage,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }

    }

    public async createRolesAndAssignPrivileges(tenantId: string) {
        try {
            // Step 1: Create Roles
            const rolesToCreate = RolesAndPrivilegesConfig.ROLES.map(role => ({ title: role.title }));
    
            const roleCreateRequest = {
                tenantId: tenantId,
                roles: rolesToCreate
            };
            const createRolesDto = new CreateRolesDto(roleCreateRequest);
    
            // Call API to create roles
            const rolesResult = await this.roleService.createRole( roleCreateRequest,createRolesDto,response);
    
            if (!rolesResult.roles) {
                throw new Error("Failed to create roles");
            }
    
            // Step 2: Map Privileges to Roles
            for (const createdRole of rolesResult.roles) {
                if(createdRole.code == 'learner') continue;
                const roleCode = createdRole.code;
                const roleId = createdRole.roleId;
    
                // Get privileges for the current role
                const privilegeIds = RolesAndPrivilegesConfig.PRIVILEGES[roleCode] || [];
    
                if (privilegeIds.length > 0) {
                    const privilegeMappingRequest = {
                        roleId: roleId,
                        privilegeId: privilegeIds,
                        deleteOld: false,
                        tenantId: tenantId
                    };
                    const createPrivilegeRoleDto = new CreatePrivilegeRoleDto(privilegeMappingRequest)    
                    // Call to map privileges to the role
                    await this.rolePrivilegeService.createPrivilegeRole(request as any, createPrivilegeRoleDto, response as any);
                } else {
                    console.warn(`No privileges found for role "${roleCode}".`);
                }
            }
        } catch (error) {
            console.error("Error while creating roles and assigning privileges:", error.message);
            throw error;
        }
    }
}