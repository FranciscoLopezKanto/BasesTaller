import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente.' })
  async create(@Body() user: { name: string; email: string }) {
    const userId = `user:${Date.now()}`; // Generar un ID único basado en la marca de tiempo
    const userData = { ...user, courses: [] };

    // Guardar usuario en Redis
    await this.redis.set(userId, JSON.stringify(userData));

    // Agregar ID al índice de usuarios
    await this.redis.sadd('user:ids', userId);

    return { message: 'Usuario creado exitosamente.', userId, userData };
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de todos los usuarios.' })
  async getAllUsers() {
    const userIds = await this.redis.smembers('user:ids'); // Obtener IDs de todos los usuarios
    const users = await Promise.all(
      userIds.map(async (id) => JSON.parse(await this.redis.get(id)))
    );
    return users;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado.' })
  async getUserById(@Param('id') userId: string) {
    const user = await this.redis.get(userId);
    if (!user) {
      return { message: 'User not found' };
    }
    return JSON.parse(user);
  }

  @Get(':id/courses')
  @ApiOperation({ summary: 'Obtener los cursos de un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Lista de cursos del usuario.',
  })
  async getUserCourses(@Param('id') userId: string) {
    const courses = await this.redis.hgetall(`user:${userId}:courses`);
    return Object.entries(courses).map(([courseId, data]) => ({
      courseId,
      ...JSON.parse(data),
    }));
  }

  @Patch(':id/courses/:courseId')
  @ApiOperation({ summary: 'Actualizar el progreso de un curso para un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiParam({ name: 'courseId', description: 'ID del curso' })
  @ApiBody({
    description: 'Datos para actualizar el progreso del curso',
    schema: {
      example: { state: 'COMPLETADO', progress: 100 },
    },
  })
  @ApiResponse({ status: 200, description: 'Progreso actualizado exitosamente.' })
  async updateCourseProgress(
    @Param('id') userId: string,
    @Param('courseId') courseId: string,
    @Body() updateData: { state: string; progress: number }
  ) {
    const key = `user:${userId}:courses`;
    const existingData = JSON.parse((await this.redis.hget(key, courseId)) || '{}');
    const updatedData = { ...existingData, ...updateData };

    // Actualizar datos del curso
    await this.redis.hset(key, courseId, JSON.stringify(updatedData));

    return { message: 'Course progress updated successfully', updatedData };
  }
}
