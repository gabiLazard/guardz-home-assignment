import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { Sanitize } from '../../common/decorators/sanitize.decorator';

export class CreateSubmissionDto {
  @Sanitize()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @Sanitize()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Sanitize()
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @Sanitize()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message: string;
}
