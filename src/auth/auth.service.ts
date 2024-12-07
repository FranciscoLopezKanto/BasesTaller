import { Injectable, ConflictException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    throw new ConflictException('Credenciales inválidas');
  }

  async login(loginData: { email: string; password: string }) {
    const user = await this.validateUser(loginData.email, loginData.password);
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerData: { name: string; email: string; password: string }) {
    // Verificar si el usuario ya existe
    const existingUser = await this.userService.findByEmail(registerData.email);
    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }

    // Crear un nuevo usuario
    const hashedPassword = await bcrypt.hash(registerData.password, 10);
    const newUser = await this.userService.create({
      ...registerData,
      password: hashedPassword,
    });

    // Generar el token JWT
    const payload = { email: newUser.email, sub: newUser.id };
    return {
      message: 'Usuario registrado exitosamente',
      access_token: this.jwtService.sign(payload),
    };
  }
}
