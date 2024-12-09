import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { User } from './user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectRedis() private readonly redis: Redis // Inyectar Redis para compatibilidad
  ) { }

  async create(user: Partial<User>): Promise<User> {
    // Generar un ID único para el usuario
    const userId = `user:${new Date().getTime()}`; // O usa una librería como `uuid`

    // Crear un objeto del usuario
    const userData = { ...user, id: userId.replace('user:', ''), courses: [] };

    // Guardar en Redis
    await this.redis.set(userId, JSON.stringify(userData));
    await this.redis.sadd('user:ids', userId); // Agregar el ID al conjunto de usuarios

    return userData as User;
  }


  async findAll(): Promise<User[]> {
    const userIds = await this.redis.smembers('user:ids');
    const users = [];

    for (const userId of userIds) {
      const userData = await this.redis.get(userId);
      if (userData) {
        users.push(JSON.parse(userData));
      }
    }

    return users;
  }

  // Método para obtener un usuario desde Redis
  async findOne(id: string): Promise<User | null> {
    const userId = `user:${id}`;
    const userData = await this.redis.get(userId);
    if (!userData) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return JSON.parse(userData);
  }


  // Buscar usuario por correo electrónico en Redis
  async findByEmail(email: string): Promise<User | null> {
    const userIds = await this.redis.smembers('user:ids'); // Obtener todos los IDs de usuario
    for (const userId of userIds) {
      const userData = await this.redis.get(userId);
      if (!userData) continue; // Salta si no hay datos para el ID

      const user = JSON.parse(userData);
      if (user && user.email === email) {
        return { id: userId.replace('user:', ''), ...user }; // Devuelve el usuario encontrado
      }
    }
    return null; // Devuelve null si no se encuentra el usuario
  }


  async update(id: string, user: Partial<User>): Promise<User> {
    const userId = `user:${id}`;
    const existingData = await this.redis.get(userId);

    if (!existingData) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updatedData = { ...JSON.parse(existingData), ...user };
    await this.redis.set(userId, JSON.stringify(updatedData));

    return updatedData as User;
  }


  async remove(id: string): Promise<User> {
    const userId = `user:${id}`;
    const userData = await this.redis.get(userId);

    if (!userData) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.redis.del(userId); // Elimina el usuario
    await this.redis.srem('user:ids', userId); // Elimina el ID del conjunto

    return JSON.parse(userData) as User;
  }

}
