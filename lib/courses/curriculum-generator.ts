/**
 * InnovatMind School OS — Grade-wise 30-Lecture Curriculum Scaffolding Generator
 * Generates structured 30-lecture curriculums with modules, video metadata, quizzes, and games.
 */

import { CurriculumLecture, LectureQuiz, LectureGame, VideoProviderType, UnlockPolicy, SchedulePolicy } from '../types';

export interface CurriculumGenerationOptions {
  grade: number;
  subject?: string;
  courseTitle: string;
  unlockPolicy?: UnlockPolicy;
  scheduleType?: SchedulePolicy;
  defaultVideoProvider?: VideoProviderType;
  baseDriveFolderId?: string;
}

// Module themes per grade bracket
function getGradeSyllabus(grade: number, courseTitle: string) {
  if (grade <= 3) {
    return {
      category: 'Digital Literacy & Computer Basics',
      modules: [
        { name: 'Unit 1: The Magic of Computers', topics: ['Parts of a Computer', 'Keyboard & Mouse Fun', 'Screen & Desktop Basics', 'Turning On & Off Safely', 'Drawing with Digital Paint'] },
        { name: 'Unit 2: Everyday Technology', topics: ['Computers Around Us', 'Input & Output Wonders', 'Storing Our Drawings', 'Safe Digital Habits', 'Sound & Speakers'] },
        { name: 'Unit 3: Creative Thinking & Patterns', topics: ['What is a Pattern?', 'Following Step-by-Step Instructions', 'Sequencing Stories', 'Fixing Silly Mistakes (Intro to Bugs)', 'Digital Puzzles'] },
        { name: 'Unit 4: Fun with Interactive Stories', topics: ['Characters on Screen', 'Making Characters Move', 'Adding Fun Sounds', 'Creating a Mini Digital Card', 'Showcasing My First Project'] },
        { name: 'Unit 5: Smart & Safe Digital Explorer', topics: ['Digital Manners', 'Protecting Our Names', 'Screen Time Balance', 'Friendly Technology Helpers', 'Celebration & Graduation'] },
        { name: 'Unit 6: Junior Inventor Showcase', topics: ['How Robots Help People', 'Designing a Dream Robot', 'Storyboarding an Adventure', 'Interactive Quiz Party', 'Grand Finale & Explorer Certificate'] }
      ]
    };
  } else if (grade <= 6) {
    return {
      category: 'Coding & Computational Thinking',
      modules: [
        { name: 'Unit 1: Hardware & OS Architecture', topics: ['Inside the System Unit (CPU, RAM, Storage)', 'Input, Output & Memory Devices', 'Operating Systems & File Explorer', 'Network & Internet Basics', 'Cyber Safety & Strong Passwords'] },
        { name: 'Unit 2: Computational Logic & Algorithms', topics: ['Algorithm Design & Flowcharts', 'Decomposition & Pattern Recognition', 'Step Sequences & Loops', 'Conditionals: If / Else Logic', 'Debugging Logic Errors'] },
        { name: 'Unit 3: Visual Block Programming (Scratch/Blockly)', topics: ['Sprites, Stage & Coordinates', 'Event Triggers & Motion Blocks', 'Variables & Keeping Score', 'Broadcast Messages & Interaction', 'Building a Catch-the-Stars Game'] },
        { name: 'Unit 4: Hardware & Microcontroller Explorations', topics: ['What is a Microcontroller?', 'LEDs, Circuits & Breadboards', 'Buttons, Buzzers & Switches', 'Writing Code for Microcontrollers', 'Smart Traffic Light Simulator'] },
        { name: 'Unit 5: Introduction to Python for Young Cadets', topics: ['Hello World & print() in Python', 'Variables, Strings & Numbers', 'Receiving input() from User', 'Making Decisions with if / elif / else', 'While & For Loops in Python'] },
        { name: 'Unit 6: Capstone STEM Project', topics: ['Project Ideation & Wireframing', 'Coding the Core Game Engine', 'Adding Sounds & Polish', 'Peer Testing & Code Review', 'Graduation & Cadet Badge Award'] }
      ]
    };
  } else if (grade <= 8) {
    return {
      category: 'Robotics, IoT & Python Systems',
      modules: [
        { name: 'Unit 1: Advanced Computing & Data Structures', topics: ['Computer Memory Architecture', 'Binary, Hexadecimal & Data Encoding', 'Python Lists, Tuples & Dictionaries', 'Functions & Modular Code', 'File Handling & Reading Datasets'] },
        { name: 'Unit 2: Physical Computing & Sensor Networks', topics: ['Sensor Physics: Ultrasonic, IR & Light', 'Analog vs Digital Signals & PWM', 'Actuator Controls & Servo Motors', 'LCD Displays & Telemetry Readings', 'Building an Obstacle Avoidance Rover'] },
        { name: 'Unit 3: Internet of Things (IoT) & Cloud', topics: ['How the Internet Works (TCP/IP & HTTP)', 'Cloud Dashboards & MQTT Protocol', 'Sending Sensor Data to the Cloud', 'Remote Home Automation Simulator', 'IoT Security & Device Hardening'] },
        { name: 'Unit 4: Artificial Intelligence & Machine Learning', topics: ['What is AI? Narrow vs General AI', 'Supervised Learning & Data Training', 'Computer Vision: How Machines See', 'Speech Recognition & NLP Basics', 'Building a Teachable Machine Model'] },
        { name: 'Unit 5: Web Development & Interactive UI', topics: ['HTML5 Semantic Structure', 'CSS3 Styling, Flexbox & Animations', 'JavaScript DOM Manipulation', 'Connecting Frontend to Python APIs', 'Publishing a Live Cadet Web App'] },
        { name: 'Unit 6: Engineering Capstone & Innovation Expo', topics: ['System Requirements & Architecture', 'Hardware/Software Integration', 'Field Testing & Performance Optimization', 'Writing Technical Documentation', 'Innovation Expo Presentation'] }
      ]
    };
  } else {
    return {
      category: 'Advanced AI, Neural Networks & Full-Stack Engineering',
      modules: [
        { name: 'Unit 1: Object-Oriented Software Architecture', topics: ['OOP Principles: Encapsulation & Inheritance', 'Polymorphism, Abstraction & Interfaces', 'Data Structures: Stacks, Queues & Trees', 'Time & Space Complexity (Big-O)', 'Clean Architecture & Unit Testing'] },
        { name: 'Unit 2: Applied Machine Learning & Neural Networks', topics: ['Linear Regression & Gradient Descent', 'Logistic Classification & Decision Trees', 'Neural Network Perceptrons & Activation', 'Deep Learning with Convolutional Networks', 'Model Evaluation, Bias & Overfitting'] },
        { name: 'Unit 3: Robotics Kinematics & Autonomous Navigation', topics: ['Differential Drive Kinematics', 'PID Control Loops for Motor Precision', 'SLAM (Simultaneous Localization & Mapping)', 'Path Planning: A* & Dijkstra Algorithms', 'Autonomous Rover Simulation Lab'] },
        { name: 'Unit 4: Cloud Infrastructure & Microservices', topics: ['RESTful APIs & Microservices Design', 'PostgreSQL Relational Schema & Indexing', 'Authentication, JWT & Security Guards', 'Docker Containers & Cloud Deployment', 'Real-Time WebSockets & Telemetry'] },
        { name: 'Unit 5: Cyber Security & Defensive Systems', topics: ['Network Threat Modeling & Penetration', 'Cryptography: Hashing, RSA & TLS', 'Defending Against SQL Injection & XSS', 'Secure Identity & OAuth Handshakes', 'Security Audit & Compliance Standards'] },
        { name: 'Unit 6: Industry Capstone Project', topics: ['Product Design Sprint & Architecture', 'Full-Stack Implementation', 'End-to-End Automated Integration Testing', 'Security Review & Production Deployment', 'Final Evaluation & InnovatMind Diploma'] }
      ]
    };
  }
}

