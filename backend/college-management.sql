CREATE DATABASE college_management;
USE college_management;
CREATE TABLE Attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    rollNumber VARCHAR(50),
    batchYear INT NOT NULL, 
    semester INT NOT NULL,
    section VARCHAR(2),
    subject_code VARCHAR(50) NOT NULL,
    branch VARCHAR(50) NOT NULL,
    attendance_date DATE NOT NULL,
    record VARCHAR(1) DEFAULT 'P' -- Default to 'P' for Present
    );
CREATE TABLE attendance_percentage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    branch VARCHAR(50) NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    semester VARCHAR(10) NOT NULL,
    section VARCHAR(10) NOT NULL,
    subject_code VARCHAR(50) DEFAULT NULL,
    roll_number VARCHAR(50) NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    present_count INT NOT NULL,
    total_days INT NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    subject_breakdown JSON DEFAULT NULL, -- Stores detailed breakdown when subject_code = 'ALL'
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    entry VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  rollNumber VARCHAR(50),
  dob DATE,
  registerNumber VARCHAR(15),
  branch VARCHAR(50),
  section VARCHAR(2),
  batchYear INT,
  yearOfEntry INT,
  fatherName VARCHAR(255),
  fatherOccupation VARCHAR(255),
  educationOccupation VARCHAR(255),
  familyBackground VARCHAR(255),
  parentPhoneNo BIGINT,
  address VARCHAR(255),
  languagesKnown VARCHAR(255),
  guardianName VARCHAR(255),
  lastSchoolName VARCHAR(255),
  mediumOfInstructions VARCHAR(255),
  maths INT,
  physics INT,
  chemistry INT,
  cutOff INT,
  quota VARCHAR(255),
  firstYearCounselor VARCHAR(255),
  secondYearCounselor VARCHAR(255),
  thirdYearCounselor VARCHAR(255),
  finalYearCounselor VARCHAR(255),
  createdAt DATETIME,
  updatedAt DATETIME
);
CREATE TABLE subjects (
  subject_id INT AUTO_INCREMENT PRIMARY KEY,
  subject_code VARCHAR(50) NOT NULL, 
  subject_name VARCHAR(100) NOT NULL,
  batchYear INT NOT NULL, 
  semester INT NOT NULL,
  branch VARCHAR(50) NOT NULL);
CREATE TABLE Marks (
    marks_id INT AUTO_INCREMENT PRIMARY KEY,
    rollNumber INT NOT NULL,
    subject_code VARCHAR(50) NOT NULL,
    cat1_marks DECIMAL(5,2),
    cat2_marks DECIMAL(5,2),
    model_marks DECIMAL(5,2),
    batchYear INT NOT NULL, 
	semester INT NOT NULL,
    section VARCHAR(2),
    branch VARCHAR(50) NOT NULL);
CREATE TABLE faculties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  branch VARCHAR(50) NOT NULL
);


    truncate attendance;
    INSERT INTO subjects (subject_code, subject_name, batchYear, semester, branch)
