import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const countOf = async (table) => {
  const { rows } = await pool.query(`SELECT COUNT(*)::int AS count FROM \"${table}\"`);
  return rows[0].count;
};

const seedProjects = async () => {
  if ((await countOf("projects")) > 0) return;

  const items = [
    {
      title: "Model Aircraft Project",
      slug: "model-aircraft-project",
      summary: "RC aircraft design and aerodynamic evaluation",
      description:
        "Designed an RC aircraft emphasizing aerodynamic stability, weight optimization, and material selection. Tested and simulated lift, drag, thrust, and performance characteristics using analytical and computational methods.",
      tools: ["CATIA V5", "ANSYS", "Aerodynamic Analysis", "Material Selection", "Wind Tunnel Testing"],
      featured: true,
      sort_order: 1,
    },
    {
      title: "Structural Analysis of Aerospace Components",
      slug: "structural-analysis-aerospace-components",
      summary: "Structural evaluation using NASTRAN/PATRAN",
      description:
        "Performed comprehensive structural evaluations utilizing NASTRAN and PATRAN to model and interpret complex stress, strain, and deformation responses. Applied multi-method stress analyses encompassing experimental techniques, SOM formulations, and FEA.",
      tools: ["NASTRAN", "PATRAN", "FEA", "Stress Analysis", "SOM"],
      featured: true,
      sort_order: 2,
    },
    {
      title: "IoT Sensor Integration System",
      slug: "iot-sensor-integration-system",
      summary: "IoT architecture exploration for aerospace monitoring",
      description:
        "Explored IoT architectures and sensor systems for aerospace monitoring applications. Applied Python programming for data acquisition and analysis from various sensor inputs.",
      tools: ["Python", "IoT", "Sensors", "Data Analysis"],
      featured: false,
      sort_order: 3,
    },
  ];

  for (const item of items) {
    await pool.query(
      `
      INSERT INTO projects (title, slug, summary, description, tools, featured, sort_order)
      VALUES ($1, $2, $3, $4, $5::text[], $6, $7)
      `,
      [item.title, item.slug, item.summary, item.description, item.tools, item.featured, item.sort_order],
    );
  }
};

const seedExperience = async () => {
  if ((await countOf("experience")) > 0) return;

  await pool.query(
    `
    INSERT INTO experience (company, role, start_date, end_date, location, details, sort_order)
    VALUES ($1, $2, $3::date, $4::date, $5, $6, $7)
    `,
    [
      "Bangalore Aircraft Industries Pvt. Ltd. (BAIL)",
      "Stress Engineer Intern",
      "2025-04-01",
      "2025-05-31",
      "Bengaluru, Karnataka, India",
      [
        "Executed comprehensive structural evaluations of aerospace components utilizing NASTRAN and PATRAN.",
        "Modeled and interpreted complex stress, strain, and deformation responses in aircraft structural elements.",
        "Performed multi-method stress analyses encompassing experimental techniques, classical Strength of Materials (SOM), and Finite Element Analysis (FEA).",
        "Collaborated with senior engineers to validate analysis results against industry standards.",
      ].join("\n"),
      1,
    ],
  );
};

const seedEducation = async () => {
  if ((await countOf("education")) > 0) return;

  const rows = [
    {
      institution: "Parul University, Vadodara",
      degree: "B.Tech in Aeronautical Engineering",
      start_year: 2023,
      end_year: 2027,
      gpa: "CGPA: 7.2",
      details: "Aeronautics/Aviation/Aerospace Science and Technology",
      sort_order: 1,
    },
    {
      institution: "Vidyamangal Residential School",
      degree: "SSC & HSC (GSEB)",
      start_year: 2021,
      end_year: 2023,
      gpa: "",
      details: "Foundation in Science & Mathematics",
      sort_order: 2,
    },
  ];

  for (const row of rows) {
    await pool.query(
      `
      INSERT INTO education (institution, degree, start_year, end_year, gpa, details, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [row.institution, row.degree, row.start_year, row.end_year, row.gpa, row.details, row.sort_order],
    );
  }
};

const seedSkills = async () => {
  if ((await countOf("skills")) > 0) return;

  const skillRows = [
    ["Airflow Analysis", "Aerodynamics"],
    ["Lift & Drag", "Aerodynamics"],
    ["Thrust Dynamics", "Aerodynamics"],
    ["Wind Tunnel Testing", "Aerodynamics"],
    ["Jet Engines", "Propulsion Systems"],
    ["Turbines", "Propulsion Systems"],
    ["Rocket Propulsion", "Propulsion Systems"],
    ["Thermodynamics", "Propulsion Systems"],
    ["FEA", "Structural Analysis"],
    ["Stress Analysis", "Structural Analysis"],
    ["Strength of Materials", "Structural Analysis"],
    ["Deformation Modeling", "Structural Analysis"],
    ["ANSYS", "Software & CAD"],
    ["CATIA V5", "Software & CAD"],
    ["AutoCAD", "Software & CAD"],
    ["SolidWorks", "Software & CAD"],
    ["NASTRAN", "Software & CAD"],
    ["PATRAN", "Software & CAD"],
    ["MATLAB", "Software & CAD"],
    ["Composites", "Materials Science"],
    ["Alloys", "Materials Science"],
    ["Ceramics", "Materials Science"],
    ["Material Selection", "Materials Science"],
    ["Python", "Programming & IoT"],
    ["IoT Architecture", "Programming & IoT"],
    ["Sensor Systems", "Programming & IoT"],
    ["Data Analysis", "Programming & IoT"],
    ["Robotics", "Programming & IoT"],
  ];

  let i = 1;
  for (const [name, category] of skillRows) {
    await pool.query(
      `
      INSERT INTO skills (name, category, proficiency, sort_order)
      VALUES ($1, $2, $3, $4)
      `,
      [name, category, 80, i++],
    );
  }
};

const seedCertifications = async () => {
  if ((await countOf("certifications")) > 0) return;

  const rows = [
    ["IoT - NPTEL (Elite)", "NPTEL"],
    ["Rocket Propulsion", "ISRO"],
    ["CATIA V5 Certification", "Professional"],
    ["Python Programming", "Online Certification"],
    ["Robotics Internship", "Industry Program"],
    ["Certified Industrial Internship", "BAIL, Bangalore"],
  ];

  let i = 1;
  for (const [title, issuer] of rows) {
    await pool.query(
      `
      INSERT INTO certifications (title, issuer, sort_order)
      VALUES ($1, $2, $3)
      `,
      [title, issuer, i++],
    );
  }
};

const seedSettings = async () => {
  if ((await countOf("site_settings")) > 0) return;

  const rows = [
    ["site_title", "Drashti Chaudhari Portfolio"],
    ["tagline", "I engineer the future of flight."],
    ["linkedin_url", "https://www.linkedin.com/in/drashti-chaudhari-a27570351"],
    ["github_url", ""],
    ["email", "drashti10125@gmail.com"],
    ["phone", "+917862865315"],
    ["meta_description", "Aeronautical Engineering portfolio"],
  ];

  for (const [key, value] of rows) {
    await pool.query(
      `
      INSERT INTO site_settings (key, value)
      VALUES ($1, $2)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `,
      [key, value],
    );
  }
};

await seedProjects();
await seedExperience();
await seedEducation();
await seedSkills();
await seedCertifications();
await seedSettings();

console.log("Neon seed complete.");
await pool.end();
