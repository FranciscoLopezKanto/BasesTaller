import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @InjectRedis() private readonly redis: Redis // Inyectar Redis
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente.' })
  create(@Body() user: { name: string; email: string }) {
    return this.userService.create(user);
  }

  @Get(':id/courses')
  @ApiOperation({ summary: 'Obtener los cursos de un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Lista de cursos del usuario.',
    schema: {
      example: [
        { courseId: '101', state: 'EN CURSO', progress: 50, dateStarted: '2024-12-01' },
      ],
    },
  })
  async getUserCourses(@Param('id') userId: string) {
    const keys = await this.redis.keys(`user:${userId}:courses:*`);
    const courses = await Promise.all(
      keys.map(async (key) => JSON.parse(await this.redis.get(key)))
    );
    return courses;
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los usuarios.',
    schema: {
      example: [
        { _id: 'user-1', nombre: 'User 1', email: 'user1@example.com', cursosInscritos: [] },
        { _id: 'user-2', nombre: 'User 2', email: 'user2@example.com', cursosInscritos: [] },
      ],
    },
  })
  async getAllUsers() {
    const keys = await this.redis.keys('user:*');  // Obtener todas las claves de los usuarios
    const users = await Promise.all(
      keys.map(async (key) => JSON.parse(await this.redis.get(key)))
    );
    return users;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado.',
    schema: {
      example: { _id: 'user-1', nombre: 'User 1', email: 'user1@example.com', cursosInscritos: [] },
    },
  })
  async getUserById(@Param('id') userId: string) {
    const user = await this.redis.get(`user:${userId}`);  // Buscar el usuario por ID
    if (!user) {
      return { message: 'User not found' };
    }
    return JSON.parse(user);
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
    const key = `user:${userId}:courses:${courseId}`;
    const courseData = JSON.parse(await this.redis.get(key)) || {};
    const updatedData = { ...courseData, ...updateData };
    await this.redis.set(key, JSON.stringify(updatedData));
    return { message: 'Course progress updated successfully', updatedData };
  }
}
