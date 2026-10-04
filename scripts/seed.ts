/**
 * Seeds Firestore with starter courses, payment settings and a sample
 * certificate, and promotes SEED_ADMIN_EMAIL to the admin role.
 *
 *   npm run seed
 *
 * Requires the FIREBASE_* admin credentials in .env.local (or the environment).
 */
import { config } from 'dotenv';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

config({ path: '.env.local' });
config();

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    '\nMissing admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and\n' +
      'FIREBASE_PRIVATE_KEY in .env.local before running the seed.\n',
  );
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

const db = getFirestore();
const auth = getAuth();

const COURSES = [
  {
    title: 'AutoCAD 2D + 3D for Civil Engineers',
    slug: 'autocad-2d-3d-civil',
    category: 'Civil CADD',
    software: 'AutoCAD',
    level: 'Beginner',
    price: 8500,
    mrp: 12000,
    durationWeeks: 10,
    shortDescription:
      'Master drafting and 3D modelling in AutoCAD, from co-ordinate systems to plotting production-ready civil drawings.',
    description:
      'AutoCAD is a commercial computer-aided design (CAD) and drafting software application developed and marketed by Autodesk. It is used across a wide range of industries, by architects, project managers, engineers, graphic designers, city planners and many other professionals.\n\nThis program takes you from the interface and co-ordinate systems right through to parametric drawings, blocks, layouts, plotting and full 3D solid, mesh and surface modelling with materials, lights and rendering.',
    outcomes: [
      'Draw accurate orthographic and isometric drawings',
      'Work confidently with layers, blocks and external references',
      'Produce dimensioned, annotated layouts ready for plotting',
      'Build and edit 3D solid, mesh and surface models',
      'Create and manage 2D views generated from 3D models',
      'Apply materials, lights and rendering for presentation',
    ],
    syllabus: [
      'Introduction, history and the design cycle',
      'Co-ordinate systems — absolute, relative and polar',
      'Draw, enquiry and display commands',
      'Object snap and selection methods',
      'Modify and advance modify commands',
      'Hatch, text, tables and layers',
      'Dimensions and dimension style manager',
      'Blocks, dynamic blocks, attributes and design centre',
      'Viewports, layout settings, templates, printing and plotting',
      '3D modelling — wireframe, solid, mesh and surface',
      'Materials, lights and rendering',
    ],
  },
  {
    title: 'Revit Architecture — BIM Essentials',
    slug: 'revit-architecture-bim',
    category: 'Architecture CADD',
    software: 'Revit',
    level: 'Intermediate',
    price: 11000,
    mrp: 15000,
    durationWeeks: 8,
    shortDescription:
      'Design buildings in 3D, annotate with 2D drafting elements and pull live building information straight from the model.',
    description:
      "Autodesk Revit is a building information modelling (BIM) software for architects, landscape architects, structural engineers, MEP engineers, designers and contractors. The software allows users to design a building and structure and its components in 3D, annotate the model with 2D drafting elements, and access building information from the building model's database.\n\nRevit is 4D BIM capable with tools to plan and track various stages in the building's lifecycle, from concept to construction and later maintenance and/or demolition.",
    outcomes: [
      'Set up levels, grids and project datum correctly',
      'Model with system families — walls, floors, roofs and ceilings',
      'Build parametric loadable families from primitives',
      'Use types and instance parameters to drive variation',
      'Produce schedules, sheets and construction documentation',
      'Render realistic presentation images from the model',
    ],
    syllabus: [
      'BIM concepts and project setup',
      'Levels, grids and datum',
      'System families — walls, floors, roofs, ceilings',
      'Loadable families and in-place families',
      'Parametric family creation',
      'Types, instances and instance parameters',
      'Annotation, schedules and documentation',
      'Rendering and visualisation',
    ],
  },
  {
    title: 'STAAD.Pro — Structural Analysis & Design',
    slug: 'staadpro-structural-analysis',
    category: 'Civil CADD',
    software: 'StaadPro',
    level: 'Advanced',
    price: 12500,
    mrp: 16000,
    durationWeeks: 10,
    shortDescription:
      'Analyse and design every kind of structure — buildings, bridges, towers and tanks — to over 90 international design codes.',
    description:
      'STAAD.Pro is a structural analysis and design software application originally developed by Research Engineers International in 1997 and acquired by Bentley Systems in late 2005. It is one of the most widely used structural analysis and design software products worldwide and supports over 90 international steel, concrete, timber and aluminium design codes.\n\nIt covers everything from traditional static analysis to p-delta analysis, geometric non-linear analysis, pushover analysis and buckling analysis, as well as time history and response spectrum dynamic methods.',
    outcomes: [
      'Generate and edit structural models efficiently',
      'Assign loads and automatic slab, wind and moving load generation',
      'Design concrete columns, beams, slabs and shear walls',
      'Run seismic, pushover, dynamic and response spectrum analysis',
      'Design foundations — isolated, combined, strip, mat and pile cap',
      'Generate professional analysis and design reports',
    ],
    syllabus: [
      'Introduction to structural engineering and STAAD.Pro V8i',
      'Model generation and editing',
      'Assigning loads and load combinations',
      'Automatic load generation — slab, wind and moving loads',
      'Concrete design — columns and beams',
      'Seismology, seismic analysis and design',
      'Pushover and dynamic analysis',
      'Response spectrum and time history analysis',
      'Foundation design',
      'Water tank, slab and staircase design',
      'Steel design and transmission line towers',
      'FEM / FEA introduction, report generation and plotting',
    ],
  },
  {
    title: 'SolidWorks — Part, Assembly & Sheet Metal',
    slug: 'solidworks-part-assembly',
    category: 'Mechanical CADD',
    software: 'SolidWorks',
    level: 'Intermediate',
    price: 10500,
    mrp: 14000,
    durationWeeks: 8,
    shortDescription:
      'Go from sketcher basics to top-down assemblies, sheet metal, weldments and fully detailed production drawings.',
    description:
      'SolidWorks is a solid modeling computer-aided design and computer-aided engineering application used for part modeling, assembly design, sheet metal, weldments and detailing, with an integrated simulation and product data management workflow.\n\nThe course follows the same practical, project-led method we use in the classroom — every concept is mastered on real components before moving on.',
    outcomes: [
      'Build robust, fully defined sketches in 2D and 3D',
      'Model parts with advanced feature and surface tools',
      'Create bottom-up and top-down assemblies',
      'Produce exploded views, BOMs and balloon callouts',
      'Work with sheet metal and weldment environments',
      'Apply GD&T correctly on detail drawings',
    ],
    syllabus: [
      'Sketcher basics and 3D sketching',
      'Part modeling and reference geometries',
      'Editing features and advanced modeling tools',
      'Configuration and design tables / library features',
      'Import and export of files, surface overview',
      'Bottom-up and top-down assembly',
      'Exploding assemblies, simulation and detailing',
      'BOM and balloon tools',
      'Sheet metal, weldment and PDM Works',
      'GD&T',
    ],
  },
  {
    title: 'Primavera P6 — Project Planning & Control',
    slug: 'primavera-p6-project-planning',
    category: 'Project Management',
    software: 'Primavera',
    level: 'Intermediate',
    price: 13500,
    mrp: 18000,
    durationWeeks: 6,
    shortDescription:
      'Plan, schedule, resource-load and track projects of any size in Oracle Primavera P6 Enterprise PPM.',
    description:
      "Oracle's Primavera P6 Enterprise Project Portfolio Management is the most powerful, robust, and easy-to-use solution for globally prioritizing, planning, managing, and executing projects, programs, and portfolios. It provides a single solution for managing projects of any size, adapts to various levels of complexity within a project, and intelligently scales to meet the needs of various roles, functions, or skill levels in your organization and on your project team.",
    outcomes: [
      'Build a correct work breakdown structure',
      'Create activities, relationships and constraints',
      'Schedule and identify the critical path',
      'Define roles and resources, then level them',
      'Set a baseline and track progress against it',
      'Generate professional reports for stakeholders',
    ],
    syllabus: [
      'Data structure of Primavera and calendars',
      'Work breakdown structure',
      'Activities, relationships and constraints',
      'Scheduling',
      'Activity, resource and project codes',
      'Create and assign roles and resources',
      'Resource analysis and levelling',
      'Baseline, update and track project progress',
      'User defined fields, global change and views',
      'Check in / check out',
      'Generate reports',
    ],
  },
  {
    title: 'ETABS — Building Analysis & Design',
    slug: 'etabs-building-analysis',
    category: 'Civil CADD',
    software: 'ETABS',
    level: 'Advanced',
    price: 12000,
    mrp: 15500,
    durationWeeks: 8,
    shortDescription:
      'Model, analyse and design buildings of any height with 3D object-based modelling and automated design optimization.',
    description:
      'ETABS is the ultimate integrated software package for the structural analysis and design of buildings. Incorporating 40 years of continuous research and development, it offers unmatched 3D object based modeling and visualization tools, blazingly fast linear and nonlinear analytical power, sophisticated and comprehensive design capabilities for a wide range of materials, and insightful graphic displays, reports, and schematic drawings.\n\nFrom the start of design conception through the production of schematic drawings, ETABS integrates every aspect of the engineering design process.',
    outcomes: [
      'Generate floor and elevation framing rapidly',
      'Convert CAD drawings directly into ETABS models',
      'Design steel and concrete frames with automated optimization',
      'Design composite beams, columns and shear walls',
      'Run capacity checks for steel connections and base plates',
      'Produce customizable analysis and design reports',
    ],
    syllabus: [
      'Introduction to structural engineering',
      'Model generation and editing',
      'Water tank design',
      'Slab design',
      'Staircase design',
      'Shear wall design',
      'Assigning loads and load combinations',
      'Analysis and design results interpretation',
    ],
  },
];

