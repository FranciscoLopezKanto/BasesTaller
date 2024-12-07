import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('courses')
@Controller('courses')
export class CourseController {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo curso' })
  @ApiResponse({ status: 201, description: 'Curso creado exitosamente.' })
  async create(@Body() course: { name: string; description: string; bannerUrl: string }) {
    const courseId = `course:${Date.now()}`; // ID único basado en timestamp
    const courseData = { ...course, rating: 0, totalRatings: 0, comments: [] };

    // Guardar curso en Redis
    await this.redis.set(courseId, JSON.stringify(courseData));

    // Agregar ID al índice de cursos
    await this.redis.sadd('course:ids', courseId);

    return { message: 'Curso creado exitosamente.', courseId, courseData };
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los cursos' })
  @ApiResponse({ status: 200, description: 'Lista de todos los cursos.' })
  async getAllCourses() {
    const courseIds = await this.redis.smembers('course:ids'); // Obtener IDs de todos los cursos
    const courses = await Promise.all(
      courseIds.map(async (id) => JSON.parse(await this.redis.get(id)))
    );
    return courses;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un curso por ID' })
  @ApiParam({ name: 'id', description: 'ID del curso' })
  @ApiResponse({
    status: 200,
    description: 'Curso encontrado.',
  })
  async getCourseById(@Param('id') courseId: string) {
    const course = await this.redis.get(courseId);
    if (!course) {
      return { message: 'Course not found' };
    }
    return JSON.parse(course);
  }

  @Patch(':id/rating')
  @ApiOperation({ summary: 'Actualizar la puntuación de un curso' })
  @ApiParam({ name: 'id', description: 'ID del curso' })
  @ApiBody({
    description: 'Datos para actualizar la puntuación',
    schema: {
      example: { rating: 5 },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Puntuación actualizada exitosamente.',
  })
  async updateCourseRating(@Param('id') courseId: string, @Body() ratingData: { rating: number }) {
    const course = JSON.parse(await this.redis.get(courseId));
    if (!course) {
      return { message: 'Course not found' };
    }

    // Calcular nuevo promedio
    const newTotalRatings = course.totalRatings + 1;
    const newRating =
      (course.rating * course.totalRatings + ratingData.rating) / newTotalRatings;

    // Actualizar datos del curso
    const updatedCourse = { ...course, rating: newRating, totalRatings: newTotalRatings };
    await this.redis.set(courseId, JSON.stringify(updatedCourse));

    return { message: 'Course rating updated successfully', updatedCourse };
  }

  @Patch(':id/comments')
  @ApiOperation({ summary: 'Agregar un comentario a un curso' })
  @ApiParam({ name: 'id', description: 'ID del curso' })
  @ApiBody({
    description: 'Datos del comentario',
    schema: {
      example: { userId: 'user-1', title: 'Great Course', detail: 'Very informative', likes: 10 },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Comentario agregado exitosamente.',
  })
  async addCourseComment(
    @Param('id') courseId: string,
    @Body() comment: { userId: string; title: string; detail: string; likes: number }
  ) {
    const course = JSON.parse(await this.redis.get(courseId));
    if (!course) {
      return { message: 'Course not found' };
    }

    // Agregar comentario a la lista
    const updatedComments = [...course.comments, { ...comment, date: new Date().toISOString() }];
    const updatedCourse = { ...course, comments: updatedComments };

    await this.redis.set(courseId, JSON.stringify(updatedCourse));

    return { message: 'Comment added successfully', updatedComments };
  }
}
