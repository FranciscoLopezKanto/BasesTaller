import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({
    description: 'Credenciales de usuario',
    schema: { example: { email: 'user@example.com', password: 'password123' } },
  })
  async login(@Body() loginData: { email: string; password: string }) {
    return this.authService.login(loginData);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiBody({
    description: 'Datos de registro',
    schema: {
      example: { name: 'John Doe', email: 'user@example.com', password: 'password123' },
    },
  })
  async register(@Body() registerData: { name: string; email: string; password: string }) {
    return this.authService.register(registerData);
  }
}
