import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Course } from './course.schema';

class ProgressDto {
  unitId: string;
  classId: string;
}

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // Endpoint para obtener todos los cursos
  @Get()
  @ApiOperation({ summary: 'Obtener todos los cursos' })
  @ApiResponse({ status: 200, description: 'Lista de todos los cursos.' })
  async getAllCourses(): Promise<Course[]> {
    return this.coursesService.findAll();
  }

  // Endpoint para obtener un curso por su ID
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un curso por ID' })
  @ApiParam({ name: 'id', description: 'ID del curso' })
  @ApiResponse({ status: 200, description: 'Curso encontrado.' })
  async getCourseById(@Param('id') courseId: string): Promise<Course> {
    return this.coursesService.findOne(courseId);
  }

  // Endpoint para crear un curso
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo curso' })
  @ApiBody({
    description: 'Datos del nuevo curso',
    schema: {
      example: {
        name: 'Curso de Programación',
        shortDescription: 'Aprende a programar desde cero.',
        bannerImage: 'url-banner',
        mainImage: 'url-main-image',
        rating: 0,
        creatorId: 'user-id',
        comments: [],
        UsersInscritos: [],
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Curso creado exitosamente.' })
  async create(@Body() course: Course): Promise<Course> {
    return this.coursesService.create(course);
  }

  // Endpoint para agregar un comentario a un curso
  @Patch(':id/comments')
  @ApiOperation({ summary: 'Agregar un comentario a un curso' })
  @ApiParam({ name: 'id', description: 'ID del curso' })
  @ApiBody({
    description: 'Datos del comentario',
    schema: {
      example: { author: 'Usuario 1', title: 'Excelente curso', detail: 'Me ayudó mucho, lo recomiendo' },
    },
  })
  @ApiResponse({ status: 200, description: 'Comentario agregado exitosamente.' })
  async addComment(
    @Param('id') courseId: string,
    @Body() commentData: { author: string; title: string; detail: string },
  ): Promise<Course> {
    return this.coursesService.addComment(courseId, commentData);
  }

  // Endpoint para agregar un like a un comentario
  @Patch(':courseId/comments/:commentId/like')
  @ApiOperation({ summary: 'Agregar un like a un comentario' })
  @ApiParam({ name: 'courseId', description: 'ID del curso' })
  @ApiParam({ name: 'commentId', description: 'ID del comentario' })
  @ApiResponse({ status: 200, description: 'Comentario con like agregado exitosamente.' })
  async addLikeToComment(
    @Param('courseId') courseId: string,
    @Param('commentId') commentId: string,
  ): Promise<void> {
    return this.coursesService.addLikeOrDislikeToComment(commentId, 'like');
  }

  // Endpoint para agregar un dislike a un comentario
  @Patch(':courseId/comments/:commentId/dislike')
  @ApiOperation({ summary: 'Agregar un dislike a un comentario' })
  @ApiParam({ name: 'courseId', description: 'ID del curso' })
  @ApiParam({ name: 'commentId', description: 'ID del comentario' })
  @ApiResponse({ status: 200, description: 'Comentario con dislike agregado exitosamente.' })
  async addDislikeToComment(
    @Param('courseId') courseId: string,
    @Param('commentId') commentId: string,
  ): Promise<void> {
    return this.coursesService.addLikeOrDislikeToComment(commentId, 'dislike');
  }

  // Endpoint para calcular el progreso del usuario en un curso
  @Get(':id/progress/:userId')
  @ApiOperation({ summary: 'Calcular el progreso del usuario en un curso' })
  @ApiParam({ name: 'id', description: 'ID del curso' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Porcentaje de progreso del usuario.',
  })
  async calculateProgress(
    @Param('id') courseId: string,
    @Param('userId') userId: string,
  ): Promise<{ percentage: number }> {
    return this.coursesService.calculateUserProgress(courseId, userId);
  }

  // Endpoint para inscribir a un usuario en un curso
  @Post(':id/enroll')
  @ApiOperation({ summary: 'Inscribir a un usuario en un curso' })
  @ApiParam({ name: 'id', description: 'ID del curso' })
  @ApiBody({
    description: 'Datos del usuario a inscribir',
    schema: {
      example: { userId: 'user-id' },
    },
  })
  @ApiResponse({ status: 201, description: 'Usuario inscrito exitosamente.' })
  async enrollUser(@Param('id') courseId: string, @Body('userId') userId: string): Promise<void> {
    return this.coursesService.enrollUserToCourse(userId, courseId);
  }
}
