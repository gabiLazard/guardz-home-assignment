import { Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { SubmissionDocument } from './schemas/submission.schema';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { QuerySubmissionDto, PAGE_SIZE } from './dto/query-submission.dto';
import { SubmissionResponseDto } from './dto/submission-response.dto';
import { PaginatedSubmissionResponseDto, PaginationMetaDto } from './dto/paginated-submission-response.dto';
import { SubmissionRepository } from './repositories/submission.repository';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class SubmissionsService {
  constructor(
    private readonly submissionRepository: SubmissionRepository,
  ) {}

  async create(createSubmissionDto: CreateSubmissionDto): Promise<SubmissionResponseDto> {
    const submission = await this.submissionRepository.create(createSubmissionDto);
    return plainToInstance(SubmissionResponseDto, submission.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  async findAll(query: QuerySubmissionDto): Promise<PaginatedSubmissionResponseDto> {
    const { page = 1, search, sortBy = 'createdAt', sortOrder = 'desc', startDate, endDate } = query;

    // Build filter query
    const filter: FilterQuery<SubmissionDocument> = {};

    // Search across name, email, and message fields
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    // Date range filtering
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set end date to end of day
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDateTime;
      }
    }

    // Calculate pagination
    const skip = (page - 1) * PAGE_SIZE;

    // Execute query with pagination using repository
    const [submissions, totalItems] = await Promise.all([
      this.submissionRepository.findAll({
        filter,
        sortBy,
        sortOrder,
        skip,
        limit: PAGE_SIZE,
      }),
      this.submissionRepository.count(filter),
    ]);

    const totalPages = Math.ceil(totalItems / PAGE_SIZE);

    // Transform to DTOs
    const data = submissions.map((submission) =>
      plainToInstance(SubmissionResponseDto, submission.toObject(), {
        excludeExtraneousValues: true,
      }),
    );

    const pagination: PaginationMetaDto = {
      page,
      pageSize: PAGE_SIZE,
      totalItems,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    return new PaginatedSubmissionResponseDto(data, pagination);
  }

  async findOne(id: string): Promise<SubmissionResponseDto | null> {
    const submission = await this.submissionRepository.findById(id);
    if (!submission) {
      return null;
    }
    return plainToInstance(SubmissionResponseDto, submission.toObject(), {
      excludeExtraneousValues: true,
    });
  }
}
