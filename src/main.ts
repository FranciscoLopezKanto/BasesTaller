import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('API del taller base de datos')
    .setDescription('Documentación de la API del taller 1 base de datos')
    .setVersion('1.0')
    .addTag('miApi') // Puedes agregar etiquetas para organizar tus endpoints
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // La documentación estará disponible en /api

  await app.listen(3000);

}
bootstrap();
