import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    UserModule,    // Para acceder a UserService
    PassportModule,
    JwtModule.register({
      secret: 'your_jwt_secret', // Cambiar a una variable de entorno
      signOptions: { expiresIn: '1h' }, // Expiración del token
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
