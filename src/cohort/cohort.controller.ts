import {
  ApiTags,
  ApiBody,
  ApiCreatedResponse,
  ApiBasicAuth,
  ApiConsumes,
  ApiHeader,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiQuery,
} from "@nestjs/swagger";
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  UseInterceptors,
  SerializeOptions,
  Req,
  UploadedFile,
  Res,
  Headers,
  Delete,
  UseGuards,
  ValidationPipe,
  UsePipes,
  BadRequestException,
  UseFilters,
  ParseUUIDPipe,
  Query,
} from "@nestjs/common";
import { CohortSearchDto } from "./dto/cohort-search.dto";
import { Request } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { editFileName, imageFileFilter } from "./utils/file-upload.utils";
import { diskStorage } from "multer";
import { Response } from "express";
import { CohortAdapter } from "./cohortadapter";
import { CohortCreateDto } from "./dto/cohort-create.dto";
import { CohortUpdateDto } from "./dto/cohort-update.dto";
import { JwtAuthGuard } from "src/common/guards/keycloak.guard";
import { AllExceptionsFilter } from "src/common/filters/exception.filter";
import { APIID } from "src/common/utils/api-id.config";
import { CustomFieldsValidation } from "@utils/custom-field-validation";
import { isUUID } from "class-validator";
import { API_RESPONSES } from "@utils/response.messages";

@ApiTags("Cohort")
@Controller("cohort")
@UseGuards(JwtAuthGuard)
export class CohortController {
  constructor(private readonly cohortAdapter: CohortAdapter) { }

