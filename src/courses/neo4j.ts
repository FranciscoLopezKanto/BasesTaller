import neo4j from 'neo4j-driver';

export const neo4jDriver = neo4j.driver(
  'bolt://localhost:7687', // Cambia al host de tu base de datos
  neo4j.auth.basic('neo4j', 'tu-contraseña') 
);
