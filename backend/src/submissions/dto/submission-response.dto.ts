import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class SubmissionResponseDto {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  phone?: string;

  @Expose()
  message: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<SubmissionResponseDto>) {
    Object.assign(this, partial);
  }
}
