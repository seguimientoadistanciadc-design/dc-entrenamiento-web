(function () {
  "use strict";

  window.__DC__ = {
    brand: "DcEntrenamiento",
    tagline: "Entrena con propósito. Progresa con método.",
    handle: "@diegocassas",
    instagram: "https://www.instagram.com/diegocassas/",
    email: "contacto@dcentrenamiento.com",
    stats: [
      { value: 200, suffix: "+", label: "Atletas asesorados" },
      { value: 5, suffix: " años", label: "De experiencia" },
      { value: 98, suffix: "%", label: "Tasa de satisfacción" },
      { value: 3, suffix: "", label: "Recursos digitales" }
    ],
    services: [
      {
        id: "asesoria-completa",
        name: "Asesoría Completa",
        price: "Consultar",
        desc: "Programa de hipertrofia totalmente personalizado. Análisis de tu historial, diseño de mesociclos, ajuste de volumen semanal y seguimiento continuo. Para el atleta que quiere resultados reales.",
        features: ["Plan de entrenamiento individualizado", "Monitoreo semanal de progreso", "Ajuste de cargas y volumen", "Acceso directo por WhatsApp/email", "Revisión mensual de métricas"]
      },
      {
        id: "asesoria-plan",
        name: "Plan de Entrenamiento",
        price: "Consultar",
        desc: "Un mesociclo completo diseñado para tu nivel y objetivos. Sin seguimiento continuo — para el atleta autónomo que necesita estructura sólida.",
        features: ["Mesociclo de 8–12 semanas", "Selección de ejercicios justificada", "Progresiones de carga", "Guía de ejecución técnica", "Entrega en 48h"]
      },
      {
        id: "revision-tecnica",
        name: "Revisión Técnica",
        price: "Consultar",
        desc: "Auditoría de tu rutina actual. Te digo qué funciona, qué cambiaría y por qué. Sesión de análisis + informe escrito.",
        features: ["Análisis de tu rutina actual", "Informe de puntos de mejora", "Recomendaciones específicas", "Sesión de preguntas por videollamada"]
      }
    ],
    resources: [
      {
        id: "ebook-volumen",
        name: "Guía de Asignación de Volumen",
        price: "Gratis",
        file: "assets/../02 Asignacion del Volumen de Entrenamiento.pdf",
        desc: "Aprende a distribuir el volumen de entrenamiento por grupo muscular según tu nivel. El error más común que frena el progreso, resuelto.",
        tag: "E-BOOK GRATIS"
      },
      {
        id: "ebook-division",
        name: "División del Entrenamiento",
        price: "Gratis",
        file: "assets/../01 6 Pasos Division Entrenamiento Individualizada .pdf",
        desc: "6 pasos para diseñar tu propia división de entrenamiento individualizada. Desde la frecuencia hasta la estructura por bloques.",
        tag: "E-BOOK GRATIS"
      }
    ]
  };
})();