  @UseFilters(new AllExceptionsFilter(APIID.COHORT_READ))
  @Get("/cohortHierarchy/:cohortId")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "Cohort details Fetched Successfully" })
  @ApiNotFoundResponse({ description: "Cohort Not Found" })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error." })
  @ApiBadRequestResponse({ description: "Bad Request" })
  @SerializeOptions({ strategy: "excludeAll", })
  @ApiHeader({ name: "tenantid", })
  // @ApiHeader({
  //   name: "academicyearid",
  // })
  @ApiQuery({ name: "children", required: false, type: Boolean })
  @ApiQuery({ name: "customField", required: false, type: Boolean })
  public async getCohortsDetails(
    @Headers() headers,
    @Param("cohortId") cohortId: string,
    @Req() request: Request,
    @Res() response: Response,
    @Query("children") children: string,
    @Query("customField") customField: string
  ) {
    let tenantId = headers["tenantid"];
    let academicYearId = headers["academicyearid"];
    if (!tenantId || !isUUID(tenantId)) {
      throw new BadRequestException(API_RESPONSES.TENANTID_VALIDATION);
    }
    // if (!academicYearId || !isUUID(academicYearId)) {
    //   throw new BadRequestException(API_RESPONSES.ACADEMICYEARID_VALIDATION);
    // }
    const getChildDataValueBoolean = children === 'true';
    let fieldValueBooelan = customField === 'true'
    let requiredData = {
      cohortId: cohortId,
      // academicYearId: academicYearId,
      getChildData: getChildDataValueBoolean,
      customField: fieldValueBooelan
    }
    return await this.cohortAdapter.buildCohortAdapter().getCohortsDetails(requiredData, response);
  }

  @UseFilters(new AllExceptionsFilter(APIID.COHORT_CREATE))
  @Post("/create")
  // @ApiConsumes("multipart/form-data")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Cohort has been created successfully." })
  @ApiBadRequestResponse({ description: "Bad request." })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error." })
  @ApiConflictResponse({ description: "Cohort already exists." })

  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: process.env.IMAGEPATH,
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    })
  )
  @UsePipes(new ValidationPipe())
  @ApiBody({ type: CohortCreateDto })
  @ApiHeader({
    name: "tenantid",
  })
  // @ApiHeader({
  //   name: "academicyearid",
  // })
  public async createCohort(
    @Headers() headers,
    @Req() request: Request,
    @Body() cohortCreateDto: CohortCreateDto,
    @UploadedFile() image,
    @Res() response: Response
  ) {
    let tenantId = headers["tenantid"];
    // let academicYearId = headers["academicyearid"];
    if (!cohortCreateDto.tenantId || !isUUID(cohortCreateDto.tenantId)) {
      throw new BadRequestException(API_RESPONSES.TENANTID_VALIDATION);
    }
    if (!tenantId || !isUUID(tenantId)) {
      throw new BadRequestException(API_RESPONSES.TENANTID_VALIDATION);
    }
    // if (!academicYearId || !isUUID(academicYearId)) {
    //   throw new BadRequestException(API_RESPONSES.ACADEMICYEARID_VALIDATION);
    // }
    // cohortCreateDto.academicYearId = academicYearId;
    // cohortCreateDto.tenantId = tenantId;
    return await this.cohortAdapter.buildCohortAdapter().createCohort(
      request,
      cohortCreateDto,
      response
    );
  }


  @UseFilters(new AllExceptionsFilter(APIID.COHORT_LIST))
  @Post("/search")
  @ApiBasicAuth("access-token")
  // @ApiBody({ type: CohortSearchDto })
  @ApiOkResponse({ description: "Cohort list" })
  @ApiBadRequestResponse({ description: "Bad request." })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error." })
  @UsePipes(new ValidationPipe())
  @SerializeOptions({
    strategy: "excludeAll",
  })
  @ApiHeader({
    name: "tenantid",
  })
  // @ApiHeader({
  //   name: "academicyearid",
  // })
  public async searchCohort(
    @Headers() headers,
    @Req() request: Request,
    @Body() cohortSearchDto: CohortSearchDto,
    @Res() response: Response
  ) {
    let tenantId = headers["tenantid"];
    
    // let academicYearId = headers["academicyearid"];
    if (!tenantId || !isUUID(tenantId)) {
      throw new BadRequestException(API_RESPONSES.TENANTID_VALIDATION);
    }
    // if (!academicYearId || !isUUID(academicYearId)) {
    //   throw new BadRequestException(API_RESPONSES.ACADEMICYEARID_VALIDATION);
    // }
    return await this.cohortAdapter.buildCohortAdapter().searchCohort(
      tenantId,
      // academicYearId,
      request,
      cohortSearchDto,
      response
    );
  }

  @UseFilters(new AllExceptionsFilter(APIID.COHORT_UPDATE))
  @Put("/update/:cohortId")
  @ApiBasicAuth("access-token")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: process.env.IMAGEPATH,
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    })
  )
  @ApiBody({ type: CohortUpdateDto })
  @ApiOkResponse({ description: "Cohort has been updated successfully" })
  @ApiBadRequestResponse({ description: "Bad request." })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error." })
  @UsePipes(new ValidationPipe({ transform: true }))
  public async updateCohort(
    @Param("cohortId") cohortId: string,
    @Req() request: Request,
    @Body() cohortUpdateDto: CohortUpdateDto,
    @UploadedFile() image,
    @Res() response: Response
  ) {
    return await this.cohortAdapter.buildCohortAdapter().updateCohort(
      cohortId,
      request,
      cohortUpdateDto,
      response
    );
  }


  @UseFilters(new AllExceptionsFilter(APIID.COHORT_DELETE))
  @Delete("/delete/:cohortId")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "Cohort has been deleted successfully." })
  @ApiBadRequestResponse({ description: "Bad request." })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error." })
  public async updateCohortStatus(
    @Param("cohortId") cohortId: string,
    @Req() request: Request,
    @Res() response: Response
  ) {
    return await this.cohortAdapter.buildCohortAdapter().updateCohortStatus(cohortId, request, response);
  }

  @UseFilters(new AllExceptionsFilter(APIID.COHORT_READ))
  @Get("/mycohorts/:userId")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "Cohort details Fetched Successfully" })
  @ApiNotFoundResponse({ description: "User Not Found" })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error." })
  @ApiBadRequestResponse({ description: "Bad Request" })
  @ApiHeader({ name: "tenantid", })
  // @ApiHeader({
  //   name: "academicyearid",
  // })
  @ApiQuery({ name: "children", required: false, type: Boolean })
  @ApiQuery({ name: "customField", required: false, type: Boolean })
  public async getCohortsHierarachyData(
    @Request() request: Request,
    @Headers() headers,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query("children") children: string,
    @Query("customField") customField: string | null = null,
    @Res() response: Response
  ) {
    let tenantId = headers["tenantid"];
    // let academicYearId = headers["academicyearid"];
    if (!tenantId || !isUUID(tenantId)) {
      throw new BadRequestException(API_RESPONSES.TENANTID_VALIDATION);
    }
    // if (!academicYearId || !isUUID(academicYearId)) {
    //   throw new BadRequestException(API_RESPONSES.ACADEMICYEARID_VALIDATION);
    // }
    const getChildDataValueBoolean = children === 'true';
    let fieldValueBooelan = customField === 'true'
    let requiredData = {
      userId: userId,
      // academicYearId: academicYearId,
      getChildData: getChildDataValueBoolean,
      customField: fieldValueBooelan
    }
    return await this.cohortAdapter.buildCohortAdapter().getCohortHierarchyData(requiredData, response)
  }
}
