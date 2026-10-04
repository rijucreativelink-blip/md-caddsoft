export interface NavChild {
  label: string;
  href: string;
  description?: string;
}

export interface NavItem {
  label: string;
  href?: string;
  children?: NavChild[];
  columns?: { title: string; items: NavChild[] }[];
  /** Secondary items: shown only from xl up, so the bar never overflows at ~1024px. */
  secondary?: boolean;
}

export const mainNav: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'About Us',
    children: [
      {
        label: 'About CADD Software',
        href: '/about',
        description: 'Who we are, why we exist and who benefits',
      },
      {
        label: 'Our Training Methodology',
        href: '/training-methodology',
        description: 'How we bring out the innate talent in each student',
      },
    ],
  },
  {
    label: 'Courses & Programs',
    columns: [
      {
        title: 'CADD Programs',
        items: [
          { label: 'Civil CADD', href: '/programs/civil-cadd' },
          { label: 'Mechanical CADD', href: '/programs/mechanical-cadd' },
          { label: 'Project Management', href: '/programs/project-management' },
          { label: 'Electrical CADD', href: '/programs/electrical-cadd' },
          { label: 'Architecture CADD', href: '/programs/architecture-cadd' },
        ],
      },
      {
        title: 'Civil CADD',
        items: [
          { label: '3DsMax', href: '/programs/civil-cadd#3dsmax' },
          { label: 'AutoCAD', href: '/programs/civil-cadd#autocad' },
          { label: '2D CAD', href: '/programs/civil-cadd#2d-cad-autocad' },
          { label: '3D CAD', href: '/programs/civil-cadd#3d-cad-autocad' },
          { label: 'E.Tabs', href: '/programs/civil-cadd#etabs' },
          { label: 'Revit (Architecture)', href: '/programs/civil-cadd#revit-architecture' },
          { label: 'StaadPro', href: '/programs/civil-cadd#staadpro' },
          { label: 'RCC Detailing', href: '/programs/civil-cadd#rcc-detailing' },
          { label: 'SAP 2000', href: '/programs/civil-cadd#sap-2000' },
        ],
      },
      {
        title: 'Mechanical CADD',
        items: [
          { label: '2D CAD', href: '/programs/mechanical-cadd#2d-cad-autocad' },
          { label: '3D CAD', href: '/programs/mechanical-cadd#3d-cad-autocad' },
          { label: 'AnsysWorkbench', href: '/programs/mechanical-cadd#ansysworkbench' },
          { label: 'AutoCAD', href: '/programs/mechanical-cadd#autocad' },
          { label: 'CATIA', href: '/programs/mechanical-cadd#catia' },
          { label: 'SolidWorks', href: '/programs/mechanical-cadd#solidworks' },
          { label: 'Creo / Parametric', href: '/programs/mechanical-cadd#pro-e-creo' },
        ],
      },
      {
        title: 'Computer Courses',
        items: [
          { label: 'Basic Computers', href: '/courses?q=Basic+Computers' },
          { label: 'JAVA', href: '/courses?q=JAVA' },
          { label: 'C++', href: '/courses?q=C%2B%2B' },
          { label: 'Web Designing', href: '/courses?q=Web+Designing' },
        ],
      },
    ],
  },
  { label: 'Courses', href: '/courses' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Franchise', href: '/franchise', secondary: true },
  { label: 'Career', href: '/career', secondary: true },
];

export const footerNav = [
  {
    title: 'Company',
    links: [
      { label: 'About CADD Software', href: '/about' },
      { label: 'Our Training Methodology', href: '/training-methodology' },
      { label: 'Career', href: '/career' },
      { label: 'Franchise', href: '/franchise' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
  {
    title: 'Programs',
    links: [
      { label: 'Civil CADD', href: '/programs/civil-cadd' },
      { label: 'Mechanical CADD', href: '/programs/mechanical-cadd' },
      { label: 'Project Management', href: '/programs/project-management' },
      { label: 'Electrical CADD', href: '/programs/electrical-cadd' },
      { label: 'Architecture CADD', href: '/programs/architecture-cadd' },
    ],
  },
  {
    title: 'Students',
    links: [
      { label: 'All Courses', href: '/courses' },
      { label: 'Student Login', href: '/login' },
      { label: 'Create Account', href: '/register' },
      { label: 'My Dashboard', href: '/dashboard' },
      { label: 'Student Verification', href: '/verification' },
    ],
  },
];
