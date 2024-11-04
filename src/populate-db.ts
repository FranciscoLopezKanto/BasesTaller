

// Script que se encarga de poblar la base de datos

// Importar las dependencias necesarias
const MongoClient = require('mongodb').MongoClient;

// URL de conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nestjs';

// Función principal para poblar la base de datos
async function populateDB() {
  console.log("STARTING SCRIPT");
  
  // Conectar a la base de datos
  const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db('nestjs'); // Nombre de la base de datos

    // Limpiar la base de datos si existe algo antes
    await db.dropDatabase();
    console.log("Database dropped");

    // Crear colecciones
    const usersCollection = db.collection('users');
    const coursesCollection = db.collection('courses');

    // Crear usuarios
    console.log("***********creating users*********");

    const users = [];
    for (let i = 1; i <= 10; i++) {
      users.push({
        _id: i.toString(), // ID como string
        nombre: `User ${i}`,
        email: `user${i}@example.com`,
        cursosInscritos: [], // Campo para cursos inscritos, inicialmente vacío
      });
    }

    // Guardar usuarios en la base de datos
    console.log("***********saving users*********");
    await usersCollection.insertMany(users);
    console.log(`${users.length} users saved`);

    // Crear cursos
    console.log("***********creating courses*********");

    const courses = [];
    for (let i = 1; i <= 20; i++) {
      // Asignar un creador aleatorio de los usuarios
      const creatorId = users[Math.floor(Math.random() * users.length)]._id;

      const course = {
        _id: i.toString(), // ID como string
        name: `Course ${i}`,
        shortDescription: `Short description for Course ${i}`,
        bannerImage: `bannerImage${i}.png`,
        mainImage: `mainImage${i}.png`,
        rating: Math.floor(Math.random() * 6), // Rating aleatorio entre 0 y 5
        creatorId: creatorId, // ID del creador
        comments: [], // Inicialmente vacío
        UsersInscritos: []
      };

      // Decide aleatoriamente si agregar alumnos al curso
      if (Math.random() > 0.5) {
        // Asignar aleatoriamente a 1-3 alumnos a este curso
        const numStudents = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < numStudents; j++) {
          const studentId = users[Math.floor(Math.random() * users.length)]._id;
          const fechaInscripcion = new Date(); // Puedes ajustar la fecha si es necesario

          // Agregar el curso al alumno
          const userIndex = users.findIndex(user => user._id === studentId);
          users[userIndex].cursosInscritos.push({
            idCurso: course._id,
            fechaInscripcion: fechaInscripcion,
          });

          // Agregar el estudiante a los cursosInscritos
          course.UsersInscritos.push({
            idUser: studentId,
            fechaInscripcion: fechaInscripcion,
          });
        }
      }

      courses.push(course);
    }

    // Guardar cursos en la base de datos
    console.log("***********saving courses*********");
    await coursesCollection.insertMany(courses);
    console.log(`${courses.length} courses saved`);

    // Actualizar los usuarios con los cursos inscritos
    await usersCollection.insertMany(users.map(user => ({ _id: user._id, cursosInscritos: user.cursosInscritos })));
    console.log("Users updated with courses inscriptions");

  } catch (error) {
    console.error("Error al poblar la base de datos:", error);
  } finally {
    // Desconectar de la base de datos
    await client.close();
    console.log("SCRIPT FINISHED");
  }
}

// Ejecutar la función de poblamiento
populateDB();