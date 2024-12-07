import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true }) 
  password: string;


  @Prop({
    type: [
      {
        idCurso: { type: String, required: true },
        fechaInscripcion: { type: Date, required: true },
      },
    ],
  })
  cursosInscritos: {
    idCurso: string;
    fechaInscripcion: Date;
  }[];
}

export const UserSchema = SchemaFactory.createForClass(User);
