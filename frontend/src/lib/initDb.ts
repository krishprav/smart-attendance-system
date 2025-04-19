// Database initialization script
import fs from 'fs';
import path from 'path';
import { query, testConnection } from './db';
import { students } from '../data/studentData';
import { courses } from '../data/courseData';

// Initialize the database with schema and seed data
export async function initializeDatabase() {
  try {
    // Test the database connection
    const connected = await testConnection();
    if (!connected) {
      console.error('Failed to connect to the database. Please check your configuration.');
      return false;
    }

    // Read and execute the schema SQL
    const schemaPath = path.join(process.cwd(), 'src', 'lib', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements and execute them
    const statements = schemaSql.split(';').filter(stmt => stmt.trim().length > 0);
    for (const statement of statements) {
      await query(statement + ';');
    }
    
    console.log('Database schema created successfully');
    
    // Seed the database with initial data
    await seedDatabase();
    
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

// Seed the database with initial data
async function seedDatabase() {
  try {
    // Check if students table is empty
    const studentsResult = await query('SELECT COUNT(*) FROM students');
    if (parseInt(studentsResult.rows[0].count) === 0) {
      console.log('Seeding students table...');
      
      // Insert students from studentData.ts
      for (const student of students) {
        await query(
          'INSERT INTO students (roll_number, name, email, section, semester, program) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (roll_number) DO NOTHING',
          [student.rollNumber, student.name, student.email, student.section, student.semester, student.program]
        );
      }
      
      console.log(`Inserted ${students.length} students`);
    } else {
      console.log('Students table already has data, skipping seed');
    }
    
    // Check if courses table is empty
    const coursesResult = await query('SELECT COUNT(*) FROM courses');
    if (parseInt(coursesResult.rows[0].count) === 0) {
      console.log('Seeding courses table...');
      
      // Insert courses from courseData.ts
      for (const course of courses) {
        await query(
          'INSERT INTO courses (code, title, description, semester, program) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (code) DO NOTHING',
          [course.code, course.title, course.description || '', course.semester || 'VI', course.program || 'CSE']
        );
      }
      
      console.log(`Inserted ${courses.length} courses`);
    } else {
      console.log('Courses table already has data, skipping seed');
    }
    
    // Seed faculty data
    const facultyResult = await query('SELECT COUNT(*) FROM faculty');
    if (parseInt(facultyResult.rows[0].count) === 0) {
      console.log('Seeding faculty table...');
      
      const facultyData = [
        { name: 'Dr. Kabita Thaoroijam', email: 'kabita@iiitmanipur.ac.in', department: 'CSE' },
        { name: 'Dr. Soibam Joydeep Singh', email: 'joydeep@iiitmanipur.ac.in', department: 'CSE' },
        { name: 'Dr. Yumnam Kirani Singh', email: 'kirani@iiitmanipur.ac.in', department: 'ECE' },
        { name: 'Dr. Th. Shantikumar Singh', email: 'shanti@iiitmanipur.ac.in', department: 'ECE' },
        { name: 'Dr. Potsangbam Bidyapati Devi', email: 'bidyapati@iiitmanipur.ac.in', department: 'CSE' }
      ];
      
      for (const faculty of facultyData) {
        await query(
          'INSERT INTO faculty (name, email, department) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING',
          [faculty.name, faculty.email, faculty.department]
        );
      }
      
      console.log(`Inserted ${facultyData.length} faculty members`);
    } else {
      console.log('Faculty table already has data, skipping seed');
    }
    
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
}

// Export the initialization function
export default {
  initializeDatabase,
  seedDatabase
};
