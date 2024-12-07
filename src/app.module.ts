import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { CoursesModule } from './courses/courses.module';
import { UserModule } from './user/user.module';
import { AppRedisModule } from './redis.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AppRedisModule,
    AuthModule,
    MongooseModule.forRoot(process.env.MONGODB_URI),
    CoursesModule,
    UserModule,
  ],
})
export class AppModule {}