// Generate an age-appropriate quiz for a lecture
function generateLectureQuiz(lectureNumber: number, title: string, topic: string, grade: number): LectureQuiz {
  const isElementary = grade <= 4;
  
  return {
    id: `quiz-lec-${lectureNumber}`,
    title: `${topic} Checkpoint Quiz`,
    description: `Test your understanding of ${topic} with 3 interactive questions.`,
    passingPercentage: 70,
    timeLimitSeconds: 180,
    questionsCount: 3,
    isMandatory: true,
    questions: [
      {
        id: `q-${lectureNumber}-1`,
        type: 'MCQ',
        prompt: `What is the primary role or concept of "${topic}"?`,
        options: [
          `To process commands accurately and coordinate technology functions`,
          `To turn off electrical power immediately`,
          `To slow down computer performance`,
          `To delete all stored files on disk`
        ],
        correctAnswer: `To process commands accurately and coordinate technology functions`,
        explanation: `${topic} is designed to coordinate operations and process instructions systematically.`,
        hint: `Think about how computers execute instructions.`
      },
      {
        id: `q-${lectureNumber}-2`,
        type: 'TRUE_FALSE',
        prompt: `True or False: In ${topic}, following a systematic step-by-step approach prevents errors and ensures predictable results.`,
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'Systematic algorithms and proper engineering practices ensure consistent and reliable execution.',
        hint: `Consider how robots and code execute every instruction in sequence.`
      },
      {
        id: `q-${lectureNumber}-3`,
        type: isElementary ? 'MCQ' : 'CODE_OUTPUT',
        prompt: isElementary
          ? `Which tool or component is most commonly associated with ${topic}?`
          : `What will be the output or outcome when this component executes correctly?`,
        options: isElementary ? [
          'Digital processor and display monitor',
          'A mechanical wooden pencil',
          'A glass of water',
          'A paper notebook'
        ] : [
          'Process completed with status 200 OK',
          'SyntaxError: Unexpected token',
          'Infinite loop with memory crash',
          'NullPointerException'
        ],
        correctAnswer: isElementary ? 'Digital processor and display monitor' : 'Process completed with status 200 OK',
        explanation: `When configured properly, ${topic} executes reliably and signals a successful output status.`,
        codeSnippet: isElementary ? undefined : `# Test execution for ${topic}\ndef verify_status():\n    return "Process completed with status 200 OK"\n\nprint(verify_status())`
      }
    ]
  };
}

