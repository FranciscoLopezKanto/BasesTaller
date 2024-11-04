import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from './course.schema';
import { UserService } from '../user/user.service'; // Asegúrate de importar el UserService

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<Course>,
    private userService: UserService, // Inyectar UserService
  ) {}

  async findAll(): Promise<Course[]> {
    return this.courseModel.find().exec();
  }

  async findOne(id: string): Promise<Course> {
    return this.courseModel.findById(id).exec();
  }

  async create(course: Course): Promise<Course> {
    // Verificar que el creador existe
    const creatorExists = await this.userService.findOne(course.creatorId);
    if (!creatorExists) {
      throw new BadRequestException(`El creador con ID ${course.creatorId} no existe.`);
    }

    // Verificar que todos los usuarios inscritos existen
    for (const inscripto of course.UsersInscritos) {
      const userExists = await this.userService.findOne(inscripto.idUser);
      if (!userExists) {
        throw new BadRequestException(`El usuario con ID ${inscripto.idUser} no existe.`);
      }
    }

    const newCourse = new this.courseModel(course);
    return newCourse.save();
  }
}
