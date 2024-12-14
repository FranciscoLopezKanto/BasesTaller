import { Injectable, NotFoundException } from '@nestjs/common';
import neo4j, { Driver, Session } from 'neo4j-driver';
import { Course } from './course.schema';

@Injectable()
export class CoursesService {
  findOne(courseId: string): import("./course.schema").Course | PromiseLike<import("./course.schema").Course> {
    throw new Error('Method not implemented.');
  }
  create(course: Course): import("./course.schema").Course | PromiseLike<import("./course.schema").Course> {
    throw new Error('Method not implemented.');
  }
  findAll(): import("./course.schema").Course[] | PromiseLike<import("./course.schema").Course[]> {
    throw new Error('Method not implemented.');
  }
  private readonly driver: Driver;

  constructor() {
    this.driver = neo4j.driver(
      'bolt://localhost:7687', // URL del servidor Neo4j
      neo4j.auth.basic('neo4j', 'password') // Credenciales de Neo4j
    );
  }

  private getSession(): Session {
    return this.driver.session();
  }

  // Método para crear un curso
  async createCourse(courseId: string, name: string): Promise<void> {
    const session = this.getSession();
    try {
      const query = `
        CREATE (c:Course {id: $courseId, name: $name})
      `;
      await session.run(query, { courseId, name });
    } finally {
      await session.close();
    }
  }

  async addComment(courseId: string, commentData: { author: string; title: string; detail: string }): Promise<Course> {
    const session = this.getSession();
    try {
      const courseResult = await session.run(
        'MATCH (course:Course {id: $courseId}) RETURN course',
        { courseId }
      );

      const course = courseResult.records[0]?.get('course').properties;

      if (!course) {
        throw new NotFoundException('Course not found');
      }

      const newComment = {
        author: commentData.author,
        title: commentData.title,
        detail: commentData.detail,
        date: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
      };

      await session.run(
        'MATCH (course:Course {id: $courseId}) CREATE (comment:Comment $newComment) CREATE (course)-[:HAS_COMMENT]->(comment) RETURN course',
        { courseId, newComment }
      );

      const updatedCourseResult = await session.run(
        'MATCH (course:Course {id: $courseId}) RETURN course',
        { courseId }
      );

      return updatedCourseResult.records[0].get('course').properties;
    } finally {
      await session.close();
    }
  }
  
  // Método para agregar un like o dislike a un comentario
  async addLikeOrDislikeToComment(
    commentId: string,
    action: 'like' | 'dislike',
  ): Promise<void> {
    const session = this.getSession();

    try {
      const query = `
        MATCH (com:Comment {id: $commentId})
        SET com.${action}s = com.${action}s + 1
      `;
      await session.run(query, { commentId });
    } finally {
      await session.close();
    }
  }

  // Método para obtener comentarios de un curso
  async getComments(courseId: string): Promise<any[]> {
    const session = this.getSession();

    try {
      const query = `
        MATCH (c:Course {id: $courseId})-[:HAS_COMMENT]->(com:Comment)
        RETURN com
      `;
      const result = await session.run(query, { courseId });
      return result.records.map((record) => record.get('com').properties);
    } finally {
      await session.close();
    }
  }

  // Método para calcular la puntuación promedio de un curso basado en likes y dislikes
  async getCourseRatings(courseId: string): Promise<{ averageRating: number }> {
    const session = this.getSession();

    try {
      const query = `
        MATCH (c:Course {id: $courseId})-[:HAS_COMMENT]->(com:Comment)
        RETURN avg(com.likes - com.dislikes) as averageRating
      `;
      const result = await session.run(query, { courseId });
      const averageRating = result.records[0]?.get('averageRating') || 0;
      return { averageRating };
    } finally {
      await session.close();
    }
  }

  // Método para agregar una unidad a un curso
  async addUnitToCourse(courseId: string, unitId: string, name: string): Promise<void> {
    const session = this.getSession();
    try {
      const query = `
        MATCH (c:Course {id: $courseId})
        CREATE (c)-[:HAS_UNIT]->(u:Unit {id: $unitId, name: $name})
      `;
      await session.run(query, { courseId, unitId, name });
    } finally {
      await session.close();
    }
  }

  // Método para agregar una clase a una unidad
  async addClassToUnit(courseId: string, unitId: string, classId: string, name: string): Promise<void> {
    const session = this.getSession();
    try {
      const query = `
        MATCH (c:Course {id: $courseId})-[:HAS_UNIT]->(u:Unit {id: $unitId})
        CREATE (u)-[:HAS_CLASS]->(cl:Class {id: $classId, name: $name})
      `;
      await session.run(query, { courseId, unitId, classId, name });
    } finally {
      await session.close();
    }
  }

  // Método para marcar una clase como vista por un usuario
  async markClassAsViewed(courseId: string, userId: string, unitId: string, classId: string): Promise<void> {
    const session = this.getSession();
    try {
      const query = `
        MATCH (c:Course {id: $courseId})-[:HAS_UNIT]->(u:Unit {id: $unitId})-[:HAS_CLASS]->(cl:Class {id: $classId})
        MERGE (u:User {id: $userId})
        MERGE (u)-[:VIEWED]->(cl)
      `;
      await session.run(query, { courseId, userId, unitId, classId });
    } finally {
      await session.close();
    }
  }

  // Método para calcular el progreso del usuario en un curso
  async calculateUserProgress(courseId: string, userId: string): Promise<{ percentage: number }> {
    const session = this.getSession();
    try {
      const totalClassesQuery = `
        MATCH (c:Course {id: $courseId})-[:HAS_UNIT]->(:Unit)-[:HAS_CLASS]->(cl:Class)
        RETURN count(cl) as totalClasses
      `;
      const viewedClassesQuery = `
        MATCH (u:User {id: $userId})-[:VIEWED]->(cl:Class)<-[:HAS_CLASS]-(:Unit)<-[:HAS_UNIT]-(c:Course {id: $courseId})
        RETURN count(cl) as viewedClasses
      `;

      const totalClassesResult = await session.run(totalClassesQuery, { courseId });
      const viewedClassesResult = await session.run(viewedClassesQuery, { courseId, userId });

      const totalClasses = totalClassesResult.records[0]?.get('totalClasses').toInt() || 0;
      const viewedClasses = viewedClassesResult.records[0]?.get('viewedClasses').toInt() || 0;

      const percentage = totalClasses === 0 ? 0 : (viewedClasses / totalClasses) * 100;
      return { percentage: Math.round(percentage) };
    } finally {
      await session.close();
    }
  }

  // Método para inscribir un usuario a un curso
  async enrollUserToCourse(userId: string, courseId: string): Promise<void> {
    const session = this.getSession();
    try {
      const query = `
        MATCH (c:Course {id: $courseId})
        MERGE (u:User {id: $userId})
        MERGE (u)-[:ENROLLED_IN]->(c)
      `;
      await session.run(query, { userId, courseId });
    } finally {
      await session.close();
    }
  }

  // Método para cerrar la conexión con Neo4j
  async closeConnection(): Promise<void> {
    await this.driver.close();
  }
}
