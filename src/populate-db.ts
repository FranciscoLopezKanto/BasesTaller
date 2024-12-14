const Redis = require('ioredis');
const redis = new Redis('redis://nestjs-redis:6379'); // Usar el nombre del servicio de Redis en Docker

async function populateDB() {
  console.log("STARTING SCRIPT");

  try {
    // Limpiar la base de datos
    await redis.flushall();
    console.log("Redis database cleared");

    // Crear usuarios
    console.log("***********creating users*********");

    const users = [];
    for (let i = 1; i <= 10; i++) {
      const userId = `user:${i}`;  // Clave única para cada usuario
      const user = {
        nombre: `User ${i}`,
        email: `user${i}@example.com`,
      };
      // Guardar en Redis como un string JSON
      await redis.set(userId, JSON.stringify(user));
      users.push(userId);  // Almacenar la clave
    }

    console.log(`${users.length} users saved`);

    // Crear cursos
    console.log("***********creating courses*********");

  } catch (error) {
    console.error("Error al poblar Redis:", error);
  } finally {
    // Cerrar la conexión a Redis
    await redis.quit();
    console.log("SCRIPT FINISHED");
  }
}

// Ejecutar la función de poblamiento
populateDB();
