import Link from 'next/link';
import { ArrowRight, Award, BookOpenCheck, Globe2, Users } from 'lucide-react';
import { programs } from '@/content/programs';
import { ProgramCarousel } from '@/components/site/ProgramCarousel';

/* Shared layout helpers ---------------------------------------------------- */
const wrap = 'mx-auto w-full max-w-[1320px] px-5 sm:px-8';
const label = 'text-[11.5px] font-semibold uppercase tracking-[0.08em] text-neutral-950';
const h2 = 'text-[34px] font-medium leading-[1.12] tracking-[-0.02em] text-neutral-950 sm:text-[44px]';
const lead = 'text-[14px] leading-[1.6] text-neutral-700';
const pillDark =
  'inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-2.5 text-[13px] font-medium text-white transition hover:bg-neutral-800';

const WHY = [
  {
    icon: Globe2,
    title: 'Industry Software',
    body: 'Hands-on training on AutoCAD, Revit, StaadPro, ETABS, SolidWorks, CATIA, Primavera and more.',
  },
  {
    icon: Users,
    title: 'Qualified Instructors',
    body: 'Learn from experienced faculty who bring real project practice into every class.',
  },
  {
    icon: BookOpenCheck,
    title: 'Project-Based Learning',
    body: 'Class room activities supplemented by practice sessions, projects and world class course material.',
  },
  {
    icon: Award,
    title: 'Recognised Certificate',
    body: 'Hologram-verified CADD Software International Certificate — a true testimony of skill.',
  },
];

const SOLUTIONS = [
  { title: 'AutoCAD 2D & 3D', body: 'Drafting, detailing and 3D modelling for civil and mechanical drawings.', img: '/cadd1.jpg', pos: '30% 40%' },
  { title: 'Revit Architecture', body: 'BIM workflows from floor plans to sections, elevations and schedules.', img: '/cadd2.png', pos: '50% 30%' },
  { title: 'StaadPro & ETABS', body: 'Structural analysis and design of buildings, frames and RCC members.', img: '/cadd2.png', pos: '20% 70%' },
  { title: 'SolidWorks & CATIA', body: 'Part modelling, assemblies and production drawings for product design.', img: '/cadd1.jpg', pos: '70% 30%' },
  { title: 'Primavera & MS Project', body: 'Planning, scheduling and controlling real engineering projects.', img: '/cadd1.jpg', pos: '15% 80%' },
  { title: '3ds Max Visualisation', body: 'Photo-realistic rendering and walkthroughs of architectural designs.', img: '/cadd2.png', pos: '80% 50%' },
];

