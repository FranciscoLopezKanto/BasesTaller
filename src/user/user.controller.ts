import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.schema';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('users') // Agrupa bajo la etiqueta "users"
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiBody({
    description: 'Datos para crear un nuevo usuario',
    schema: {
      example: {
        name: 'John Doe',
        email: 'john.doe@example.com'
      }
    }
  })
  create(@Body() user: Partial<User>) {
    return this.userService.create(user);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de todos los usuarios.' })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario', example: '60e3b9a4e1e6f833ac486e39' })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado.',
    schema: {
      example: {
        _id: '60e3b9a4e1e6f833ac486e39',
        name: 'John Doe',
        email: 'john.doe@example.com',
        createdAt: '2023-10-01T12:00:00Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario', example: '60e3b9a4e1e6f833ac486e39' })
  @ApiBody({
    description: 'Datos para actualizar el usuario',
    schema: {
      example: {
        name: 'John Doe Updated',
        email: 'john.doe_updated@example.com'
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  update(@Param('id') id: string, @Body() user: Partial<User>) {
    return this.userService.update(id, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario', example: '60e3b9a4e1e6f833ac486e39' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
