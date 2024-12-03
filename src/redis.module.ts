import { Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [
    RedisModule.forRoot({
        url: `redis://${process.env.REDIS_HOST || 'localhost'}:${parseInt(process.env.REDIS_PORT, 10) || 6379}`,
        type: 'single'
    }),
  ],
  exports: [AppRedisModule],
})
export class AppRedisModule {}
