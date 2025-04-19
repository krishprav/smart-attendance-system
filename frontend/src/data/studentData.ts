// Real student data for IIIT Senapati, Manipur (VI semester)
export interface Student {
  rollNumber: string;
  name: string;
  email: string;
  section: string;
  semester: string;
  program: string;
}

// Parse the section from roll number based on the provided ranges
const getSectionFromRollNumber = (rollNumber: string): string => {
  const rollNum = parseInt(rollNumber.substring(6));
  const programCode = rollNumber.substring(2, 6);
  
  // CSE Program (101)
  if (programCode === '0101') {
    if (rollNum >= 1 && rollNum <= 71) return 'A';
    if (rollNum >= 72 && rollNum <= 100) return 'B';
  }
  // CSE-AID Program (103)
  else if (programCode === '0103') {
    if (rollNum >= 1 && rollNum <= 40) return 'B';
  }
  // ECE Program (102)
  else if (programCode === '0102') {
    if (rollNum >= 1 && rollNum <= 56) return 'C';
    if (rollNum >= 57 && rollNum <= 78) return 'D';
  }
  // ECE-VLSI Program (104)
  else if (programCode === '0104') {
    if (rollNum >= 1 && rollNum <= 27) return 'D';
  }
  
  return 'Unknown';
};

// Get program from roll number
const getProgramFromRollNumber = (rollNumber: string): string => {
  const programCode = rollNumber.substring(2, 6);
  
  switch (programCode) {
    case '0101':
      return 'CSE';
    case '0103':
      return 'CSE-AID';
    case '0102':
      return 'ECE';
    case '0104':
      return 'ECE-VLSI';
    default:
      return 'Unknown';
  }
};

// Raw student data array
export const students: Student[] = [
  // CSE Section A (220101001 - 220101071)
  { rollNumber: "220101001", name: "TUSHAR NAVNEET", email: "tusharnavneet3@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101002", name: "ADITI KUMARI", email: "ajha88425@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101003", name: "AMAN MAURYA", email: "amanpratap224234@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101004", name: "AMIT RAJ", email: "amitraj21@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101005", name: "VIPUL KUMAR", email: "vipulmth2@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101006", name: "ABHINAV SINGH", email: "anubhav2004@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101007", name: "NIKHIL SINGH KATIYAR", email: "nikhilsinghk@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101009", name: "TAMALAMPUDI SAMEER REDDY", email: "sameerreddy213@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101010", name: "HARSH PARIHAR", email: "pariharharsh1234@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101011", name: "IMANDHI SRI HARSHA VARDHAN", email: "harsha0019@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101012", name: "HARINI PRIYANSHU ADIKE", email: "harinipa@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101013", name: "USMAN RASHID", email: "beingusman2003@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101014", name: "SAURABH SINGH RATHORE", email: "mohansingh13772@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101015", name: "PRIYA KUMARI", email: "sanjupriya004@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101016", name: "SAURABH YADAV", email: "saurabhrksss2@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101017", name: "LAKSHAY", email: "lakshaygarg9812@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101018", name: "S THIRUPATHI", email: "gopalnayak934@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101019", name: "ANKIT MEEL", email: "ankitmeel.gopal@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101020", name: "HARSH VARDHAN", email: "vardhanharsh241@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101021", name: "KAGITHA SOWJANYA", email: "sowjanyakagitha3299@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101022", name: "ABHINAV KUMAR YADAV", email: "rajksyadav2@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101023", name: "DEEPANSHU SINGH GAUTAM", email: "gautamds376@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101024", name: "CHAUDHARY SHUBHAM SANIDHYA", email: "cssanidhya@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101025", name: "BALKISHAN BAJPAY", email: "bkbajpay0609@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101026", name: "VELAMALA LOHITH", email: "velamalanarayanarao9909@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101027", name: "ANAND SINHA", email: "anandsinha433@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101028", name: "AYUSH PANDEY", email: "kp832176@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101029", name: "PRATHAMESH S VADATILLE", email: "prathameshsvadatille@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101030", name: "SHASHI BHUSHAN KUMAR", email: "shashi847305@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101031", name: "MATUKUMALLI HEMA MALA", email: "mathukumalihemamala@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101032", name: "RAM ASHISH YADAV", email: "ray09112004@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101033", name: "MURSHID AALAM N C", email: "drfameesha76@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101034", name: "HARSH KUMAR DAS", email: "das.harsh21@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101035", name: "PUNARVASU", email: "punarvasuingole72@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101036", name: "ANKIT KUMAR", email: "KUMAR.ANKITR0321@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101037", name: "DIVYANSH GUPTA", email: "divyansh99@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101038", name: "SHREEDHAR ANAND", email: "shreedharanandji@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101039", name: "YASH VERMA", email: "yashverma@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101040", name: "VIKRAM", email: "pooniavikram348@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101041", name: "RAHUL", email: "gkjajoria76@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101042", name: "KATTA HITESH", email: "hiteshkatta999@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101043", name: "AMARJEET KUMAR", email: "amarjeetkumaramar133@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101044", name: "AKASH RAJ", email: "gopakash74@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101045", name: "PANGI ANIL KUMAR", email: "aniltejanil035@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101046", name: "PRATEEK KUMAR", email: "kprateek283@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101047", name: "RAJESH KUMAR YADAV", email: "yrajeshkumar799@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101048", name: "ALOK", email: "waynerooney0089@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101049", name: "SOHAIL AHMAD", email: "rahmathussain446@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101050", name: "RAMAVATH HARIKA", email: "hariramavath1970@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101051", name: "RAHUL GOGRA", email: "rgogra914@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101052", name: "VISHAL SRINIVASAN", email: "100420vishalsrinivasan.gbkm@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101053", name: "ADITI VIDYARTHI", email: "vidyarthiaditi1911@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101054", name: "BONTHU SALIENT JOYPHUR", email: "pradaj851@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101055", name: "ROUTHU SIDDHARTHA", email: "venkataratnamrouthu5@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101056", name: "MEDARI SHASHI KIRAN", email: "thirumaladoni@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" },
  { rollNumber: "220101057", name: "APPANI NIRANJAN", email: "appanisrinivassrinivas@iiitmanipur.ac.in", section: "A", semester: "VI", program: "CSE" }
];

// Helper function to get students by program and section
export const getStudentsBySection = (section: string): Student[] => {
  return students.filter(student => student.section === section);
};

export const getStudentsByProgram = (program: string): Student[] => {
  return students.filter(student => student.program === program);
};

export default {
  students,
  getStudentsBySection,
  getStudentsByProgram
};