export default function HomePage() {
  return (
    <div className="bg-white font-sans text-neutral-950 antialiased">
      {/* =============================================================== HERO */}
      <section className="pt-12 sm:pt-16">
        <div className={`${wrap} grid gap-8 lg:grid-cols-[1fr_300px] lg:items-start`}>
          <h1 className="text-[44px] font-medium leading-[1.04] tracking-[-0.03em] sm:text-[64px] lg:text-[84px]">
            Let&apos;s Build Your
            <br />
            Engineering Career
          </h1>
          <div className="lg:pt-3">
            <p className={lead}>
              We provide reliable CADD training whenever you need it. With us, you get industry
              software, practical projects, and confidence at every step.
            </p>
            <Link href="/courses" className={`${pillDark} mt-6`}>
              Learn More
            </Link>
          </div>
        </div>

        <div className="mt-10 sm:mt-12">
          <img
            src="/cadd1.jpg"
            alt="Engineer working on a CAD drawing"
            className="h-[300px] w-full object-cover sm:h-[440px] lg:h-[520px]"
            style={{ objectPosition: '50% 35%' }}
          />
        </div>
      </section>

      {/* ====================================================== WHY CHOOSE US */}
      <section className="bg-neutral-100 py-16 sm:py-24">
        <div className={wrap}>
          <p className={label}>/Why Choose Us</p>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px] lg:items-start">
            <h2 className={h2}>
              We specialize in providing
              <br className="hidden sm:block" /> reliable and practical training
            </h2>
            <p className={lead}>
              Whether you need to start a design career, upgrade your skills, or prepare for a job
              in engineering, we&apos;re here to help you achieve your goals with precision and
              speed.
            </p>
          </div>

          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((w) => (
              <div key={w.title}>
                <w.icon size={18} strokeWidth={1.6} />
                <h3 className="mt-4 text-[16px] font-semibold">{w.title}</h3>
                <p className="mt-2 text-[13px] leading-[1.6] text-neutral-600">{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================== EXPERTISE */}
      <section className="py-16 sm:py-24">
        <div className={`${wrap} grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-center`}>
          <div>
            <p className={label}>/Our Expertise</p>
            <h2 className={`${h2} mt-6`}>
              Engineering Expertise
              <br /> You Can Build On
            </h2>
            <p className={`${lead} mt-5 max-w-md`}>
              CADD Software Training Services creates skilled human resources in computer aided
              design, engineering and product lifecycle management — get started now.
            </p>
            <Link href="/register" className={`${pillDark} mt-7`}>
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl bg-neutral-200 p-3">
            <img
              src="/cadd2.png"
              alt="Building section drawing"
              className="h-[280px] w-full rounded-xl object-cover grayscale sm:h-[380px]"
            />
          </div>
        </div>
      </section>

      {/* ========================================================== SOLUTIONS */}
      <section className="bg-neutral-100 py-16 sm:py-24">
        <div className={wrap}>
          <p className={label}>/Our Courses</p>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px] lg:items-start">
            <h2 className={h2}>
              Comprehensive Training
              <br /> Solutions
            </h2>
            <div>
              <p className={lead}>
                We offer a comprehensive range of courses designed to meet the diverse needs of
                students and working professionals.
              </p>
              <Link href="/courses" className={`${pillDark} mt-5`}>
                See All
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SOLUTIONS.map((s) => (
              <Link
                key={s.title}
                href="/courses"
                className="group relative h-[240px] overflow-hidden rounded-2xl bg-neutral-900"
              >
                <img
                  src={s.img}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  style={{ objectPosition: s.pos }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <h3 className="text-[15px] font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-neutral-200">{s.body}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================== PROGRAMS */}
      <section className="py-16 sm:py-24">
        <div className={wrap}>
          <p className={label}>/Programs</p>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px] lg:items-start">
            <h2 className={h2}>
              Programs for Every
              <br /> Engineering Field
            </h2>
            <p className={lead}>
              At CADD Software, we understand that every discipline has unique design challenges.
              That&apos;s why we offer customised programs for a wide range of streams.
            </p>
          </div>

          <div className="mt-12">
            <ProgramCarousel
              items={programs.map((p) => ({ slug: p.slug, name: p.name, body: p.intro[0] }))}
            />
          </div>
        </div>
      </section>

      {/* ======================================================== TECHNOLOGY */}
      <section className="bg-neutral-100 py-16 sm:py-24">
        <div className={wrap}>
          <p className={label}>/Technology</p>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px] lg:items-start">
            <h2 className={h2}>
              Training Technology
              <br /> that Moves You
            </h2>
            <p className={lead}>
              We leverage the latest software technology to improve the way our students learn —
              recorded video lessons, online enrollment and progress tracking.
            </p>
          </div>

          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-neutral-300 sm:grid-cols-4">
            {[
              ['19+', 'Software solutions taught'],
              ['5', 'Specialised CADD programs'],
              ['100%', 'Practical, project-based'],
              ['Intl.', 'Recognised certificate'],
            ].map(([v, t]) => (
              <div key={t} className="bg-white p-7">
                <p className="text-[40px] font-medium tracking-[-0.02em]">{v}</p>
                <p className="mt-1 text-[13px] text-neutral-600">{t}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-neutral-950 px-7 py-8 text-white sm:px-10">
            <p className="max-w-xl text-[22px] font-medium leading-snug tracking-[-0.01em]">
              Ready to move your engineering career forward?
            </p>
            <div className="flex gap-2.5">
              <Link
                href="/register"
                className="rounded-full bg-white px-5 py-2.5 text-[13px] font-medium text-neutral-950 transition hover:bg-neutral-200"
              >
                Enroll Now
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-white/50 px-5 py-2.5 text-[13px] font-medium transition hover:bg-white hover:text-neutral-950"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
