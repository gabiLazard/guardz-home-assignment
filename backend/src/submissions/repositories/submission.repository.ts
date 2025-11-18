import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Submission, SubmissionDocument } from '../schemas/submission.schema';
import { CreateSubmissionDto } from '../dto/create-submission.dto';

export interface FindAllOptions {
  filter?: FilterQuery<SubmissionDocument>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  skip?: number;
  limit?: number;
}

@Injectable()
export class SubmissionRepository {
  constructor(
    @InjectModel(Submission.name)
    private readonly submissionModel: Model<SubmissionDocument>,
  ) {}

  async create(createSubmissionDto: CreateSubmissionDto): Promise<SubmissionDocument> {
    const submission = new this.submissionModel(createSubmissionDto);
    return submission.save();
  }

  async findAll(options: FindAllOptions): Promise<SubmissionDocument[]> {
    const {
      filter = {},
      sortBy = 'createdAt',
      sortOrder = 'desc',
      skip = 0,
      limit = 10,
    } = options;

    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    return this.submissionModel
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async findById(id: string): Promise<SubmissionDocument | null> {
    return this.submissionModel.findById(id).exec();
  }

  async count(filter: FilterQuery<SubmissionDocument> = {}): Promise<number> {
    return this.submissionModel.countDocuments(filter).exec();
  }
}
