require('dotenv').config();
const { sequelize, Project, Task, Label } = require('../models');

const LABELS = [
  { name: 'Desarrollo', color: '#818cf8' },
  { name: 'Diseño',     color: '#34d399' },
  { name: 'Marketing',  color: '#fbbf24' },
  { name: 'QA',         color: '#f87171' },
  { name: 'DevOps',     color: '#06b6d4' },
];

// Para asociar el seed a un usuario real de Supabase, configura:
// SEED_USER_ID=<uuid-del-usuario> en .env antes de correr `npm run seed`
const SEED_USER_ID = process.env.SEED_USER_ID || null;

const PROJECTS = [
  { name: 'App E-commerce',      description: 'Plataforma de ventas online con catálogo y carrito de compras.',               user_id: SEED_USER_ID },
  { name: 'Dashboard Analytics', description: 'Panel de métricas y visualización de datos para clientes.',                    user_id: SEED_USER_ID },
  { name: 'API Gateway',         description: 'Servicio central de enrutamiento y autenticación de microservicios.',           user_id: SEED_USER_ID },
];

// Genera fechas relativas a hoy para que el seed se vea en el calendario actual
function relDate(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

const TASK_DEFS = (ids) => [
  // App E-commerce
  { project_id: ids[0], title: 'Diseño de base de datos',      description: 'Modelado de tablas para productos, usuarios y pedidos.', status: 'done',        priority: 'high',   due_date: relDate(-5), hora_limite: '10:00:00', labels: ['Desarrollo'] },
  { project_id: ids[0], title: 'Implementar autenticación JWT', description: 'Login, registro y refresh token.',                       status: 'done',        priority: 'high',   due_date: relDate(-3), hora_limite: '11:00:00', labels: ['Desarrollo'] },
  { project_id: ids[0], title: 'Módulo de pagos con Stripe',   description: 'Integración de checkout y webhooks.',                    status: 'in_progress', priority: 'high',   due_date: relDate(0),  hora_limite: '14:00:00', labels: ['Desarrollo'] },
  { project_id: ids[0], title: 'Tests de integración',         description: 'Cobertura mínima del 80% en endpoints críticos.',        status: 'todo',        priority: 'medium', due_date: relDate(2),  hora_limite: '09:00:00', labels: ['QA'] },
  { project_id: ids[0], title: 'Deploy en AWS',                description: 'Configurar EC2, RDS y S3.',                              status: 'todo',        priority: 'low',    due_date: null,        hora_limite: null,       labels: ['DevOps'] },
  // Dashboard Analytics
  { project_id: ids[1], title: 'Definir esquema de eventos',   description: 'Estructura del tracking de eventos de usuario.',         status: 'done',        priority: 'high',   due_date: relDate(-4), hora_limite: '08:00:00', labels: ['Desarrollo'] },
  { project_id: ids[1], title: 'Componente de gráficas',       description: 'Charts de línea, barra y pie con Recharts.',             status: 'in_progress', priority: 'medium', due_date: relDate(1),  hora_limite: '16:00:00', labels: ['Diseño', 'Desarrollo'] },
  { project_id: ids[1], title: 'Filtros por rango de fecha',   description: 'Selector de fechas y lógica de filtrado.',               status: 'in_progress', priority: 'medium', due_date: relDate(3),  hora_limite: '11:30:00', labels: ['Desarrollo'] },
  { project_id: ids[1], title: 'Exportar reportes CSV',        description: 'Generación y descarga de reportes.',                     status: 'todo',        priority: 'low',    due_date: null,        hora_limite: null,       labels: ['Marketing'] },
  // API Gateway
  { project_id: ids[2], title: 'Rate limiting',                description: 'Implementar throttling por IP y API key.',               status: 'in_progress', priority: 'high',   due_date: relDate(0),  hora_limite: '15:00:00', labels: ['Desarrollo', 'DevOps'] },
  { project_id: ids[2], title: 'Circuit breaker pattern',      description: 'Manejo de fallos entre microservicios.',                 status: 'todo',        priority: 'high',   due_date: relDate(4),  hora_limite: '10:30:00', labels: ['Desarrollo'] },
  { project_id: ids[2], title: 'Documentación OpenAPI',        description: 'Swagger con todos los endpoints documentados.',          status: 'todo',        priority: 'medium', due_date: relDate(6),  hora_limite: '17:00:00', labels: ['Desarrollo'] },
];

async function seed() {
  await sequelize.sync({ force: true });
  console.log('Tables recreated.');

  const labels   = await Label.bulkCreate(LABELS, { validate: true });
  const labelMap = Object.fromEntries(labels.map(l => [l.name, l]));

  const projects = await Project.bulkCreate(PROJECTS, { validate: true });
  const ids      = projects.map(p => p.id);

  for (const def of TASK_DEFS(ids)) {
    const { labels: labelNames = [], ...taskData } = def;
    const task = await Task.create(taskData);
    const toAssign = labelNames.map(n => labelMap[n]).filter(Boolean);
    if (toAssign.length) await task.setLabels(toAssign);
  }

  console.log(`Seed completo: ${projects.length} proyectos, ${TASK_DEFS(ids).length} tareas, ${labels.length} etiquetas.`);
  await sequelize.close();
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
