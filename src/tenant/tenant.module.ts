import { Module } from '@nestjs/common';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { Tenants } from 'src/tenant/entities/tenant.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cohort } from '../cohort/entities/cohort.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Tenants,Cohort])
  ],
  controllers: [TenantController],
  providers: [TenantService]
})
export class TenantModule { }