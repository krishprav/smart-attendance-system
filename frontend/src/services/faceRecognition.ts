import { students } from '@/data/studentData';

// Interface for face matching results
export interface FaceMatchResult {
  studentId: string;
  confidence: number;
  timestamp: string;
}

// Simulate face recognition with the student database
export const recognizeFaces = async (imageSrc: string): Promise<FaceMatchResult[]> => {
  // In a real implementation, this would call a face recognition API
  // For demo purposes, we'll simulate matching with a specific subset of students

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Get students with registered faces (in a real app, this would be from the database)
  // For demo, we'll assume students with roll numbers ending in 1, 3, 5, 7, 9 have registered faces
  const studentsWithRegisteredFaces = students.filter(student =>
    parseInt(student.rollNumber.slice(-1)) % 2 === 1
  );

  // Simulate that only 70-90% of registered students are successfully recognized
  const recognitionRate = 0.7 + Math.random() * 0.2; // 70-90%
  const matchCount = Math.floor(studentsWithRegisteredFaces.length * recognitionRate);

  // Shuffle the students array and take the first matchCount elements
  const shuffledStudents = [...studentsWithRegisteredFaces].sort(() => 0.5 - Math.random());
  const matchedStudents = shuffledStudents.slice(0, matchCount);

  console.log(`Face recognition: ${matchedStudents.length} students recognized out of ${studentsWithRegisteredFaces.length} with registered faces`);

  // Create match results
  const results: FaceMatchResult[] = matchedStudents.map(student => ({
    studentId: student.rollNumber,
    confidence: Math.random() * 30 + 70, // Random confidence between 70-100%
    timestamp: new Date().toISOString()
  }));

  return results;
};

// Function to match a single face
export const matchFace = async (faceImage: string, studentId: string): Promise<FaceMatchResult | null> => {
  // In a real implementation, this would compare the face with a specific student
  // For demo purposes, we'll simulate a match with 90% probability

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const isMatch = Math.random() > 0.1; // 90% chance of matching

  if (isMatch) {
    return {
      studentId,
      confidence: Math.random() * 20 + 80, // Random confidence between 80-100%
      timestamp: new Date().toISOString()
    };
  }

  return null;
};

// Function to detect faces in an image
export const detectFaces = async (imageSrc: string): Promise<number> => {
  // In a real implementation, this would use a face detection API
  // For demo purposes, we'll simulate detecting a random number of faces

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Return a random number of faces (between 10-30)
  return Math.floor(Math.random() * 20) + 10;
};
