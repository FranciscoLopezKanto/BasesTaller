import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseController } from './courses.controller';
import { CoursesService } from './courses.service';
import { Course, CourseSchema } from './course.schema';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }]),
    UserModule
  ],
  controllers: [CourseController],
  providers: [CoursesService],
  exports: [CoursesService],  // Exportar si es necesario para otros módulos
})
export class CoursesModule {}
