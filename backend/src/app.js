require('dotenv').config();
const express        = require('express');
const cors           = require('cors');
const helmet         = require('helmet');
const swaggerUi      = require('swagger-ui-express');
const swaggerSpec    = require('./config/swagger');
const errorHandler   = require('./middleware/errorHandler');
const { requireAuth } = require('./middleware/auth');
const projectsRouter = require('./routes/projects.routes');
const tasksRouter    = require('./routes/tasks.routes');
const labelsRouter   = require('./routes/labels.routes');
const { sequelize }  = require('./models');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production'
    ? undefined
    : false,          // Swagger UI necesita inline scripts/styles en dev
}));
app.use(cors({
  origin:  process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Swagger UI — deshabilitado en produccion
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'TaskFlow API Docs',
    swaggerOptions: { persistAuthorization: true },
  }));
}

// Public
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// Protected API
app.use('/api/projects', requireAuth, projectsRouter);
app.use('/api/tasks',    requireAuth, tasksRouter);
app.use('/api/labels',   requireAuth, labelsRouter);

app.use(errorHandler);

sequelize
  .sync({ alter: false })
  .then(() => {
    console.log('Database synced.');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Unable to sync database:', err.message);
    process.exit(1);
  });

module.exports = app;
