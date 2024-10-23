import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Course } from './course.schema';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async getAllCourses(): Promise<Course[]> {
    return this.coursesService.findAll();
  }

  @Get(':id')
  async getCourseById(@Param('id') id: string): Promise<Course> {
    return this.coursesService.findOne(id);
  }

  @Post()
  async createCourse(@Body() course: Course): Promise<Course> {
    return this.coursesService.create(course);
  }
}