// Generate an interactive educational game for a lecture
function generateLectureGame(lectureNumber: number, title: string, topic: string, grade: number): LectureGame {
  // Cycle through 5 engaging game archetypes
  const gameArchetypes: Array<{
    type: LectureGame['type'];
    title: string;
    instructions: string;
    getConfig: (t: string, g: number) => Record<string, any>;
  }> = [
    {
      type: 'HARDWARE_MATCH',
      title: 'Component Architect Lab',
      instructions: 'Drag or tap each computer hardware component to connect it with its correct engineering purpose.',
      getConfig: (t, g) => ({
        items: [
          { id: 'cpu', name: 'CPU (Processor)', targetSlot: 'brain', description: 'Executes calculations and controls all computer processes' },
          { id: 'ram', name: 'RAM (Fast Memory)', targetSlot: 'memory', description: 'Holds active program data for instant processor access' },
          { id: 'ssd', name: 'SSD (Storage)', targetSlot: 'storage', description: 'Saves your operating system, games and files permanently' },
          { id: 'gpu', name: 'GPU (Graphics Card)', targetSlot: 'display', description: 'Renders 3D graphics, animations, and game worlds' }
        ],
        slots: [
          { id: 'brain', label: 'Primary Processing Core' },
          { id: 'memory', label: 'High-Speed Working Memory' },
          { id: 'storage', label: 'Persistent Long-Term Storage' },
          { id: 'display', label: '3D Graphics & Visual Display Engine' }
        ]
      })
    },
    {
      type: 'CODING_SEQUENCE',
      title: 'Algorithm Sequence Builder',
      instructions: 'Arrange the computational blocks in the correct chronological order to solve the challenge.',
      getConfig: (t, g) => ({
        goal: `Execute algorithm for ${t}`,
        blocks: [
          { id: 'b1', text: 'Initialize Sensors & Hardware Interfaces', correctOrder: 1 },
          { id: 'b2', text: 'Read Input Stream & Environmental Data', correctOrder: 2 },
          { id: 'b3', text: 'Evaluate Condition (if input is valid)', correctOrder: 3 },
          { id: 'b4', text: 'Execute Action & Transmit Telemetry', correctOrder: 4 }
        ]
      })
    },
    {
      type: 'MEMORY_CARDS',
      title: 'Cyber Memory Matrix',
      instructions: 'Flip cards and find all matching technology pairs before the timer runs out.',
      getConfig: (t, g) => ({
        cards: [
          { id: 'c1', pairId: 'pair-algo', text: 'Algorithm', match: 'Step-by-step instructions' },
          { id: 'c2', pairId: 'pair-algo', text: 'Step-by-step instructions', match: 'Algorithm' },
          { id: 'c3', pairId: 'pair-bug', text: 'Bug', match: 'Error in code' },
          { id: 'c4', pairId: 'pair-bug', text: 'Error in code', match: 'Bug' },
          { id: 'c5', pairId: 'pair-loop', text: 'Loop', match: 'Repeats action' },
          { id: 'c6', pairId: 'pair-loop', text: 'Repeats action', match: 'Loop' }
        ]
      })
    },
    {
      type: 'BUG_HUNTER',
      title: 'Bug Hunter: Code Detective',
      instructions: 'Examine the logic instructions below and tap the faulty line to eliminate the bug.',
      getConfig: (t, g) => ({
        scenario: `Diagnosing system logic error in ${t}`,
        codeLines: [
          { line: 1, text: 'sensor_active = True', isBug: false },
          { line: 2, text: 'motor_speed = 100', isBug: false },
          { line: 3, text: 'while sensor_active == False:  # BUG: Logic condition never enters!', isBug: true, fixExplanation: 'Condition should check sensor_active == True' },
          { line: 4, text: '    drive_forward(motor_speed)', isBug: false }
        ]
      })
    },
    {
      type: 'LOGIC_CIRCUIT',
      title: 'Logic Gate & Power Circuit',
      instructions: 'Toggle the logic inputs to deliver power and activate the robot mentor companion.',
      getConfig: (t, g) => ({
        gateType: 'AND',
        inputA: false,
        inputB: false,
        targetOutput: true,
        hint: 'Both Input Switch A and Input Switch B must be ON (True) to trigger the AND gate.'
      })
    }
  ];

  const archetype = gameArchetypes[(lectureNumber - 1) % gameArchetypes.length];

  return {
    id: `game-lec-${lectureNumber}`,
    type: archetype.type,
    title: `${archetype.title}: ${topic}`,
    instructions: archetype.instructions,
    difficulty: grade <= 4 ? 'EASY' : (grade <= 8 ? 'MEDIUM' : 'HARD'),
    config: archetype.getConfig(topic, grade),
    xpBonus: 50
  };
}

