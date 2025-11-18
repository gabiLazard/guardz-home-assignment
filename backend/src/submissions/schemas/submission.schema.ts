import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubmissionDocument = Submission & Document;

@Schema({ timestamps: true })
export class Submission {
  @Prop({ required: true, index: true })
  name: string;

  @Prop({ required: true, index: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop({ required: true })
  message: string;

  // timestamps: true automatically adds createdAt and updatedAt fields
  // createdAt is automatically indexed for sorting
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);

// Additional compound indexes for common query patterns
SubmissionSchema.index({ createdAt: -1 }); // Descending order for newest first
SubmissionSchema.index({ name: 1, email: 1 }); // Compound index for combined searches
