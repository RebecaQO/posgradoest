export const facultyData = [
  {
    id: "doc-01",
    name: "Dr. Marcelo Ramos Quispe",
    degree: "Ph.D. en Estadística Matemática",
    university: "Universidade de São Paulo (USP), Brasil",
    specialty: "Inferencia Bayesiana, Modelos Jerárquicos y Métodos MCMC",
    courses: [
      "Inferencia Estadística Avanzada",
      "Estadística Bayesiana Computacional"
    ],
    bio: "Investigador titular de la UMSA con más de 18 años de trayectoria en modelamiento bayesiano y consultoría para organismos multilaterales (BID, CEPAL).",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    links: {
      scholar: "https://scholar.google.com",
      researchgate: "https://researchgate.net",
      orcid: "https://orcid.org/0000-0002-1825-0091",
      linkedin: "https://linkedin.com"
    }
  },
  {
    id: "doc-02",
    name: "Dra. Elena Vargas Mercado",
    degree: "Ph.D. en Bioestadística",
    university: "Katholieke Universiteit Leuven, Bélgica",
    specialty: "Análisis de Sobrevida, Ensayos Clínicos y Epidemiología Espacial",
    courses: [
      "Diseño de Estudios Epidemiológicos",
      "Análisis de Sobrevida y Modelos de Cox"
    ],
    bio: "Ex-consultora de la Organización Panamericana de la Salud (OPS/OMS) y líder del grupo de investigación en Modelización Epidemiológica de la FCPN.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    links: {
      scholar: "https://scholar.google.com",
      researchgate: "https://researchgate.net",
      orcid: "https://orcid.org/0000-0003-4921-7723",
      linkedin: "https://linkedin.com"
    }
  },
  {
    id: "doc-03",
    name: "M.Sc. Carlos A. Mendoza Flores",
    degree: "M.Sc. en Ciencia de Datos y Computación Científica",
    university: "Universidad Politécnica de Madrid (UPM), España",
    specialty: "Machine Learning, Big Data con Apache Spark y Series de Tiempo",
    courses: [
      "Aprendizaje Estadístico y Machine Learning",
      "Minería de Datos Masivos"
    ],
    bio: "Especialista en arquitecturas de datos distribuidas y aprendizaje profundo. Asesor técnico de entidades financieras y bancarias en Bolivia.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    links: {
      scholar: "https://scholar.google.com",
      researchgate: "https://researchgate.net",
      orcid: "https://orcid.org/0000-0001-9982-3412",
      linkedin: "https://linkedin.com"
    }
  },
  {
    id: "doc-04",
    name: "Dr. Víctor Hugo Tarifa Alarcón",
    degree: "Ph.D. en Estadística Aplicada",
    university: "Universidad de Buenos Aires (UBA), Argentina",
    specialty: "Muestreo Complejo, Métodos Robustos y Encuestas de Hogares",
    courses: [
      "Muestreo Complejo y Diseño de Experimentos",
      "Modelos Lineales Generalizados"
    ],
    bio: "Consultor sénior del Instituto Nacional de Estadística (INE) y docente emérito de la Carrera de Estadística UMSA.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    links: {
      scholar: "https://scholar.google.com",
      researchgate: "https://researchgate.net",
      orcid: "https://orcid.org/0000-0002-6651-4190",
      linkedin: "https://linkedin.com"
    }
  }
];

export const authoritiesData = [
  {
    id: "auth-01",
    name: "Dr. Marcelo Ramos Quispe",
    role: "Director de la Carrera de Estadística",
    degree: "Ph.D. en Ciencias Estadísticas & Modelación Estocástica",
    hierarchy: 1,
    isDirector: true,
    office: "Dirección de Carrera · Edificio FCPN, Campus Cota Cota",
    bio: "Máxima autoridad de la Carrera de Estadística y Posgrado, responsable de la dirección académica, estratégica e investigación de cuarto nivel.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    tags: ["Dirección de Carrera", "Acreditación CEUB", "Investigación"]
  },
  {
    id: "auth-02",
    name: "Lic. Gabriela Miranda Rios",
    role: "Responsable de Secretaría y Admisiones",
    degree: "Lic. en Administración y Gestión Universitaria",
    hierarchy: 2,
    isDirector: false,
    office: "Secretaría de Posgrado · Campus Cota Cota",
    bio: "Atención al postulante, recepción de requisitos de admisión, matriculación y trámites de homologación de diplomas y títulos de posgrado.",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    tags: ["Secretaría Administrativa", "Admisiones", "Atención al Postulante"]
  },
  {
    id: "auth-03",
    name: "Ing. David Fernández Choque",
    role: "Administrador de Plataforma y Sistemas",
    degree: "Ing. de Sistemas & Infraestructura Cloud",
    hierarchy: 2,
    isDirector: false,
    office: "Soporte Tecnológico · Laboratorio Central",
    bio: "Administración del campus virtual, clúster de cómputo para R/Python y soporte técnico permanente a docentes y maestrantes.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    tags: ["Sistemas", "Plataforma Virtual", "Soporte Técnico"]
  }
];

export const institutionTimeline = [
  {
    year: "Segunda mitad de los años 60",
    title: "La Estadística llega a la Carrera de Economía",
    desc: "La Estadística se incorpora como mención dentro de la Carrera de Economía."
  },
  {
    year: "1972",
    title: "Nace la especialidad de Estadística",
    desc: "Tras la reapertura de la Universidad y la creación de la FCPN, la especialidad se organiza en Matemática con un plan cercano al de Informática. Comienza con pocos estudiantes y docentes, varios recién egresados de maestrías en el exterior."
  },
  {
    year: "1975",
    title: "Un plan de estudios para la licenciatura",
    desc: "Tras resolver gradualmente las dificultades iniciales de recursos, se estructura un plan de estudios acorde con las necesidades de la licenciatura."
  },
  {
    year: "1979",
    title: "Se titula el primer profesional",
    desc: "Con los primeros egresados, comienza una inserción laboral gradual en el INE y en la docencia universitaria."
  },
  {
    year: "1984",
    title: "La Carrera alcanza independencia",
    desc: "Por resolución del IX Congreso Nacional de Universidades, Estadística se separa del Departamento de Matemática y comienza a funcionar de manera independiente."
  },
  {
    year: "1985",
    title: "Creación del IETA",
    desc: "Se crea el Instituto de Estadística Teórica y Aplicada para apoyar la investigación. Su reglamento se aprobaría en 1994."
  },
  {
    year: "1986",
    title: "Un currículo más flexible",
    desc: "El plan incorpora materias optativas para que los estudiantes profundicen en áreas como Administración, Biología, Economía, Informática y Sociología."
  },
  {
    year: "Segunda mitad de los años 80",
    title: "Aumenta la matrícula y crece el desafío de titulación",
    desc: "La matrícula supera el centenar y fluctúa entre 90 y 120 estudiantes. Aumentan los egresados, pero no al mismo ritmo que los titulados."
  },
  {
    year: "1994",
    title: "Reglamento de funcionamiento",
    desc: "El reglamento del Instituto de Estadística Teórica y Aplicada se aprueba mediante Resolución HCU Nº 082/94, el 7 de julio."
  },
  {
    year: "1995–1997",
    title: "Fortalecimiento de la biblioteca",
    desc: "La biblioteca especializada amplía sus colecciones con ediciones actualizadas para estudiantes y docentes."
  },
  {
    year: "Actualidad",
    title: "Nuevas modalidades de graduación",
    desc: "La Carrera trabaja para reducir la brecha de titulación con tesis y trabajo dirigido; la graduación por excelencia también forma parte de sus reglamentos."
  }
];
