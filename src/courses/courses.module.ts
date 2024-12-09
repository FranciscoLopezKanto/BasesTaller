import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course, CourseSchema } from './course.schema';
import { Comment, CommentSchema } from './course.schema';
import { Unit, UnitSchema } from './course.schema';
import { UserModule } from '../user/user.module'; // Asegúrate de importar el módulo de User

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Unit.name, schema: UnitSchema },
    ]),
    UserModule, // Importa el módulo de User
  ],
  providers: [CoursesService],
  controllers: [CoursesController],
  exports: [CoursesService],  // Exportar si es necesario para otros módulos asdasd 
})
export class CoursesModule {}
