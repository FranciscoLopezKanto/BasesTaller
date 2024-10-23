import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Comment {
  @Prop() author: string;
  @Prop() date: Date;
  @Prop() title: string;
  @Prop() detail: string;
  @Prop({ default: 0 }) likes: number;
  @Prop({ default: 0 }) dislikes: number;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

@Schema()
export class Course extends Document {
  @Prop() name: string;
  @Prop() shortDescription: string;
  @Prop() bannerImage: string;
  @Prop() mainImage: string;
  @Prop({ default: 0 }) rating: number;
  @Prop([CommentSchema]) comments: Comment[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);
