import { CollegeKnowledgeItem } from '../types';

export const DEFAULT_COLLEGE_KNOWLEDGE: CollegeKnowledgeItem[] = [
  {
    id: 'kb-id-card',
    category: 'Administration',
    title: 'Student ID Card Issuance & Replacement Process',
    content: `New students receive their smart RFID ID card during the orientation week from the Academic Affairs Registrar Desk. 
For damaged or lost ID cards:
1. Submit an application form at the Student Services Window (Admin Block, Room 102).
2. Pay the nominal replacement fee of $15/₹250 at the Accounts Counter.
3. Bring one passport-size photograph with blue background and your Admission/Roll number.
4. Duplicate card is printed and ready for collection within 2 working days. Temporary pass is issued instantly for library and lab access.`,
    department: 'Registrar & Student Services Desk',
    contactEmail: 'studentservices@campus.edu',
    officeLocation: 'Admin Block, Ground Floor, Room 102',
    timings: 'Monday to Friday: 09:30 AM – 04:30 PM (Lunch break: 01:00 PM – 02:00 PM)',
    tags: ['id card', 'lost id', 'smart card', 'badge', 'replacement', 'identity'],
    isVerified: true,
    updatedAt: '2026-10-15',
  },
  {
    id: 'kb-bonafide',
    category: 'Administration',
    title: 'Bonafide Certificate & Education Loan Documents',
    content: `A Bonafide Certificate is required for passport applications, student bus/metro concession passes, education loan sanctions, and visa processing.
Procedure:
1. Fill out the Bonafide Requisition Form available at the Academic Affairs Portal or counter in Admin Block Room 105.
2. Specify the exact purpose of the certificate (e.g., Bank Loan, Passport, Internship NOC).
3. The certificate is signed by the Dean of Student Affairs.
4. Standard processing turnaround is 24 to 48 hours. Digital signed copy is emailed to your registered student email address.`,
    department: 'Dean of Student Affairs / Academic Section',
    contactEmail: 'academicrecords@campus.edu',
    officeLocation: 'Admin Block, First Floor, Room 105',
    timings: 'Monday to Friday: 10:00 AM – 03:30 PM',
    tags: ['bonafide', 'certificate', 'loan', 'passport', 'noc', 'verification', 'proof of study'],
    isVerified: true,
    updatedAt: '2026-10-10',
  },
  {
    id: 'kb-academic-calendar',
    category: 'Academics',
    title: 'Academic Calendar & Semester Schedule',
    content: `Key Semester Milestones:
- Semester Commencement: Fall (August 1st week), Spring (January 2nd week).
- Mid-Term Examinations: Held in week 8 of each semester.
- Final End-Semester Examinations: Fall (Last two weeks of November), Spring (First two weeks of May).
- Grade Declaration: Within 25 working days post final exam conclusion.
- Course Add/Drop Period: First 10 instructional days of each semester.
- Attendance Requirement: Mandatory minimum 75% attendance in lectures and laboratory sessions to qualify for appearing in final semester exams.`,
    department: 'Office of the Dean of Academic Programs',
    contactEmail: 'academics@campus.edu',
    officeLocation: 'Academic Complex, 2nd Floor, Wing B',
    timings: 'Monday to Friday: 09:00 AM – 05:00 PM',
    tags: ['calendar', 'semester', 'exams', 'mid-term', 'end-term', 'schedule', 'dates', 'attendance'],
    isVerified: true,
    updatedAt: '2026-10-01',
  },
  {
    id: 'kb-examination',
    category: 'Examination',
    title: 'Examination Department, Hall Tickets & Grade Grievances',
    content: `The Office of the Controller of Examinations manages semester evaluations, hall ticket releases, re-evaluation, and grade cards.
Procedures:
- Hall Tickets / Admit Cards: Downloadable via the Student Portal 7 days prior to examination start date after fee clearance and 75% attendance confirmation.
- Missing Admit Card: Visit the Controller of Examinations office with fee receipt.
- Paper Re-evaluation / Scrutiny: Applications open within 7 days of result declaration with a per-course review fee.
- Backlog / Supplementary Exams: Conducted during the inter-semester breaks in December and July.`,
    department: 'Office of Controller of Examinations (COE)',
    contactEmail: 'coe@campus.edu',
    officeLocation: 'Examination Tower, 3rd Floor',
    timings: 'Monday to Friday: 10:00 AM – 04:00 PM',
    tags: ['exams', 'coe', 'hall ticket', 'admit card', 're-evaluation', 'backlog', 'grades', 'transcript'],
    isVerified: true,
    updatedAt: '2026-09-20',
  },
  {
    id: 'kb-library',
    category: 'Facilities',
    title: 'Central Library Timings, Digital Resources & Borrowing Rules',
    content: `Central Library Services:
- Operating Hours:
  * Regular Weekdays: 08:00 AM – 10:00 PM
  * Weekends & Public Holidays: 09:00 AM – 05:00 PM
  * Examination Weeks: Open 24 Hours with air-conditioned reading halls and Wi-Fi.
- Borrowing Privileges:
  * Undergraduate students: Up to 4 books for 14 days (renewable online once).
  * Postgraduate & Research scholars: Up to 6 books for 28 days.
- Digital Library & Subscriptions: Campus proxy provides access to IEEE Xplore, ACM Digital Library, SpringerLink, Elsevier ScienceDirect, and JSTOR using student login.
- Quiet study cubicles and group discussion rooms can be reserved via the library portal.`,
    department: 'Central University Library',
    contactEmail: 'library@campus.edu',
    officeLocation: 'Central Library Building (Opposite Student Quad)',
    timings: 'Daily 08:00 AM – 10:00 PM (24/7 during exams)',
    tags: ['library', 'books', 'timings', 'borrow', 'ieee', 'digital resources', 'reading room'],
    isVerified: true,
    updatedAt: '2026-10-12',
  },
  {
    id: 'kb-placements',
    category: 'Placements',
    title: 'Training & Placement Cell (T&P) — Registration & Drives',
    content: `The Training & Placement Cell guides students toward campus recruitments, corporate internships, mock interviews, and industry mentorship.
Key Guidelines:
- Eligibility Registration: Pre-final and final-year students must register on the T&P Portal before August 15 each academic year with verified transcripts.
- Minimum CGPA requirement for major IT/Tech recruiters is usually 6.5 - 7.5 with no active backlogs.
- Resume verification: Every student must get their standardized college placement resume verified by their Department Placement Coordinator.
- Mock Interviews & Aptitude Workshops: Organized every Saturday during the pre-placement semester.`,
    department: 'Corporate Relations & Placement Cell',
    contactEmail: 'placements@campus.edu',
    officeLocation: 'Career Advancement Center, 4th Floor, Tech Park Wing',
    timings: 'Monday to Saturday: 09:00 AM – 06:00 PM',
    tags: ['placement', 'jobs', 'internships', 'campus drives', 'resume', 'mock interview', 'career'],
    isVerified: true,
    updatedAt: '2026-10-18',
  },
  {
    id: 'kb-clubs',
    category: 'Clubs & Activities',
    title: 'Student Clubs, Cultural Societies & Technical Chapters',
    content: `Campus boasts 20+ active student-run clubs across technology, arts, social welfare, and leadership:
- Technical Clubs: Google Developer Student Club (GDSC), ACM Student Chapter, Robotics & Automation Club, Cybersecurity & CTF Circle.
- Cultural Clubs: 'Symphony' Music Society, 'Natya' Theatre Ensemble, 'Chroma' Fine Arts Society, Dance Troupe.
- Literary & Debate: Model United Nations (MUN) Society, Literary & Quizzing Club.
- Social Responsibility: National Service Scheme (NSS), Rotaract Youth Wing.
How to Join:
- Annual Club Expo is held in the 3rd week of September in the Indoor Amphitheater.
- Registrations are open through the Student Life Portal or via booths during Club Week.`,
    department: 'Student Affairs Council & Dean of Student Life',
    contactEmail: 'studentlife@campus.edu',
    officeLocation: 'Student Activity Center (SAC), Ground Floor',
    timings: 'Monday to Friday: 02:00 PM – 07:00 PM',
    tags: ['clubs', 'gdsc', 'acm', 'robotics', 'cultural', 'music', 'dance', 'joining clubs', 'sac'],
    isVerified: true,
    updatedAt: '2026-09-28',
  },
  {
    id: 'kb-sports',
    category: 'Facilities',
    title: 'Sports Complex, Gym & Recreational Facilities',
    content: `Sports & Fitness Facilities:
- Indoor Sports Pavilion: Badminton courts (wood flooring), table tennis arena, squash courts, and chess lounge.
- Gymnasium & Fitness Studio: State-of-the-art cardio and weight training equipment with certified fitness trainers.
- Outdoor Facilities: Olympic standard 400m running track, football turf, cricket nets, basketball courts, and tennis courts.
- Timings:
  * Morning Session: 06:00 AM – 09:30 AM
  * Evening Session: 04:30 PM – 09:00 PM
- Entry is free for enrolled students upon showing a valid Student ID card. Locker facilities are available upon semester deposit.`,
    department: 'Department of Physical Education & Sports',
    contactEmail: 'sports@campus.edu',
    officeLocation: 'Sports Complex Main Lobby',
    timings: 'Daily 06:00 AM – 09:30 AM & 04:30 PM – 09:00 PM',
    tags: ['sports', 'gym', 'badminton', 'football', 'basketball', 'fitness', 'courts', 'timings'],
    isVerified: true,
    updatedAt: '2026-09-15',
  },
  {
    id: 'kb-scholarships',
    category: 'Scholarships',
    title: 'Merit, Need-Based & Government Scholarships',
    content: `Financial Aid & Scholarships offered:
1. Merit Scholarship: Top 5% rank holders in each engineering and science discipline receive 50% tuition fee waiver for the subsequent semester.
2. Need-Cum-Merit Scholarship: For students with family annual income under the designated economic threshold who maintain CGPA >= 7.0.
3. Sports Excellence Scholarship: For students representing university or state/national level championships.
4. National / State Scholarship Portal facilitation: Verification desk validates applications for government fee reimbursement programs.
Application window opens every August and January. Details are updated on the Financial Aid Bulletin.`,
    department: 'Financial Aid & Scholarship Committee',
    contactEmail: 'scholarships@campus.edu',
    officeLocation: 'Admin Block, Ground Floor, Room 108',
    timings: 'Tuesday and Thursday: 10:00 AM – 01:00 PM',
    tags: ['scholarship', 'financial aid', 'fee waiver', 'merit', 'funding', 'tuition assistance'],
    isVerified: true,
    updatedAt: '2026-10-05',
  },
  {
    id: 'kb-counseling',
    category: 'General',
    title: 'Student Wellness, Health Center & Counseling Desk',
    content: `Student Health & Mental Well-being Support:
- Campus Health Clinic: 24/7 staffed with certified general physician and nursing staff for first aid, acute illnesses, and medical emergencies. Free basic medications provided.
- Mental Health & Counseling Support: Confidential, judgment-free psychological counseling and academic stress management available by appointment or walk-in.
- Emergency Ambulance Helpline: Available 24x7 across all campus hostels.`,
    department: 'Campus Health Center & Counseling Unit',
    contactEmail: 'wellness@campus.edu',
    officeLocation: 'Health Center Building (Near North Gate)',
    timings: 'Clinic: 24/7. Counseling appointments: Monday to Friday 09:00 AM – 06:00 PM',
    tags: ['health', 'doctor', 'medical', 'emergency', 'counseling', 'mental health', 'wellness', 'stress'],
    isVerified: true,
    updatedAt: '2026-10-14',
  }
];
