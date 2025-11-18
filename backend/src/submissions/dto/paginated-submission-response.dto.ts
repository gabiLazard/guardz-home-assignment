import { SubmissionResponseDto } from './submission-response.dto';

export class PaginationMetaDto {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class PaginatedSubmissionResponseDto {
  data: SubmissionResponseDto[];
  pagination: PaginationMetaDto;

  constructor(
    data: SubmissionResponseDto[],
    pagination: PaginationMetaDto,
  ) {
    this.data = data;
    this.pagination = pagination;
  }
}
