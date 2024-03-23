import { HttpStatus, Injectable } from "@nestjs/common";
import { CohortInterface } from "./interfaces/cohort.interface";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { ErrorResponse } from "src/error-response";
const resolvePath = require("object-resolve-path");
import jwt_decode from "jwt-decode";
import { CohortDto } from "src/cohort/dto/cohort.dto";
import { CohortSearchDto } from "src/cohort/dto/cohort-search.dto";
import { UserDto } from "src/user/dto/user.dto";
import { StudentDto } from "src/student/dto/student.dto";
import { CohortCreateDto } from "src/cohort/dto/cohort-create.dto";
import { FieldValuesDto } from "src/fields/dto/field-values.dto";
import { IsNull, Not, Repository, getConnection, getRepository } from "typeorm";
import { Cohort } from "src/cohort/entities/cohort.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { FieldsService } from "../fields/fields.service";
// import { FieldValues } from "src/fields/entities/field-values.entity";
import { response } from "express";
import APIResponse from "src/utils/response";
import { FieldValues } from "../fields/entities/fields-values.entity";

@Injectable()
export class CohortService {
  private cohort: CohortInterface;


  constructor(
    @InjectRepository(Cohort)
    private cohortRepository: Repository<Cohort>,
    private fieldsService: FieldsService
    // @InjectRepository(FieldValues)
    // private fieldsValuesRepository: Repository<FieldValues>,
    // private readonly fieldsService: FieldsService,
  ) { }

  public async getCohort(
    tenantId: string,
    cohortId: string,
    request: any,
    response: any
  ) {
    const apiId = "api.concept.editminiScreeningAnswer";

    try {
      const cohort = await this.cohortRepository.findOne({
        where: { tenantId: tenantId, cohortId: cohortId },
      });
      if (!cohort) {
        return response
          .status(HttpStatus.NOT_FOUND)
          .send(
            APIResponse.error(
              apiId,
              `Cohort Id is wrong`,
              `Cohort not found`,
              "COHORT_NOT_FOUND"
            )
          );
      }

      return response.status(HttpStatus.OK).send(
        APIResponse.success(
          apiId,
          cohort,
          "Cohort Retrieved Successfully"
        )
      );
    } catch (error) {
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(
          APIResponse.error(
            apiId,
            "Something went wrong",
            `Failure Retrieving Cohort. Error is: ${error}`,
            "INTERNAL_SERVER_ERROR"
          )
        );
    }
  }

