import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Course } from './course.schema';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('courses') // Agrupa bajo la etiqueta "courses"
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los cursos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los cursos.',
    schema: {
      example: [
        {
          _id: '60e3b9a4e1e6f833ac486e40',
          title: 'Desarrollo Web',
          description: 'Curso de introducción al desarrollo web',
          creatorId: '60e3b9a4e1e6f833ac486e39',
          UsersInscritos: [{ idUser: '60e3b9a4e1e6f833ac486e39' }]
        }
      ]
    }
  })
  async getAllCourses(): Promise<Course[]> {
    return this.coursesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un curso por ID' })
  @ApiParam({ name: 'id', description: 'ID del curso', example: '60e3b9a4e1e6f833ac486e40' })
  @ApiResponse({
    status: 200,
    description: 'Curso encontrado.',
    schema: {
      example: {
        _id: '60e3b9a4e1e6f833ac486e40',
        title: 'Desarrollo Web',
        description: 'Curso de introducción al desarrollo web',
        creatorId: '60e3b9a4e1e6f833ac486e39',
        UsersInscritos: [{ idUser: '60e3b9a4e1e6f833ac486e39' }]
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Curso no encontrado.' })
  async getCourseById(@Param('id') id: string): Promise<Course> {
    return this.coursesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo curso' })
  @ApiBody({
    description: 'Datos para crear un nuevo curso',
    schema: {
      example: {
        title: 'Desarrollo Web',
        description: 'Curso de introducción al desarrollo web',
        creatorId: '60e3b9a4e1e6f833ac486e39',
        UsersInscritos: [{ idUser: '60e3b9a4e1e6f833ac486e39' }]
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Curso creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o usuario no encontrado.' })
  async createCourse(@Body() course: Course): Promise<Course> {
    return this.coursesService.create(course);
  }
}
