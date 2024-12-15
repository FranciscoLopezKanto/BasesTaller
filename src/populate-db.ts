const Redis = require('ioredis');
const neo4j = require('neo4j-driver').v1;
const redis = new Redis('redis://nestjs-redis:6379'); // Usar el nombre del servicio de Redis en Docker

const neo4jDriver = neo4j.driver(
  'bolt://neo4j:7687',
  neo4j.auth.basic('neo4j', 'password1234') // Credenciales de Neo4j
);

async function populateDB() {
  console.log("STARTING SCRIPT");

  try {
    // Conectar a Neo4j
    const session = neo4jDriver.session();

    // Limpiar Redis y Neo4j
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

      // Crear nodo de usuario en Neo4j
      await session.run('CREATE (u:User {id: $id, nombre: $nombre, email: $email})', {
        id: userId,
        nombre: `User ${i}`,
        email: `user${i}@example.com`
      });
    }

    console.log(`${users.length} users saved`);

    // Crear cursos
    console.log("***********creating courses*********");

  } catch (error) {
    console.error("Error al poblar Redis y Neo4j:", error);
  } finally {
    // Cerrar la conexión a Redis
    await redis.quit();
    console.log("Redis connection closed");
    console.log("SCRIPT FINISHED");
  }
}

// Ejecutar la función de poblamiento
populateDB();
