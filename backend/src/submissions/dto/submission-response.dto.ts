import { Exclude, Expose, Transform } from 'class-transformer';

// Type for the Transform decorator input
type TransformInput = { obj: { _id?: { toString(): string } } };

@Exclude()
export class SubmissionResponseDto {
  @Expose()
  @Transform(({ obj }: TransformInput) => {
    const id = obj._id;
    return id ? id.toString() : undefined;
  })
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
