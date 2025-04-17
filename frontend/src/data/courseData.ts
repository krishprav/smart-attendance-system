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

// Real course data for SEMESTER VI (CSE, CSE-AID, ECE, ECE-VLSI)
export const courses: Course[] = [
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
    sections: ["A", "B"],
    semester: "VI",
    program: "CSE"
  },
  {
    code: "CS3059",
    title: "Natural Language Processing",
    credits: 6,
    instructors: ["Dr. Navanath Saharia"],
    sections: ["A", "B"],
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
    sections: ["A", "B"],
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
    code: "HS3092",
    title: "Employability Skills",
    credits: 0,
    instructors: ["Float through SWAYAM", "Coordinator: Dr. Akoijam Malemnganbi"],
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
    instructors: ["Dr. Chittotosh Ganguly"],
    sections: ["ECE Program"],
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
    instructors: ["Dr. Chittotosh Ganguly"],
    sections: ["ECE-VLSI Program"],
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
  }
];
