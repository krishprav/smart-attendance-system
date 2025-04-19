// Course interface definition
export interface Course {
  code: string;
  title: string;
  credits: number;
  instructors: string[];
  sections: string[];
  semester: string;
  program: string;
}

// Real course data from IIIT Senapati, Manipur Jan-May 2025 Session (Pages 4-7 of the PDF)
export const courses: Course[] = [
  // SEMESTER II (All programs)
  {
    code: "MA1012",
    title: "Engineering Mathematics II",
    credits: 4,
    instructors: ["Dr Kamalesh Kumar", "Dr. Pragnya Das", "Dr Sanjib Choudhury"],
    sections: ["A", "B", "C", "D"],
    semester: "II",
    program: "All"
  },
  {
    code: "CS1012",
    title: "Data Structures",
    credits: 3,
    instructors: ["Dr. Kabita Thaoroijam", "Dr N Kishorjit Singh"],
    sections: ["A", "B", "C", "D"],
    semester: "II",
    program: "All"
  },
  {
    code: "CS1112",
    title: "Data Structures Lab",
    credits: 1,
    instructors: ["Dr. Kabita Thaoroijam", "Dr. Kh. Motilal Singh", "Dr N Kishorjit Singh"],
    sections: ["A", "B", "C", "D"],
    semester: "II",
    program: "All"
  },
  {
    code: "EC1013",
    title: "Basic Electronic Circuits",
    credits: 3,
    instructors: ["Dr. Nagesh Ch", "Dr. N. Monica Devi"],
    sections: ["A", "B", "C", "D"],
    semester: "II",
    program: "All"
  },
  {
    code: "EC1112",
    title: "Basic Electronics Lab",
    credits: 1,
    instructors: ["Dr, Nagesh Ch", "Mrs. Kanchana Katta", "Mrs. Ranita Khumukcham", "Dr. N Monica Devi"],
    sections: ["A", "B", "C", "D"],
    semester: "II",
    program: "All"
  },
  {
    code: "PH1012",
    title: "Engineering Physics II",
    credits: 3,
    instructors: ["Dr L Pradipkanti Devi"],
    sections: ["A", "B", "C", "D"],
    semester: "II",
    program: "All"
  },
  {
    code: "HS1091",
    title: "Introduction to Entrepreneurship",
    credits: 3,
    instructors: ["Dr Akoijam Malemnganbi"],
    sections: ["A", "B", "C", "D"],
    semester: "II",
    program: "All"
  },
  {
    code: "EN1012",
    title: "English Language Skills II",
    credits: 3,
    instructors: ["Dr L Sarbajit Singh", "Dr Akoijam Malemnganbi"],
    sections: ["A", "B", "C", "D"],
    semester: "II",
    program: "All"
  },
  {
    code: "KO1012",
    title: "Korean Language Skills II",
    credits: 3,
    instructors: ["Dr Minjae Park"],
    sections: ["Selected Students"],
    semester: "II",
    program: "All"
  },

  // SEMESTER IV (CSE & CSE-AID)
  {
    code: "CS2021",
    title: "Discrete Mathematics",
    credits: 3,
    instructors: ["Dr. Pragnya Das"],
    sections: ["A", "B"],
    semester: "IV",
    program: "CSE & CSE-AID"
  },
  {
    code: "CS2022",
    title: "Theory of Computing",
    credits: 3,
    instructors: ["Dr. Kh. Motilal Singh"],
    sections: ["A", "B"],
    semester: "IV",
    program: "CSE & CSE-AID"
  },
  {
    code: "CS2042",
    title: "Software Engineering",
    credits: 4,
    instructors: ["Dr. S. Chanu Inunganbi"],
    sections: ["A", "B"],
    semester: "IV",
    program: "CSE & CSE-AID"
  },
  {
    code: "CS2043",
    title: "Database Management Systems",
    credits: 3,
    instructors: ["Dr. Navanath Saharia"],
    sections: ["A", "B"],
    semester: "IV",
    program: "CSE & CSE-AID"
  },
  {
    code: "CS2141",
    title: "Operating Systems Lab",
    credits: 1,
    instructors: ["Dr. R Bidyalakshmi Devi"],
    sections: ["A", "B"],
    semester: "IV",
    program: "CSE & CSE-AID"
  },
  {
    code: "CS2143",
    title: "Database Management Systems Lab",
    credits: 1,
    instructors: ["Dr. Navanath Saharia"],
    sections: ["A", "B"],
    semester: "IV",
    program: "CSE & CSE-AID"
  },
  {
    code: "CS2041",
    title: "Operating Systems",
    credits: 3,
    instructors: ["Dr. R Bidyalakshmi Devi"],
    sections: ["A", "B"],
    semester: "IV",
    program: "CSE & CSE-AID"
  },
  {
    code: "CS2051",
    title: "Artificial Intelligence",
    credits: 3,
    instructors: ["Dr. S. Chanu Inunganbi"],
    sections: ["A", "B"],
    semester: "IV",
    program: "CSE & CSE-AID"
  },

  // SEMESTER IV (ECE & ECE-VLSI)
  {
    code: "EC2014",
    title: "Electromagnetic Theory",
    credits: 3,
    instructors: ["Dr. Subasit Borah"],
    sections: ["C", "D"],
    semester: "IV",
    program: "ECE & ECE-VLSI"
  },
  {
    code: "EC2042",
    title: "Principles of Communication",
    credits: 3,
    instructors: ["Dr. Ramesh Ch. Mishra"],
    sections: ["C", "D"],
    semester: "IV",
    program: "ECE & ECE-VLSI"
  },
  {
    code: "EC2114",
    title: "Principles of Communication Lab",
    credits: 1,
    instructors: ["Dr. Ramesh Ch. Mishra", "Mrs. Ranita Khumukcham"],
    sections: ["C", "D"],
    semester: "IV",
    program: "ECE & ECE-VLSI"
  },
  {
    code: "EC2032",
    title: "Digital Signal Processing",
    credits: 3,
    instructors: ["Dr. Chittotosh Ganguly", "Dr. Subasit Borah"],
    sections: ["C", "D"],
    semester: "IV",
    program: "ECE & ECE-VLSI"
  },
  {
    code: "EC2132",
    title: "Digital Signal Processing Lab",
    credits: 1,
    instructors: ["Dr. Chittotosh Ganguly", "Mrs. Kanchana Katta", "Dr. Subasit Borah"],
    sections: ["C", "D"],
    semester: "IV",
    program: "ECE & ECE-VLSI"
  },
  {
    code: "EC2082",
    title: "Measurement and Instrumentation",
    credits: 3,
    instructors: ["Dr. Chittotosh Ganguly"],
    sections: ["C", "D"],
    semester: "IV",
    program: "ECE & ECE-VLSI"
  },
  {
    code: "CS2041",
    title: "Operating Systems",
    credits: 3,
    instructors: ["Dr. R Bidyalakshmi Devi"],
    sections: ["C", "D"],
    semester: "IV",
    program: "ECE & ECE-VLSI"
  },
  {
    code: "CS2141",
    title: "Operating Systems Lab",
    credits: 1,
    instructors: ["Dr. S. Chanu Inunganbi"],
    sections: ["C", "D"],
    semester: "IV",
    program: "ECE & ECE-VLSI"
  },
  {
    code: "EC2081",
    title: "Control Systems",
    credits: 4,
    instructors: ["Dr. N. Monica Devi"],
    sections: ["C", "D"],
    semester: "IV",
    program: "ECE & ECE-VLSI"
  },

  // SEMESTER VI (CSE)
  {
    code: "CS3071",
    title: "Computer Graphics",
    credits: 8,
    instructors: ["Mrs. Shrungashri Chaudhari"],
    sections: ["A", "B"],
    semester: "VI",
    program: "CSE"
  },
  {
    code: "CS3053",
    title: "Statistical Machine Learning",
    credits: 6,
    instructors: ["Dr. Kabita Thaoroijam"],
    sections: ["CSE Program"],
    semester: "VI",
    program: "CSE"
  },
  {
    code: "CS3033",
    title: "Cyber Security",
    credits: 6,
    instructors: ["Dr. Kh. Motilal Singh"],
    sections: ["A", "B"],  // Section A: 220101001-220101071, Section B: 220101071-22010100 && 220103001-220103040
    semester: "VI",
    program: "CSE"
  },
  {
    code: "CS3059",
    title: "Natural Language Processing",
    credits: 6,
    instructors: ["Dr. Navanath Saharia"],
    sections: ["A", "B"],  // Section A: 220101001-220101071, Section B: 220101071-22010100 && 220103001-220103040
    semester: "VI",
    program: "CSE"
  },
  {
    code: "OE3036",
    title: "Blockchain and its Applications",
    credits: 6,
    instructors: ["Float through SWAYAM", "Coordinator: Dr. S. Chanu Inunganbi"],
    sections: ["A", "B"],
    semester: "VI",
    program: "CSE"
  },
  {
    code: "OE3083",
    title: "Data Analytics with Python",
    credits: 6,
    instructors: ["Coordinator: Dr. S. Chanu Inunganbi"],
    sections: ["A", "B"],
    semester: "VI",
    program: "CSE"
  },
  {
    code: "CS3023",
    title: "Optimization Techniques",
    credits: 6,
    instructors: ["Dr Kamalesh Kumar"],
    sections: ["A", "B"],
    semester: "VI",
    program: "CSE"
  },
  {
    code: "HS3093",
    title: "Constitution Law and Public Administration in India",
    credits: 6,
    instructors: ["Float through SWAYAM", "Coordinator: Dr. Lairenjam Pradipkanti Devi"],
    sections: ["A", "B"],
    semester: "VI",
    program: "CSE"
  },
  {
    code: "HS3092",
    title: "Employability Skills",
    credits: 0,
    instructors: ["Float through SWAYAM", "Coordinator: Dr. Akoijam Malemnganbi"],
    sections: ["A", "B"],
    semester: "VI",
    program: "CSE"
  },
  {
    code: "CS3202",
    title: "Project - II",
    credits: 4,
    instructors: ["Coordinator: Dr. R Bidyalakshmi Devi"],
    sections: ["A", "B"],
    semester: "VI",
    program: "CSE"
  },

  // SEMESTER VI (CSE-AID)
  {
    code: "CS3071",
    title: "Computer Graphics",
    credits: 8,
    instructors: ["Mrs. Shrungashri Chaudhari"],
    sections: ["B"],  // Section B: 220101071-22010100 && 220103001-220103040
    semester: "VI",
    program: "CSE-AID"
  },
  {
    code: "CS3052",
    title: "Machine Learning - I",
    credits: 6,
    instructors: ["Dr. Kabita Thaoroijam"],
    sections: ["CSE-AID Program"],
    semester: "VI",
    program: "CSE-AID"
  },
  {
    code: "CS3033",
    title: "Cyber Security",
    credits: 6,
    instructors: ["Dr. Kh. Motilal Singh"],
    sections: ["A", "B"],
    semester: "VI",
    program: "CSE-AID"
  },
  {
    code: "CS3059",
    title: "Natural Language Processing",
    credits: 6,
    instructors: ["Dr. Navanath Saharia"],
    sections: ["A", "B"],
    semester: "VI",
    program: "CSE-AID"
  },
  {
    code: "OE3036",
    title: "Blockchain and its Applications",
    credits: 6,
    instructors: ["Float through SWAYAM", "Coordinator: Dr. S. Chanu Inunganbi"],
    sections: ["CSE-AID Program"],
    semester: "VI",
    program: "CSE-AID"
  },
  {
    code: "OE3083",
    title: "Data Analytics with Python",
    credits: 6,
    instructors: ["Coordinator: Dr. S. Chanu Inunganbi"],
    sections: ["CSE-AID Program"],
    semester: "VI",
    program: "CSE-AID"
  },
  {
    code: "CS3023",
    title: "Optimization Techniques",
    credits: 6,
    instructors: ["Dr Kamalesh Kumar"],
    sections: ["A", "B"],
    semester: "VI",
    program: "CSE-AID"
  },
  {
    code: "HS3093",
    title: "Constitution Law and Public Administration in India",
    credits: 6,
    instructors: ["Float through SWAYAM", "Coordinator: Dr. Lairenjam Pradipkanti Devi"],
    sections: ["A", "B"],
    semester: "VI",
    program: "CSE-AID"
  },
  {
    code: "HS3092",
    title: "Employability Skills",
    credits: 0,
    instructors: ["Float through SWAYAM", "Coordinator: Dr. Akoijam Malemnganbi"],
    sections: ["A", "B"],
    semester: "VI",
    program: "CSE-AID"
  },
  {
    code: "CS3202",
    title: "Project - II",
    credits: 4,
    instructors: ["Coordinator: Dr. R Bidyalakshmi Devi"],
    sections: ["A", "B"],
    semester: "VI",
    program: "CSE-AID"
  },

  // SEMESTER VI (ECE)
  {
    code: "EC3033",
    title: "Information Theory and Coding",
    credits: 6,
    instructors: ["Dr. Ramesh Ch. Mishra"],
    sections: ["C", "D"],
    semester: "VI",
    program: "ECE"
  },
  {
    code: "EC3072",
    title: "Embedded Systems",
    credits: 6,
    instructors: ["Dr. Heigrujam Manas Singh"],
    sections: ["C", "D"],
    semester: "VI",
    program: "ECE"
  },
  {
    code: "EC3172",
    title: "Embedded Systems Lab",
    credits: 3,
    instructors: ["Dr. Heigrujam Manas Singh"],
    sections: ["C", "D"],
    semester: "VI",
    program: "ECE"
  },
  {
    code: "EC3061",
    title: "Microwave Engineering",
    credits: 6,
    instructors: ["Dr. Subasit Borah"],
    sections: ["ECE Program"],
    semester: "VI",
    program: "ECE"
  },
  {
    code: "EC3161",
    title: "Microwave Engineering Lab",
    credits: 3,
    instructors: ["Dr. Subasit Borah", "Mrs. Ranita Khumukcham"],
    sections: ["ECE Program"],
    semester: "VI",
    program: "ECE"
  },
  {
    code: "OE3052",
    title: "Deep Learning",
    credits: 6,
    instructors: ["Float through SWAYAM", "Coordinator: Dr. N. Monica Devi"],
    sections: ["C", "D"],
    semester: "VI",
    program: "ECE"
  },
  {
    code: "OE3036",
    title: "Blockchain and its Applications",
    credits: 6,
    instructors: ["Float through SWAYAM", "Coordinator: Dr. N. Monica Devi"],
    sections: ["C", "D"],
    semester: "VI",
    program: "ECE"
  },
  {
    code: "OE3053",
    title: "Introduction to Machine Learning",
    credits: 6,
    instructors: ["Float through SWAYAM", "Coordinator: Dr. N. Monica Devi"],
    sections: ["C", "D"],
    semester: "VI",
    program: "ECE"
  },
  {
    code: "EC3046",
    title: "Communication Network",
    credits: 6,
    instructors: ["Dr. Chittotosh Ganguly"],
    sections: ["ECE Program"],
    semester: "VI",
    program: "ECE"
  },
  {
    code: "HS3092",
    title: "Employability Skills",
    credits: 0,
    instructors: ["Float through SWAYAM", "Coordinator: Dr. Akoijam Malemnganbi"],
    sections: ["C", "D"],
    semester: "VI",
    program: "ECE"
  },
  {
    code: "EC3201",
    title: "Minor Project",
    credits: 4,
    instructors: ["Dr. Ramesh Ch. Mishra"],
    sections: ["ECE Program"],
    semester: "VI",
    program: "ECE"
  },
  {
    code: "HS3093",
    title: "Constitution Law and Public Administration in India",
    credits: 6,
    instructors: ["Float through SWAYAM", "Coordinator: Dr. Lairenjam Pradipkanti Devi"],
    sections: ["C", "D"],
    semester: "VI",
    program: "ECE"
  },

  // SEMESTER VI (ECE-VLSI)
  {
    code: "EC3054",
    title: "HDL based Digital System Design",
    credits: 6,
    instructors: ["Dr. Nagesh Ch"],
    sections: ["ECE-VLSI Program"],
    semester: "VI",
    program: "ECE-VLSI"
  },
  {
    code: "EC3153",
    title: "Verilog Design Lab",
    credits: 3,
    instructors: ["Dr. H. Manas Singh", "Mrs Kanchana Katta"],
    sections: ["ECE-VLSI Program"],
    semester: "VI",
    program: "ECE-VLSI"
  },
  {
    code: "EC3072",
    title: "Embedded Systems",
    credits: 6,
    instructors: ["Dr. Heigrujam Manas Singh"],
    sections: ["C", "D"],
    semester: "VI",
    program: "ECE-VLSI"
  },
  {
    code: "EC3172",
    title: "Embedded Systems Lab",
    credits: 3,
    instructors: ["Dr. Heigrujam Manas Singh"],
    sections: ["C", "D"],
    semester: "VI",
    program: "ECE-VLSI"
  },
  {
    code: "EC3053",
    title: "VLSI Technology",
    credits: 6,
    instructors: ["Dr. Heigrujam Manas Singh"],
    sections: ["ECE-VLSI Program"],
    semester: "VI",
    program: "ECE-VLSI"
  },
  {
    code: "EC3033",
    title: "Information Theory and Coding",
    credits: 6,
    instructors: ["Dr. Ramesh Ch. Mishra"],
    sections: ["C", "D"],
    semester: "VI",
    program: "ECE-VLSI"
  },
  {
    code: "OE3052",
    title: "Deep Learning",
    credits: 6,
    instructors: ["Float through SWAYAM", "Coordinator: Dr. N. Monica Devi"],
    sections: ["C", "D"],
    semester: "VI",
    program: "ECE-VLSI"
  },
  {
    code: "OE3036",
    title: "Blockchain and its Applications",
    credits: 6,
    instructors: ["Float through SWAYAM", "Coordinator: Dr. N. Monica Devi"],
    sections: ["C", "D"],
    semester: "VI",
    program: "ECE-VLSI"
  },
  {
    code: "OE3053",
    title: "Introduction to Machine Learning",
    credits: 6,
    instructors: ["Float through SWAYAM", "Coordinator: Dr. N. Monica Devi"],
    sections: ["C", "D"],
    semester: "VI",
    program: "ECE-VLSI"
  },
  {
    code: "HS3092",
    title: "Employability Skills",
    credits: 0,
    instructors: ["Float through SWAYAM", "Coordinator: Dr. Akoijam Malemnganbi"],
    sections: ["C", "D"],
    semester: "VI",
    program: "ECE-VLSI"
  },
  {
    code: "EC3201",
    title: "Minor Project",
    credits: 4,
    instructors: ["Dr. Ramesh Ch. Mishra"],
    sections: ["ECE-VLSI Program"],
    semester: "VI",
    program: "ECE-VLSI"
  },
  {
    code: "HS3093",
    title: "Constitution Law and Public Administration in India",
    credits: 6,
    instructors: ["Float through SWAYAM", "Coordinator: Dr. Lairenjam Pradipkanti Devi"],
    sections: ["C", "D"],
    semester: "VI",
    program: "ECE-VLSI"
  },

  // SEMESTER VIII (CSE)
  {
    code: "CS403",
    title: "Foundations of Cryptography",
    credits: 6,
    instructors: ["Float through SWAYAM", "Coordinator: Dr. S. Chanu Inunganbi"],
    sections: ["CSE Program"],
    semester: "VIII",
    program: "CSE"
  },
  {
    code: "CS404",
    title: "Data Mining",
    credits: 6,
    instructors: ["Float through SWAYAM", "Coordinator: Dr. S. Chanu Inunganbi"],
    sections: ["CSE Program"],
    semester: "VIII",
    program: "CSE"
  },
  {
    code: "OE472",
    title: "Internet of Things",
    credits: 6,
    instructors: ["Float through SWAYAM", "Coordinator: Dr. S. Chanu Inunganbi"],
    sections: ["CSE Program"],
    semester: "VIII",
    program: "CSE"
  },
  {
    code: "CS423",
    title: "Project/Internship - IV",
    credits: 18,
    instructors: ["Coordinator: Dr. N Kishorjit Singh"],
    sections: ["CSE Program"],
    semester: "VIII",
    program: "CSE"
  },

  // SEMESTER VIII (ECE)
  {
    code: "OE473",
    title: "Biomedical Signal Processing",
    credits: 6,
    instructors: ["Float through SWAYAM", "Coordinator: Dr. Ramesh Ch. Mishra"],
    sections: ["ECE Program"],
    semester: "VIII",
    program: "ECE"
  },
  {
    code: "OE471",
    title: "Introduction to Internet of Things",
    credits: 6,
    instructors: ["Float through SWAYAM", "Coordinator: Dr. Ramesh Ch. Mishra"],
    sections: ["ECE Program"],
    semester: "VIII",
    program: "ECE"
  },
  {
    code: "CS423",
    title: "Project/Internship - IV",
    credits: 18,
    instructors: ["Dr. Chittotosh Ganguly"],
    sections: ["ECE Program"],
    semester: "VIII",
    program: "ECE"
  }
];
