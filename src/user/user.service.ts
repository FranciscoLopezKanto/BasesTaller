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
  ) {}

  // Crear usuario tanto en Mongoose como en Redis
  async create(user: Partial<User>): Promise<User> {
    // Guardar en MongoDB
    const newUser = new this.userModel(user);
    const savedUser = await newUser.save();

    // Guardar en Redis
    const userId = `user:${savedUser._id}`; // Usar el ID generado por MongoDB
    const userData = { ...savedUser.toObject(), courses: [] };
    await this.redis.set(userId, JSON.stringify(userData));
    await this.redis.sadd('user:ids', userId);

    return savedUser;
  }

  // Obtener todos los usuarios desde MongoDB
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  // Obtener un usuario por ID desde MongoDB
  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // Buscar usuario por correo electrónico en Redis
  async findByEmail(email: string) {
    const userIds = await this.redis.smembers('user:ids'); // Obtener todos los IDs de usuario
    for (const userId of userIds) {
      const user = JSON.parse(await this.redis.get(userId));
      if (user && user.email === email) {
        return { id: userId.replace('user:', ''), ...user }; // Quitar prefijo del ID
      }
    }
    throw new NotFoundException(`User with email ${email} not found`);
  }

  // Actualizar usuario en MongoDB
  async update(id: string, user: Partial<User>): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, user, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Actualizar también en Redis
    const userId = `user:${id}`;
    const existingData = JSON.parse(await this.redis.get(userId));
    if (existingData) {
      const updatedData = { ...existingData, ...user };
      await this.redis.set(userId, JSON.stringify(updatedData));
    }

    return updatedUser;
  }

  // Eliminar usuario de MongoDB y Redis
  async remove(id: string): Promise<User> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Eliminar también en Redis
    const userId = `user:${id}`;
    await this.redis.del(userId);
    await this.redis.srem('user:ids', userId);

    return deletedUser;
  }
}