  public async createCohort(request: any, cohortCreateDto: CohortCreateDto) {
    try {
      const cohortData: any = {};
      Object.keys(cohortCreateDto).forEach((e) => {
        if (cohortCreateDto[e] && cohortCreateDto[e] != "" && e != "fieldValues") {
          if (Array.isArray(cohortCreateDto[e])) {
            cohortData[e] = JSON.stringify(cohortCreateDto[e]);
          } else {
            cohortData[e] = cohortCreateDto[e];
          }
        }
      });

      const response = await this.cohortRepository.save(cohortData);

      let cohortId = response?.cohortId;

      let field_value_array = cohortCreateDto.fieldValues.split("|");

      if (field_value_array.length > 0) {
        let field_values = [];
        for (let i = 0; i < field_value_array.length; i++) {

          let fieldValues = field_value_array[i].split(":");
          let fieldValueDto: FieldValuesDto = {
            fieldValuesId: "", // Provide a value for fieldValuesId
            value: fieldValues[1] ? fieldValues[1].trim() : "",
            itemId: cohortId,
            fieldId: fieldValues[0] ? fieldValues[0].trim() : "",
            createdBy: cohortCreateDto?.createdBy,
            updatedBy: cohortCreateDto?.updatedBy,
            createdAt: new Date().toISOString(), // Provide appropriate values for createdAt and updatedAt
            updatedAt: new Date().toISOString(),
          };

          await this.fieldsService.createFieldValues(request, fieldValueDto);
        }
      }

      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        data: response,
      });

    } catch (e) {
      console.error(e);
      return new ErrorResponse({
        errorCode: "401",
        errorMessage: e,
      });
    }
  }

  public async updateCohort(
    cohortId: string,
    request: any,
    cohortUpdateDto: CohortCreateDto
  ) {
    try {
      const cohortUpdateData: any = {};

      Object.keys(cohortUpdateDto).forEach((e) => {
        if (cohortUpdateDto[e] && cohortUpdateDto[e] != "" && e != "fieldValues"
        ) {
          if (Array.isArray(cohortUpdateDto[e])) {
            cohortUpdateData[e] = JSON.stringify(cohortUpdateDto[e]);
          } else {
            cohortUpdateData[e] = cohortUpdateDto[e];
          }
        }
      });

      const response = await this.cohortRepository.update(cohortId, cohortUpdateData);
      console.log(response);


      let field_value_array = cohortUpdateDto.fieldValues.split("|");

      if (field_value_array.length > 0) {
        let field_values = [];
        for (let i = 0; i < field_value_array.length; i++) {

          let fieldValues = field_value_array[i].split(":");
          let fieldId = fieldValues[0] ? fieldValues[0].trim() : "";
          const fieldVauesRowId = await this.fieldsService.searchFieldValueId(cohortId, fieldId)
          const rowid = fieldVauesRowId.fieldValuesId;

          let fieldValueDto: FieldValuesDto = {
            fieldValuesId: rowid,
            value: fieldValues[1] ? fieldValues[1].trim() : "",
            itemId: cohortId,
            fieldId: fieldValues[0] ? fieldValues[0].trim() : "",
            createdBy: cohortUpdateDto?.createdBy,
            updatedBy: cohortUpdateDto?.updatedBy,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await this.fieldsService.updateFieldValues(rowid, fieldValueDto);
        }
      }

      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        data: {
          rowCount: response.affected,
        }
      });
    } catch (e) {
      console.error(e);
      return new ErrorResponse({
        errorCode: "401",
        errorMessage: e,
      });
    }
  }

  public async searchCohort(
    tenantId: string,
    request: any,
    cohortSearchDto: CohortSearchDto,
  ) {
    try {

      let { limit, page, filters } = cohortSearchDto;

      let offset = 0;
      if (page > 1) {
        offset = parseInt(limit) * (page - 1);
      }

      if (limit.trim() === '') {
        limit = '0';
      }

      const whereClause = {};
      if (filters && Object.keys(filters).length > 0) {
        Object.entries(filters).forEach(([key, value]) => {
          whereClause[key] = value;
        });
      }
      else {
        whereClause['tenantId'] = tenantId;
      }

      const [results, totalCount] = await this.cohortRepository.findAndCount({
        where: whereClause,
        skip: offset,
      });

      const mappedResponse = await this.mappedResponse(results);

      return new SuccessResponse({
          statusCode: 200,
          message: 'Ok.',
          totalCount,
          data: mappedResponse,
      });

    } catch (e) {
      console.error(e);
      return new ErrorResponse({
        errorCode: "401",
        errorMessage: e,
      });
    }
  }

  public async mappedResponse(result: any) {
    const cohortValueResponse = result.map((item: any) => {
      const cohortMapping = {
        tenantId: item?.tenantId ? `${item.tenantId}` : "",
        programId: item?.programId ? `${item.programId}` : "",
        cohortId: item?.cohortId ? `${item.cohortId}` : "",
        parentId: item?.parentId ? `${item.parentId}` : "",
        name: item?.name ? `${item.name}` : "",
        type: item?.type ? `${item.type}` : "",
        status: item?.status ? `${item.status}` : "",
        image: item?.image ? `${item.image}` : "",
        createdAt: item?.createdAt ? `${item.createdAt}` : "",
        updatedAt: item?.updatedAt ? `${item.updatedAt}` : "",
        createdBy: item?.createdBy ? `${item.createdBy}` : "",
        updatedBy: item?.updatedBy ? `${item.updatedBy}` : "",
        referenceId: item?.referenceId ? `${item.referenceId}` : "",
        metadata: item?.metadata ? `${item.metadata}` : "",
      };
      return new CohortDto(cohortMapping);
    })
    return cohortValueResponse;
    
  }
}
