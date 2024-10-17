import { Expose } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CohortCreateDto } from "./cohort-create.dto";

export class CohortDto {
  //generated fields
  @Expose()
  tenantId: string;
  @Expose()
  cohortId: string;
  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;

  //programId
  // @ApiPropertyOptional({
  //   type: String,
  //   description: "The programId of the cohort",
  //   default: "",
  // })
  // @Expose()
  // programId: string;

  //parentId
  @ApiPropertyOptional({
    type: String,
    description: "The parentId of the cohort",
    default: "",
  })
  @Expose()
  parentId: string;

  //referenceId
  // @ApiPropertyOptional({
  //   type: String,
  //   description: "The referenceId of the cohort",
  //   default: "",
  // })
  // @Expose()
  // referenceId: string;

  //name
  @ApiProperty({
    type: String,
    description: "The name of the cohort",
    default: "",
  })
  @Expose()
  name: string;

  //type
  @ApiProperty({
    type: String,
    description: "The type of the cohort",
    default: "",
  })
  @Expose()
  type: string;


  //status
  @ApiPropertyOptional({
    type: String,
    description: "The status of the cohort",
    default: true,
  })
  @Expose()
  status: string;

  //image
  // @Expose()
  // @ApiPropertyOptional({ type: "string", format: "binary" })
  // image: string;

  //attendanceCaptureImage
  // @ApiProperty({
  //   type: Boolean,
  //   description: "Capture image while marking the attendance",
  //   default: false,
  // })
  // @Expose()
  // attendanceCaptureImage: boolean;

  //metadata
  // @ApiPropertyOptional({
  //   type: String,
  //   description: "The metadata of cohort",
  //   default: "",
  // })
  // @Expose()
  // metadata: string;

  //createdBy
  @Expose()
  @ApiProperty({
    type: String,
    description: "The cohort is createdBy",
    default: "",
  })
  createdBy: string;

  //updatedBy
  @ApiProperty({
    type: String,
    description: "The cohort is updatedBy",
    default: "",
  })
  @Expose()
  updatedBy: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}

export class ReturnResponseBody {
  @Expose()
  cohortId: string;
  @Expose()
  parentId: string;
  @Expose()
  name: string;
  @Expose()
  type: string;
  @Expose()
  status: string;
  @Expose()
  tenantId: string;
  // @Expose()
  // academicYearId: string;

  constructor(cohortDto: CohortCreateDto) {
    this.cohortId = cohortDto.cohortId;
    this.parentId = cohortDto.parentId;
    this.name = cohortDto.name;
    this.type = cohortDto.type;
    this.status = cohortDto.status;
    this.tenantId = cohortDto.tenantId;
    // this.academicYearId = cohortDto.academicYearId;
  }
}