VALUES 
    ('HS3152', 'Professional English - I', 2025, 1, 'CSE'),
    ('MA3151', 'Matrices and Calculus', 2025, 1, 'CSE'),
    ('PH3151', 'Engineering Physics', 2025, 1, 'CSE'),
    ('CY3151', 'Engineering Chemistry', 2025, 1, 'CSE'),
    ('GE3151', 'Problem Solving and Python Programming', 2025, 1, 'CSE'),
    ('GE3152', 'தமிழர்மரபு /Heritage of Tamils', 2025, 1, 'CSE'),
    -- Semester 2
    ('S3252', 'Professional English - II', 2025, 2, 'CSE'),
    ('MA3251', 'Statistics and Numerical Methods', 2025, 2, 'CSE'),
    ('PH3256', 'Physics for Information Science', 2025, 2, 'CSE'),
    ('BE3251', 'Basic Electrical and Electronics Engineering', 2025, 2, 'CSE'),
    ('GE3251', 'Engineering Graphics', 2025, 2, 'CSE'),
    ('CS3251', 'Programming in C', 2025, 2, 'CSE'),
    ('GE3252', 'தமிழரும் ததொழில்நுட்பமும்/Tamils and Technology', 2025, 2, 'CSE'),
    -- Semester 3
    ('MA3354', 'Discrete Mathematics', 2025, 3, 'CSE'),
    ('CS3351', 'DPCO', 2025, 3, 'CSE'),
    ('CS3352', 'Foundations of Data Science', 2025, 3, 'CSE'),
    ('CS3301', 'Data Structures', 2025, 3, 'CSE'),
    ('CS3391', 'Object Oriented Programming', 2025, 3, 'CSE'),
    -- Semester 4
    ('CS3452', 'Theory of Computation', 2025, 4, 'CSE'),
    ('CS3491', 'Artificial Intelligence and Machine Learning', 2025, 4, 'CSE'),
    ('CS3492', 'Database Management Systems', 2025, 4, 'CSE'),
    ('CS3401', 'Algorithms', 2025, 4, 'CSE'),
    ('CS3451', 'Introduction to Operating Systems', 2025, 4, 'CSE'),
    ('GE3451', 'Environmental Sciences and Sustainability', 2023, 4, 'CSE'),
    -- Semester 5
    ('CS3591', 'Computer Networks', 2025, 5, 'CSE'),
    ('CS3501', 'Compiler Design', 2025, 5, 'CSE'),
    ('CB3491', 'Cryptography and Cyber Security', 2025, 5, 'CSE'),
    ('CS3551', 'Distributed Computing', 2025, 5, 'CSE'),
    ('CCS366', 'Software Testing and Automation', 2025, 5, 'CSE'),
    ('CCS375', 'Web Technologies', 2025, 5, 'CSE'),
    -- Semester 6
    ('CCS356', 'Object Oriented Software Engineering', 2023, 6, 'CSE'),
    ('CS3691', 'Embedded Systems and IoT', 2025, 6, 'CSE'),
    ('CCS354', 'Network Security', 2025, 6, 'CSE'),
    ('CCW331', 'Business Analytics', 2025, 6, 'CSE'),
    ('CCS372', 'Virtualization', 2025, 6, 'CSE'),
    ('CCS341', 'Data Warehousing', 2025, 6, 'CSE'),
    -- Semester 7
    ('GE3791', 'Human Values and Ethics', 2025, 7, 'CSE'),
    ('CME365', 'Renewable Energy Technologies', 2025, 7, 'CSE'),
    ('GE3752', 'Total Quality Management', 2025, 7, 'CSE'),
    ('AI3021', 'IT in Agricultural System', 2025, 7, 'CSE'),
    -- Semester 8
    ('CS3811', 'Project Work/Internship', 2025, 8, 'CSE');
    

INSERT INTO students
(name, rollNumber, dob, registerNumber, branch, section, batchYear, yearOfEntry,
 fatherName, fatherOccupation, educationOccupation, familyBackground,
 parentPhoneNo, address, languagesKnown, guardianName, lastSchoolName,
 mediumOfInstructions, maths, physics, chemistry, cutOff, quota,
 firstYearCounselor, secondYearCounselor, thirdYearCounselor, finalYearCounselor,
 createdAt, updatedAt)