/**
 * Generate 30 comprehensive lectures tailored to a specific grade and course.
 */
export function generate30LectureCurriculum(options: CurriculumGenerationOptions): CurriculumLecture[] {
  const { grade, courseTitle, unlockPolicy = 'HYBRID_SCHEDULE_AND_COMPLETION', scheduleType = 'DAILY', defaultVideoProvider = 'GOOGLE_DRIVE', baseDriveFolderId } = options;
  const syllabus = getGradeSyllabus(grade, courseTitle);
  
  const lectures: CurriculumLecture[] = [];
  let lectureCounter = 1;

  for (let mIdx = 0; mIdx < syllabus.modules.length; mIdx++) {
    const unit = syllabus.modules[mIdx];
    for (let tIdx = 0; tIdx < unit.topics.length; tIdx++) {
      if (lectureCounter > 30) break;

      const topic = unit.topics[tIdx];
      const lectureNumber = lectureCounter;
      const estimatedMinutes = 20 + ((lectureNumber % 3) * 5); // 20, 25, 30 mins

      // Simulated initial Google Drive preview link / embed
      // Default to standard embed format: https://drive.google.com/file/d/.../preview
      const driveFileId = `1IM_DRV_${grade}_LEC_${String(lectureNumber).padStart(2, '0')}`;
      const embedUrl = `https://drive.google.com/file/d/${driveFileId}/preview`;

      const lecture: CurriculumLecture = {
        id: `lec-${grade}-${String(lectureNumber).padStart(2, '0')}`,
        lectureNumber,
        title: `Lecture ${lectureNumber}: ${topic}`,
        shortDescription: `Master the fundamental concepts of ${topic} through interactive video, check-point quiz, and a hands-on learning game.`,
        learningObjectives: [
          `Understand key principles of ${topic}`,
          `Identify practical applications in modern computing`,
          `Demonstrate understanding by scoring 70%+ on the checkpoint quiz`,
          `Complete the interactive engineering challenge to earn XP`
        ],
        moduleName: unit.name,
        topic,
        gradeLevel: grade,
        estimatedDurationMinutes: estimatedMinutes,
        videoProvider: defaultVideoProvider,
        videoRef: embedUrl,
        videoMetadata: {
          fileName: `Grade_${grade}_Lecture_${String(lectureNumber).padStart(2, '0')}_${topic.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`,
          durationSeconds: estimatedMinutes * 60,
          resolution: '1080p',
          driveWebViewLink: `https://drive.google.com/file/d/${driveFileId}/view`
        },
        videoCompletionThresholdPercent: 80,
        quiz: generateLectureQuiz(lectureNumber, `Lecture ${lectureNumber}: ${topic}`, topic, grade),
        game: generateLectureGame(lectureNumber, `Lecture ${lectureNumber}: ${topic}`, topic, grade),
        releaseSchedule: {
          type: scheduleType,
          dayOffset: lectureNumber, // Day 1 = 1 day after course start, Day 2 = 2 days, etc.
          customTime: '09:00'
        },
        unlockPolicy,
        status: 'READY',
        xpReward: 50 + (lectureNumber % 5 === 0 ? 50 : 0), // 50 XP standard, 100 XP milestone
        badgeReward: lectureNumber % 5 === 0 ? {
          id: `badge-milestone-${lectureNumber}`,
          name: `${unit.name} Mastery`,
          icon: lectureNumber === 30 ? 'Crown' : 'Trophy',
          description: `Completed ${unit.name} and conquered 5 consecutive learning journeys!`
        } : undefined
      };

      lectures.push(lecture);
      lectureCounter++;
    }
  }

  // Ensure exactly 30 lectures are returned
  while (lectures.length < 30) {
    const lectureNumber = lectures.length + 1;
    const topic = `Applied Technology Project ${lectureNumber}`;
    const lecture: CurriculumLecture = {
      id: `lec-${grade}-${String(lectureNumber).padStart(2, '0')}`,
      lectureNumber,
      title: `Lecture ${lectureNumber}: ${topic}`,
      shortDescription: `Culminating engineering exploration reinforcing core computational thinking and problem solving.`,
      learningObjectives: [`Synthesize previous unit lessons`, `Solve complex computational puzzle`],
      moduleName: `Unit 6: Capstone Innovations`,
      topic,
      gradeLevel: grade,
      estimatedDurationMinutes: 25,
      videoProvider: defaultVideoProvider,
      videoRef: `https://drive.google.com/file/d/1IM_DRV_${grade}_LEC_${String(lectureNumber).padStart(2, '0')}/preview`,
      videoCompletionThresholdPercent: 80,
      quiz: generateLectureQuiz(lectureNumber, `Lecture ${lectureNumber}`, topic, grade),
      game: generateLectureGame(lectureNumber, `Lecture ${lectureNumber}`, topic, grade),
      releaseSchedule: { type: scheduleType, dayOffset: lectureNumber, customTime: '09:00' },
      unlockPolicy,
      status: 'READY',
      xpReward: 100
    };
    lectures.push(lecture);
  }

  return lectures.slice(0, 30);
}

/**
 * Export lectures as clean CSV string for Super Admin bulk offline review
 */
export function exportLecturesToCsv(lectures: CurriculumLecture[]): string {
  const headers = [
    'Lecture Number',
    'Title',
    'Unit / Module',
    'Topic',
    'Duration (Mins)',
    'Video Provider',
    'Video Reference / Drive URL',
    'Quiz Title',
    'Game Type',
    'Release Day Offset',
    'Unlock Policy',
    'XP Reward'
  ];

  const rows = lectures.map(l => [
    l.lectureNumber,
    `"${l.title.replace(/"/g, '""')}"`,
    `"${l.moduleName.replace(/"/g, '""')}"`,
    `"${l.topic.replace(/"/g, '""')}"`,
    l.estimatedDurationMinutes,
    l.videoProvider,
    `"${l.videoRef.replace(/"/g, '""')}"`,
    `"${l.quiz?.title || 'Checkpoint'}"`,
    l.game?.type || 'NONE',
    l.releaseSchedule.dayOffset || l.lectureNumber,
    l.unlockPolicy,
    l.xpReward
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
