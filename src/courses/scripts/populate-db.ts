import { connect } from 'mongoose';
import { Course, CourseSchema } from '../course.schema';

async function populateDB() {
  await connect(process.env.MONGODB_URI);

  const courseModel = Course;

  const newCourse = new courseModel({
    name: 'Curso de JavaScript',
    shortDescription: 'Aprende los fundamentos de JavaScript.',
    bannerImage: 'https://example.com/js-banner.jpg',
    mainImage: 'https://example.com/js-main.jpg',
    rating: 4.5,
    comments: [
      {
        author: 'John Doe',
        date: new Date(),
        title: 'Excelente curso',
        detail: 'Me encantó la manera en que explican los conceptos.',
        likes: 10,
        dislikes: 2,
      },
    ],
  });

  await newCourse.save();
  console.log('Base de datos poblada con datos de prueba.');
  process.exit();
}

populateDB().catch((error) => {
  console.error('Error al poblar la base de datos:', error);
  process.exit(1);
});
