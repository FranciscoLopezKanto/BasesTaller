import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Esquema de Comentarios
@Schema()
export class Comment extends Document{
  @Prop() author: string;
  @Prop() date: Date;
  @Prop() title: string;
  @Prop() detail: string;
  @Prop({ default: 0 }) likes: number;
  @Prop({ default: 0 }) dislikes: number;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

@Schema()
export class Unit extends Document {
  @Prop({ required: true }) unitId: string;
  @Prop({ required: true }) name: string;  // Nombre de la unidad
  @Prop({
    type: [
      {
        classId: { type: String, required: true }, // ID de la clase
        name: { type: String, required: true },    // Nombre de la clase
      },
    ],
    default: [],
  })
  classes: {
    classId: string;
    name: string;
  }[];
}
export const UnitSchema = SchemaFactory.createForClass(Unit);

@Schema()
export class Course extends Document {
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) shortDescription: string;
  @Prop({ required: true }) bannerImage: string;
  @Prop({ required: true }) mainImage: string;
  @Prop({ default: 0 }) rating: number;
  @Prop({ default: 0 }) totalRatings: number;
  @Prop({ type: [CommentSchema], default: [] }) comments: Comment[];

  // Información sobre los usuarios inscritos en el curso
  @Prop({
    type: [
      {
        idUser: { type: String, required: true }, // ID del usuario inscrito
        fechaInscripcion: { type: Date, required: true }, // Fecha de inscripción
      },
    ],
    default: [],
  })
  UsersInscritos: {
    idUser: string;
    fechaInscripcion: Date;
  }[];

  // Unidades del curso (cada unidad tiene clases asociadas)
  @Prop({ type: [Unit], default: [] }) units: Unit[];

  // Progreso de los usuarios en el curso (qué clases han visto)
  @Prop({
    type: [
      {
        idUser: { type: String, required: true }, // ID del usuario
        progress: [
          {
            unitId: String, // ID de la unidad
            classId: String, // ID de la clase
            viewed: { type: Boolean, default: false }, // Si el usuario ha visto esta clase
          },
        ],
      },
    ],
    default: [],
  })
  UsersProgress: {
    idUser: string;
    progress: {
      unitId: string;
      classId: string;
      viewed: boolean;
    }[];
  }[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);