async function main() {
  console.log('\nSeeding CADD Software Firestore data…\n');

  // ---------------------------------------------------------------- courses
  for (const course of COURSES) {
    const existing = await db.collection('courses').where('slug', '==', course.slug).limit(1).get();
    const payload = {
      ...course,
      language: 'English / Bengali',
      certificate: true,
      published: true,
      studentsCount: 0,
      thumbnailUrl: '',
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (existing.empty) {
      await db.collection('courses').add({ ...payload, createdAt: FieldValue.serverTimestamp() });
      console.log(`  + created course  ${course.title}`);
    } else {
      await existing.docs[0].ref.set(payload, { merge: true });
      console.log(`  ~ updated course  ${course.title}`);
    }
  }

  // -------------------------------------------------------- payment settings
  await db.collection('settings').doc('payment').set(
    {
      upiId: '',
      accountName: 'CADD Software Training Services Private Limited',
      qrImageUrl: '',
      supportPhone: '+91-9612909791',
      instructions:
        'Scan the QR code with any UPI app, pay the exact course fee, then enter the 12-digit UTR / reference number and upload the payment screenshot below. Our team verifies payments within 24 working hours.',
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  console.log('  ~ payment settings written (upload the QR from /admin/settings)');

  // ------------------------------------------------------ sample certificate
  await db.collection('certificates').doc('CSTS/2024/0001').set(
    {
      registrationNo: 'CSTS/2024/0001',
      studentName: 'Sample Student',
      courseName: 'AutoCAD 2D + 3D for Civil Engineers',
      grade: 'A',
      issuedOn: Date.now(),
      valid: true,
    },
    { merge: true },
  );
  console.log('  ~ sample certificate CSTS/2024/0001 written');

  // ------------------------------------------------------------ admin user
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  if (adminEmail) {
    try {
      const user = await auth.getUserByEmail(adminEmail);
      await db.collection('users').doc(user.uid).set(
        {
          uid: user.uid,
          name: user.displayName || 'Administrator',
          email: user.email,
          role: 'admin',
          blocked: false,
          createdAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
      console.log(`  + ${adminEmail} promoted to admin`);
    } catch {
      console.log(
        `  ! No Firebase Auth user found for ${adminEmail}.\n` +
          '    Register that email at /register first, then run the seed again.',
      );
    }
  } else {
    console.log('  ! SEED_ADMIN_EMAIL not set — no admin was promoted.');
  }

  console.log('\nDone.\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
