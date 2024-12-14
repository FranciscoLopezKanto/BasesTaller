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
        cursosInscritos: [], // Inicialmente vacío
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

    const courses = [];
    for (let i = 1; i <= 20; i++) {
      const courseId = `course:${i}`; // Clave única para cada curso
      const course = {
        name: `Course ${i}`,
        shortDescription: `Short description for Course ${i}`,
        bannerImage: `bannerImage${i}.png`,
        mainImage: `mainImage${i}.png`,
        rating: Math.floor(Math.random() * 6), // Rating aleatorio entre 0 y 5
        creatorId: users[Math.floor(Math.random() * users.length)], // Asignar un creador aleatorio de los usuarios
        comments: [], // Inicialmente vacío
        UsersInscritos: [] // Usuarios inscritos
      };

      // Guardar curso en Redis como un string JSON
      await redis.set(courseId, JSON.stringify(course));
      courses.push(courseId);  // Almacenar la clave

      // Decidir aleatoriamente si agregar alumnos al curso
      if (Math.random() > 0.5) {
        const numStudents = Math.floor(Math.random() * 3) + 1; // 1-3 estudiantes por curso
        for (let j = 0; j < numStudents; j++) {
          const studentId = users[Math.floor(Math.random() * users.length)];
          const fechaInscripcion = new Date();

          // Actualizar el usuario con el curso inscrito
          const user = JSON.parse(await redis.get(studentId)); // Obtener el usuario de Redis
          user.cursosInscritos.push({
            idCurso: courseId,
            fechaInscripcion: fechaInscripcion,
          });

          // Actualizar el usuario en Redis
          await redis.set(studentId, JSON.stringify(user));

          // Agregar al curso los estudiantes
          const courseData = JSON.parse(await redis.get(courseId)); // Obtener el curso de Redis
          courseData.UsersInscritos.push({
            idUser: studentId,
            fechaInscripcion: fechaInscripcion,
          });

          // Actualizar el curso en Redis
          await redis.set(courseId, JSON.stringify(courseData));

          // Crear relación entre estudiante y curso en Neo4j
          await session.run(
            'MATCH (u:User {id: $userId}), (c:Course {id: $courseId}) ' +
            'CREATE (u)-[:ENROLLED_IN]->(c)',
            { userId: studentId, courseId: courseId }
          );
        }
      }
    }

    console.log(`${courses.length} courses saved`);

    await session.close();
    console.log("Neo4j session closed");

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
