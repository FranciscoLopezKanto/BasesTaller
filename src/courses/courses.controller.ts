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
  constructor(private readonly coursesService: CoursesService) { }

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
  @ApiResponse({ status: 200, description: 'Comentario con like actualizado' })
  async addLike(
    @Param('courseId') courseId: string,
    @Param('commentId') commentId: string,
  ) {
    const updatedComment = await this.coursesService.addLikeOrDislikeToComment(
      courseId,
      commentId,
      'like',
    );
    return updatedComment;
  }

  // Endpoint para agregar un dislike a un comentario
  @Patch(':courseId/comments/:commentId/dislike')
  @ApiOperation({ summary: 'Agregar un dislike a un comentario' })
  @ApiParam({ name: 'courseId', description: 'ID del curso' })
  @ApiParam({ name: 'commentId', description: 'ID del comentario' })
  @ApiResponse({ status: 200, description: 'Comentario con dislike actualizado' })
  async addDislike(
    @Param('courseId') courseId: string,
    @Param('commentId') commentId: string,
  ) {
    const updatedComment = await this.coursesService.addLikeOrDislikeToComment(
      courseId,
      commentId,
      'dislike',
    );
    return updatedComment;
  }

  // Endpoint para marcar una clase como vista por un usuario
  @Patch(':courseId/users/:userId/progress')
  @ApiOperation({ summary: 'Marcar una clase como vista por un usuario' })
  @ApiParam({ name: 'courseId', description: 'ID del curso' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiBody({
    description: 'Información sobre la unidad y clase a marcar como vista',
    type: ProgressDto,
  })
  @ApiResponse({ status: 200, description: 'Progreso del usuario actualizado' })
  async markClassAsViewed(
    @Param('courseId') courseId: string,
    @Param('userId') userId: string,
    @Param('unitId') unitId: string,
    @Param('classId') classId: string
  ) {
    // Llamar al servicio para marcar la clase como vista, pasando ambos 'unitId' y 'classId'
    await this.coursesService.markClassAsViewed(
      courseId,       // courseId
      userId,         // userId
      unitId,    // unitId
      classId    // classId
    );

    return { message: 'Clase marcada como vista' };
  }


  @Get(':courseId/users/:userId/progress/percentage')
  @ApiOperation({ summary: 'Obtener el porcentaje de progreso de un usuario en un curso' })
  @ApiParam({ name: 'courseId', description: 'ID del curso' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Porcentaje de progreso del usuario en el curso',
    schema: {
      example: { percentage: 75 },
    },
  })
  async getUserProgressPercentage(
    @Param('courseId') courseId: string,
    @Param('userId') userId: string,
  ): Promise<{ percentage: number }> {
    return this.coursesService.calculateUserProgress(courseId, userId);
  }
  
  // Endpoint para agregar un usuario a un curso
  @Patch(':userId/enroll/:courseId')
  @ApiOperation({ summary: 'Agregar un usuario a un curso' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiParam({ name: 'courseId', description: 'ID del curso' })
  @ApiResponse({ status: 200, description: 'Usuario agregado al curso.' })
  async enrollUser(
    @Param('userId') userId: string,
    @Param('courseId') courseId: string
  ) {
    const updatedCourse = await this.coursesService.enrollUserToCourse(userId, courseId);
    return updatedCourse;
  }
  // Endpoint para agregar una unidad a un curso
  @Post(':courseId/units')
  @ApiOperation({ summary: 'Agregar una unidad a un curso' })
  @ApiParam({ name: 'courseId', description: 'ID del curso' })
  @ApiBody({
    description: 'Datos de la unidad a agregar',
    schema: {
      example: {
        unitId: 'unit-123',
        name: 'Unidad 1: Introducción',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Unidad agregada exitosamente al curso.' })
  async addUnitToCourse(
    @Param('courseId') courseId: string,
    @Body() unitData: { unitId: string; name: string },
  ): Promise<Course> {
    return this.coursesService.addUnitToCourse(courseId, unitData);
  }
  // Endpoint para agregar una clase a una unidad de un curso
  @Post(':courseId/units/:unitId/classes')
  @ApiOperation({ summary: 'Agregar una clase a una unidad de un curso' })
  @ApiParam({ name: 'courseId', description: 'ID del curso' })
  @ApiParam({ name: 'unitId', description: 'ID de la unidad' })
  @ApiBody({
    description: 'Datos de la clase a agregar',
    schema: {
      example: {
        classId: 'class-123',
        name: 'Clase 1: Fundamentos básicos',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Clase agregada exitosamente a la unidad.' })
  async addClassToUnit(
    @Param('courseId') courseId: string,
    @Param('unitId') unitId: string,
    @Body() classData: { classId: string; name: string },
  ): Promise<Course> {
    return this.coursesService.addClassToUnit(courseId, unitId, classData);
  }

}