VALUES
-- 1
('ABDUL KAREEM J','21601','2004-01-01','510621104001','CSE','A',2025,2021,
 'FatherOf1','Occupation1','B.E','Good',9876543101,'Address1','English',
 'Guardian1','School1','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 2
('ABDUL MUJEEB K','21602','2004-01-01','510621104002','CSE','A',2025,2021,
 'FatherOf2','Occupation2','B.E','Good',9876543102,'Address2','English',
 'Guardian2','School2','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 3
('ABDUL RAHMAN T A','21603','2004-01-01','510621104003','CSE','A',2025,2021,
 'FatherOf3','Occupation3','B.E','Good',9876543103,'Address3','English',
 'Guardian3','School3','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 4
('ABUBAKER SIDDIQUE H','21605','2004-01-01','510621104005','CSE','A',2025,2021,
 'FatherOf4','Occupation4','B.E','Good',9876543104,'Address4','English',
 'Guardian4','School4','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 5
('AKASH N','21606','2004-01-01','510621104006','CSE','A',2025,2021,
 'FatherOf5','Occupation5','B.E','Good',9876543105,'Address5','English',
 'Guardian5','School5','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 6
('AKILAN V','21607','2004-01-01','510621104007','CSE','A',2025,2021,
 'FatherOf6','Occupation6','B.E','Good',9876543106,'Address6','English',
 'Guardian6','School6','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 7
('AMALA NIRANJALI BASILICA S','21608','2004-01-01','510621104008','CSE','A',2025,2021,
 'FatherOf7','Occupation7','B.E','Good',9876543107,'Address7','English',
 'Guardian7','School7','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 8
('ANISHA W','21609','2004-01-01','510621104009','CSE','A',2025,2021,
 'FatherOf8','Occupation8','B.E','Good',9876543108,'Address8','English',
 'Guardian8','School8','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 9
('AYISHA BANU R','21610','2004-01-01','510621104010','CSE','A',2025,2021,
 'FatherOf9','Occupation9','B.E','Good',9876543109,'Address9','English',
 'Guardian9','School9','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 10
('BARATH NATH P','21611','2004-01-01','510621104011','CSE','A',2025,2021,
 'FatherOf10','Occupation10','B.E','Good',9876543110,'Address10','English',
 'Guardian10','School10','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 11
('BHARANI KUMAR A','21612','2004-01-01','510621104012','CSE','A',2025,2021,
 'FatherOf11','Occupation11','B.E','Good',9876543111,'Address11','English',
 'Guardian11','School11','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 12
('CUDDAPAH MOHAMMAD ALIKHAN','21613','2004-01-01','510621104013','CSE','A',2025,2021,
 'FatherOf12','Occupation12','B.E','Good',9876543112,'Address12','English',
 'Guardian12','School12','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 13
('DEEPAK R D','21614','2004-01-01','510621104014','CSE','A',2025,2021,
 'FatherOf13','Occupation13','B.E','Good',9876543113,'Address13','English',
 'Guardian13','School13','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 14
('DHANUSH S','21615','2004-01-01','510621104015','CSE','A',2025,2021,
 'FatherOf14','Occupation14','B.E','Good',9876543114,'Address14','English',
 'Guardian14','School14','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 15
('DHARSHINI N G','21616','2004-01-01','510621104016','CSE','A',2025,2021,
 'FatherOf15','Occupation15','B.E','Good',9876543115,'Address15','English',
 'Guardian15','School15','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 16
('DILLI RANI E','21617','2004-01-01','510621104017','CSE','A',2025,2021,
 'FatherOf16','Occupation16','B.E','Good',9876543116,'Address16','English',
 'Guardian16','School16','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 17
('DIVYA DHARSHINI P','21618','2004-01-01','510621104018','CSE','A',2025,2021,
 'FatherOf17','Occupation17','B.E','Good',9876543117,'Address17','English',
 'Guardian17','School17','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 18
('GOKUL A','21619','2004-01-01','510621104019','CSE','A',2025,2021,
 'FatherOf18','Occupation18','B.E','Good',9876543118,'Address18','English',
 'Guardian18','School18','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 19
('GOKULA ACHUTHAN B','21620','2004-01-01','510621104020','CSE','A',2025,2021,
 'FatherOf19','Occupation19','B.E','Good',9876543119,'Address19','English',
 'Guardian19','School19','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 20
('GOWTHAM V','21621','2004-01-01','510621104021','CSE','A',2025,2021,
 'FatherOf20','Occupation20','B.E','Good',9876543120,'Address20','English',
 'Guardian20','School20','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 21
('HARISH K','21622','2004-01-01','510621104022','CSE','A',2025,2021,
 'FatherOf21','Occupation21','B.E','Good',9876543121,'Address21','English',
 'Guardian21','School21','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 22
('HARISH KUMAR T','21623','2004-01-01','510621104023','CSE','A',2025,2021,
 'FatherOf22','Occupation22','B.E','Good',9876543122,'Address22','English',
 'Guardian22','School22','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 23
('HEMAVARDHANI A','21624','2004-01-01','510621104024','CSE','A',2025,2021,
 'FatherOf23','Occupation23','B.E','Good',9876543123,'Address23','English',
 'Guardian23','School23','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 24
('JABIN SULTHANA S','21625','2004-01-01','510621104025','CSE','A',2025,2021,
 'FatherOf24','Occupation24','B.E','Good',9876543124,'Address24','English',
 'Guardian24','School24','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 25
('JANANI K S','21626','2004-01-01','510621104026','CSE','A',2025,2021,
 'FatherOf25','Occupation25','B.E','Good',9876543125,'Address25','English',
 'Guardian25','School25','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 26
('JANANI P','21627','2004-01-01','510621104027','CSE','A',2025,2021,
 'FatherOf26','Occupation26','B.E','Good',9876543126,'Address26','English',
 'Guardian26','School26','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 27
('JAYANTHAN B S','21628','2004-01-01','510621104028','CSE','A',2025,2021,
 'FatherOf27','Occupation27','B.E','Good',9876543127,'Address27','English',
 'Guardian27','School27','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 28
('JAYEESHKUMAR S','21629','2004-01-01','510621104029','CSE','A',2025,2021,
 'FatherOf28','Occupation28','B.E','Good',9876543128,'Address28','English',
 'Guardian28','School28','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 29
('JOTHI SHANKAR S','21631','2004-01-01','510621104031','CSE','A',2025,2021,
 'FatherOf29','Occupation29','B.E','Good',9876543129,'Address29','English',
 'Guardian29','School29','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 30
('KAABEEL AHAMED R','21632','2004-01-01','510621104032','CSE','A',2025,2021,
 'FatherOf30','Occupation30','B.E','Good',9876543130,'Address30','English',
 'Guardian30','School30','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 31
('KALYANADURGAM HASSAIN','21633','2004-01-01','510621104033','CSE','A',2025,2021,
 'FatherOf31','Occupation31','B.E','Good',9876543131,'Address31','English',
 'Guardian31','School31','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 32
('KAREEM WASIQUE G','21634','2004-01-01','510621104034','CSE','A',2025,2021,
 'FatherOf32','Occupation32','B.E','Good',9876543132,'Address32','English',
 'Guardian32','School32','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 33
('KARTHIK S','21635','2004-01-01','510621104035','CSE','A',2025,2021,
 'FatherOf33','Occupation33','B.E','Good',9876543133,'Address33','English',
 'Guardian33','School33','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 34
('KEERTHANA P','21636','2004-01-01','510621104036','CSE','A',2025,2021,
 'FatherOf34','Occupation34','B.E','Good',9876543134,'Address34','English',
 'Guardian34','School34','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 35
('KHRISHWANTH K','21637','2004-01-01','510621104037','CSE','A',2025,2021,
 'FatherOf35','Occupation35','B.E','Good',9876543135,'Address35','English',
 'Guardian35','School35','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 36
('KISHORE KUMAR K','21638','2004-01-01','510621104038','CSE','A',2025,2021,
 'FatherOf36','Occupation36','B.E','Good',9876543136,'Address36','English',
 'Guardian36','School36','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 37
('MADHAN KUMAR M','21640','2004-01-01','510621104040','CSE','A',2025,2021,
 'FatherOf37','Occupation37','B.E','Good',9876543137,'Address37','English',
 'Guardian37','School37','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 38
('MADHUMITHA A','21641','2004-01-01','510621104041','CSE','A',2025,2021,
 'FatherOf38','Occupation38','B.E','Good',9876543138,'Address38','English',
 'Guardian38','School38','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 39
('MANIVASAGAM V','21642','2004-01-01','510621104042','CSE','A',2025,2021,
 'FatherOf39','Occupation39','B.E','Good',9876543139,'Address39','English',
 'Guardian39','School39','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 40
('MOHAMED AFFAN K','21644','2004-01-01','510621104044','CSE','A',2025,2021,
 'FatherOf40','Occupation40','B.E','Good',9876543140,'Address40','English',
 'Guardian40','School40','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 41
('MOHAMMAD ABDUL WAHAB','21645','2004-01-01','510621104045','CSE','A',2025,2021,
 'FatherOf41','Occupation41','B.E','Good',9876543141,'Address41','English',
 'Guardian41','School41','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 42
('MOHAMMED ABUZER V','21646','2004-01-01','510621104046','CSE','A',2025,2021,
 'FatherOf42','Occupation42','B.E','Good',9876543142,'Address42','English',
 'Guardian42','School42','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 43
('MOHAMMED ARSHAD A','21647','2004-01-01','510621104047','CSE','A',2025,2021,
 'FatherOf43','Occupation43','B.E','Good',9876543143,'Address43','English',
 'Guardian43','School43','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 44
('MOHAMMED ASJAD ZAKI V','21648','2004-01-01','510621104048','CSE','A',2025,2021,
 'FatherOf44','Occupation44','B.E','Good',9876543144,'Address44','English',
 'Guardian44','School44','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 45
('MOHAMMED FAISAL S','21649','2004-01-01','510621104049','CSE','A',2025,2021,
 'FatherOf45','Occupation45','B.E','Good',9876543145,'Address45','English',
 'Guardian45','School45','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 46
('MOHAMMED KHASIM M','21650','2004-01-01','510621104050','CSE','A',2025,2021,
 'FatherOf46','Occupation46','B.E','Good',9876543146,'Address46','English',
 'Guardian46','School46','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 47
('MOHAMMED NAVAZ H','21651','2004-01-01','510621104051','CSE','A',2025,2021,
 'FatherOf47','Occupation47','B.E','Good',9876543147,'Address47','English',
 'Guardian47','School47','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 48
('MOHAMMED RAIYAN F','21652','2004-01-01','510621104052','CSE','A',2025,2021,
 'FatherOf48','Occupation48','B.E','Good',9876543148,'Address48','English',
 'Guardian48','School48','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 49
('MOHAMMED SAAD V T','21653','2004-01-01','510621104053','CSE','A',2025,2021,
 'FatherOf49','Occupation49','B.E','Good',9876543149,'Address49','English',
 'Guardian49','School49','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 50
('MOHAMMED SHAAZ Y','21654','2004-01-01','510621104054','CSE','A',2025,2021,
 'FatherOf50','Occupation50','B.E','Good',9876543150,'Address50','English',
 'Guardian50','School50','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 51
('MOHAMMED THALHA J','21655','2004-01-01','510621104055','CSE','A',2025,2021,
 'FatherOf51','Occupation51','B.E','Good',9876543151,'Address51','English',
 'Guardian51','School51','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 52
('MOHAMMED THALHA S','21656','2004-01-01','510621104056','CSE','A',2025,2021,
 'FatherOf52','Occupation52','B.E','Good',9876543152,'Address52','English',
 'Guardian52','School52','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 53
('MOHAMMED USAID M','21657','2004-01-01','510621104057','CSE','A',2025,2021,
 'FatherOf53','Occupation53','B.E','Good',9876543153,'Address53','English',
 'Guardian53','School53','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 54
('BALAMURUGAN P','22L6114','2004-01-01','510621104301','CSE','A',2025,2021,
 'FatherOf54','Occupation54','B.E','Good',9876543154,'Address54','English',
 'Guardian54','School54','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 55
('DEVENDRAN V T','22L6115','2004-01-01','510621104302','CSE','A',2025,2021,
 'FatherOf55','Occupation55','B.E','Good',9876543155,'Address55','English',
 'Guardian55','School55','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 56
('SUDHAKAR V','22L6121','2004-01-01','510621104307','CSE','A',2025,2021,
 'FatherOf56','Occupation56','B.E','Good',9876543156,'Address56','English',
 'Guardian56','School56','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 57
('THAMIZHARASAN K','22L6122','2004-01-01','510621104308','CSE','A',2025,2021,
 'FatherOf57','Occupation57','B.E','Good',9876543157,'Address57','English',
 'Guardian57','School57','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW()),

-- 58
('VIJAYALAKSHMI S','17681R','2004-01-01','510621104502','CSE','A',2025,2021,
 'FatherOf58','Occupation58','B.E','Good',9876543158,'Address58','English',
 'Guardian58','School58','English',90,85,80,255,'Management',
 'Counselor1','Counselor2','Counselor3','Counselor4',NOW(),NOW());

INSERT INTO attendance 
    (rollNumber, batchYear, semester, section, subject_code, branch, attendance_date, record)
SELECT 
    st.rollNumber,
    sb.batchYear,
    sb.semester,
    'A' AS section,
    sb.subject_code,
    sb.branch,
    DATE_ADD('2025-01-01', INTERVAL n DAY) AS attendance_date,
    CASE 
       WHEN RAND() < 0.20 THEN 'A'
       ELSE 'P'
    END AS record
FROM (
    -- Derived numbers table: generates numbers from 0 to 72 (73 days)
    SELECT a.N + b.N * 10 AS n
    FROM (
         SELECT 0 AS N UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 
         UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
    ) a
    CROSS JOIN (
         SELECT 0 AS N UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 
         UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8
    ) b
    WHERE a.N + b.N * 10 <= 72
) AS numbers
CROSS JOIN (
    -- Hard-coded list of 58 roll numbers
    SELECT '21601' AS rollNumber UNION ALL
    SELECT '21602' UNION ALL
    SELECT '21603' UNION ALL
    SELECT '21605' UNION ALL
    SELECT '21606' UNION ALL
    SELECT '21607' UNION ALL
    SELECT '21608' UNION ALL
    SELECT '21609' UNION ALL
    SELECT '21610' UNION ALL
    SELECT '21611' UNION ALL
    SELECT '21612' UNION ALL
    SELECT '21613' UNION ALL
    SELECT '21614' UNION ALL
    SELECT '21615' UNION ALL
    SELECT '21616' UNION ALL
    SELECT '21617' UNION ALL
    SELECT '21618' UNION ALL
    SELECT '21619' UNION ALL
    SELECT '21620' UNION ALL
    SELECT '21621' UNION ALL
    SELECT '21622' UNION ALL
    SELECT '21623' UNION ALL
    SELECT '21624' UNION ALL
    SELECT '21625' UNION ALL
    SELECT '21626' UNION ALL
    SELECT '21627' UNION ALL
    SELECT '21628' UNION ALL
    SELECT '21629' UNION ALL
    SELECT '21631' UNION ALL
    SELECT '21632' UNION ALL
    SELECT '21633' UNION ALL
    SELECT '21634' UNION ALL
    SELECT '21635' UNION ALL
    SELECT '21636' UNION ALL
    SELECT '21637' UNION ALL
    SELECT '21638' UNION ALL
    SELECT '21640' UNION ALL
    SELECT '21641' UNION ALL
    SELECT '21642' UNION ALL
    SELECT '21644' UNION ALL
    SELECT '21645' UNION ALL
    SELECT '21646' UNION ALL
    SELECT '21647' UNION ALL
    SELECT '21648' UNION ALL
    SELECT '21649' UNION ALL
    SELECT '21650' UNION ALL
    SELECT '21651' UNION ALL
    SELECT '21652' UNION ALL
    SELECT '21653' UNION ALL
    SELECT '21654' UNION ALL
    SELECT '21655' UNION ALL
    SELECT '21656' UNION ALL
    SELECT '21657' UNION ALL
    SELECT '22L6114' UNION ALL
    SELECT '22L6115' UNION ALL
    SELECT '22L6121' UNION ALL
    SELECT '22L6122' UNION ALL
    SELECT '17681R'
) AS st
JOIN subjects sb ON sb.branch = 'CSE'
WHERE DAYNAME(DATE_ADD('2025-01-01', INTERVAL n DAY)) <> 'Sunday';


