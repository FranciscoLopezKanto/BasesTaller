import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, Unit, Comment } from './course.schema';
import { UserService } from '../user/user.service';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Unit.name) private unitModel: Model<Unit>,
    private readonly userService: UserService,
  ) {}

  // Método para agregar un comentario a un curso
  async addComment(courseId: string, commentData: { author: string; title: string; detail: string }): Promise<Course> {
    const newComment = new this.commentModel({
      author: commentData.author,
      title: commentData.title,
      detail: commentData.detail,
      date: new Date(),
      likes: 0,
      dislikes: 0,
    });

    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    course.comments.push(newComment);
    await course.save();

    return course;
  }

  // Método para obtener todos los cursos
  async findAll(): Promise<Course[]> {
    return this.courseModel.find().exec();
  }

  // Método para obtener un curso por ID
  async findOne(id: string): Promise<Course> {
    const course = await this.courseModel.findById(id);
    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }
    return course;
  }

  // Método para crear un curso
  async create(course: Course): Promise<Course> {
    const newCourse = new this.courseModel(course);
    return newCourse.save();
  }

  // Método para agregar un like o dislike a un comentario
  async addLikeOrDislikeToComment(
    courseId: string,
    commentId: string,
    action: 'like' | 'dislike',
  ): Promise<Comment> {
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    const comment = course.comments.find((comment) => comment._id.toString() === commentId);
    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }

    if (action === 'like') {
      comment.likes += 1;
    } else if (action === 'dislike') {
      comment.dislikes += 1;
    }

    await course.save();
    return comment;
  }

  // Método para agregar una unidad a un curso
  async addUnitToCourse(courseId: string, unitData: { unitId: string; name: string }): Promise<Course> {
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    // Verificar si la unidad ya existe
    const existingUnit = course.units.find((unit) => unit.unitId === unitData.unitId);
    if (existingUnit) {
      throw new Error('Unidad ya existe en este curso');
    }

    const newUnit = new this.unitModel({
      unitId: unitData.unitId,
      name: unitData.name,
      classes: [],
    });

    course.units.push(newUnit);
    await course.save();

    return course;
  }

  // Método para agregar una clase a una unidad de un curso
  async addClassToUnit(courseId: string, unitId: string, classData: { classId: string; name: string }): Promise<Course> {
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    const unit = course.units.find((unit) => unit.unitId === unitId);
    if (!unit) {
      throw new NotFoundException('Unidad no encontrada');
    }

    // Verificar si la clase ya existe en la unidad
    const existingClass = unit.classes.find((cls) => cls.classId === classData.classId);
    if (existingClass) {
      throw new Error('Clase ya existe en esta unidad');
    }

    unit.classes.push(classData);
    await course.save();

    return course;
  }
  async markClassAsViewed(courseId: string, userId: string, unitId: string, classId: string): Promise<void> {
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }
  
    // Encontrar el progreso del usuario
    let userProgress = course.UsersProgress.find((progress) => progress.idUser === userId);
    if (!userProgress) {
      userProgress = { idUser: userId, progress: [] };
      course.UsersProgress.push(userProgress);
    }
  
    // Encontrar la clase dentro de la unidad
    const existingProgress = userProgress.progress.find(
      (progress) => progress.unitId === unitId && progress.classId === classId,
    );
  
    if (!existingProgress) {
      // Si no existe, agregar como vista
      userProgress.progress.push({
        unitId,
        classId,
        viewed: true,
      });
    } else {
      // Si ya existe, marcar como vista si aún no lo está
      existingProgress.viewed = true;
    }
  
    await course.save();
  }
  
  async calculateUserProgress(courseId: string, userId: string): Promise<{ percentage: number }> {
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }
  
    // Obtener todas las clases del curso
    const totalClasses = course.units.reduce(
      (sum, unit) => sum + unit.classes.length,
      0,
    );
  
    if (totalClasses === 0) {
      return { percentage: 0 }; // Evitar divisiones por 0
    }
  
    // Obtener progreso del usuario
    const userProgress = course.UsersProgress.find((progress) => progress.idUser === userId);
    if (!userProgress) {
      return { percentage: 0 }; // Sin progreso
    }
  
    // Contar clases vistas
    const viewedClasses = userProgress.progress.filter((progress) => progress.viewed).length;
  
    // Calcular porcentaje
    const percentage = (viewedClasses / totalClasses) * 100;
  
    return { percentage: Math.round(percentage) };
  }
  

  // Método para inscribir a un usuario en un curso
  async enrollUserToCourse(userId: string, courseId: string): Promise<Course> {
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    const userAlreadyEnrolled = course.UsersInscritos.some((user) => user.idUser === userId);
    if (userAlreadyEnrolled) {
      throw new Error('Usuario ya inscrito en este curso');
    }

    course.UsersInscritos.push({
      idUser: userId,
      fechaInscripcion: new Date(),
    });

    await course.save();
    return course;
  }
}
