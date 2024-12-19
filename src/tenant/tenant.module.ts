import { Module } from '@nestjs/common';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { Tenants } from 'src/tenant/entities/tenant.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cohort } from '../cohort/entities/cohort.entity';
import { UserTenantMapping } from 'src/userTenantMapping/entities/user-tenant-mapping.entity';
import { PostgresRoleService } from 'src/adapters/postgres/rbac/role-adapter';
import { PostgresModule } from 'src/adapters/postgres/postgres-module';
import { Role } from 'src/rbac/role/entities/role.entity';
import { UserRoleMapping } from 'src/rbac/assign-role/entities/assign-role.entity';
import { RolePrivilegeMapping } from 'src/rbac/assign-privilege/entities/assign-privilege.entity';
import { PostgresAssignPrivilegeService } from 'src/adapters/postgres/rbac/privilegerole.adapter';
@Module({
  imports: [
    TypeOrmModule.forFeature([Tenants,Cohort,UserTenantMapping,Role,UserRoleMapping,RolePrivilegeMapping]),
    PostgresModule
  ],
  controllers: [TenantController],
  providers: [TenantService,PostgresRoleService,PostgresAssignPrivilegeService]
})
export class TenantModule { }