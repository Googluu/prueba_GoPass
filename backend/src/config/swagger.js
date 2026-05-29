const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'TaskFlow API',
      version: '1.0.0',
      description:
        'API REST para gestión de proyectos y tareas. Todos los endpoints (excepto `/api/health`) requieren autenticación mediante JWT de Supabase.',
      contact: { name: 'TaskFlow' },
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Desarrollo local' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT emitido por Supabase Auth. Obtenerlo en el cliente con `supabase.auth.getSession()`.',
        },
      },
      schemas: {
        // ── Proyecto ──────────────────────────────────────────────────
        Project: {
          type: 'object',
          properties: {
            id:               { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
            name:             { type: 'string', maxLength: 100, example: 'Web Redesign' },
            description:      { type: 'string', maxLength: 500, nullable: true, example: 'Rediseño completo del sitio corporativo.' },
            image_url:        { type: 'string', nullable: true, example: 'https://xyz.supabase.co/storage/v1/object/public/project-images/abc.jpg' },
            user_id:          { type: 'string', format: 'uuid', example: '00000000-0000-0000-0000-000000000001' },
            total_tasks:      { type: 'integer', example: 8 },
            todo_count:       { type: 'integer', example: 3 },
            in_progress_count:{ type: 'integer', example: 2 },
            done_count:       { type: 'integer', example: 3 },
            createdAt:        { type: 'string', format: 'date-time' },
            updatedAt:        { type: 'string', format: 'date-time' },
          },
        },
        ProjectInput: {
          type: 'object',
          required: ['name'],
          properties: {
            name:        { type: 'string', minLength: 1, maxLength: 100, example: 'Web Redesign' },
            description: { type: 'string', maxLength: 500, nullable: true, example: 'Rediseño del sitio corporativo.' },
          },
        },
        // ── Tarea ─────────────────────────────────────────────────────
        Task: {
          type: 'object',
          properties: {
            id:          { type: 'string', format: 'uuid' },
            project_id:  { type: 'string', format: 'uuid' },
            title:       { type: 'string', maxLength: 200, example: 'Implementar autenticación OAuth' },
            description: { type: 'string', nullable: true, example: 'Usar Supabase Auth con proveedor Google.' },
            status:      { type: 'string', enum: ['todo', 'in_progress', 'done'], example: 'todo' },
            priority:    { type: 'string', enum: ['low', 'medium', 'high'], example: 'high' },
            due_date:    { type: 'string', format: 'date', nullable: true, example: '2026-06-15' },
            hora_limite: { type: 'string', format: 'time', nullable: true, example: '17:00:00' },
            labels:      { type: 'array', items: { $ref: '#/components/schemas/Label' } },
            project:     { $ref: '#/components/schemas/ProjectRef' },
            createdAt:   { type: 'string', format: 'date-time' },
            updatedAt:   { type: 'string', format: 'date-time' },
          },
        },
        TaskInput: {
          type: 'object',
          required: ['title'],
          properties: {
            title:       { type: 'string', minLength: 1, maxLength: 200, example: 'Implementar autenticación OAuth' },
            description: { type: 'string', nullable: true, example: 'Usar Supabase Auth con proveedor Google.' },
            status:      { type: 'string', enum: ['todo', 'in_progress', 'done'], default: 'todo' },
            priority:    { type: 'string', enum: ['low', 'medium', 'high'], default: 'medium' },
            due_date:    { type: 'string', format: 'date', nullable: true, example: '2026-06-15' },
            hora_limite: { type: 'string', pattern: '^[0-2][0-9]:[0-5][0-9]$', nullable: true, example: '17:00' },
            labelIds:    { type: 'array', items: { type: 'string', format: 'uuid' }, example: [] },
          },
        },
        TaskStatusInput: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['todo', 'in_progress', 'done'], example: 'in_progress' },
          },
        },
        // ── Etiqueta ──────────────────────────────────────────────────
        Label: {
          type: 'object',
          properties: {
            id:        { type: 'string', format: 'uuid' },
            name:      { type: 'string', maxLength: 50, example: 'Desarrollo' },
            color:     { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$', example: '#818cf8' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        LabelInput: {
          type: 'object',
          required: ['name'],
          properties: {
            name:  { type: 'string', minLength: 1, maxLength: 50, example: 'QA' },
            color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$', example: '#f87171' },
          },
        },
        // ── Helpers ───────────────────────────────────────────────────
        ProjectRef: {
          type: 'object',
          properties: {
            id:   { type: 'string', format: 'uuid' },
            name: { type: 'string' },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            data:   { },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status:  { type: 'string', example: 'error' },
            message: { type: 'string', example: 'Descripción del error.' },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Token de autenticación ausente o inválido.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: { status: 'error', message: 'Token inválido o expirado.' },
            },
          },
        },
        NotFound: {
          description: 'Recurso no encontrado.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: { status: 'error', message: 'Proyecto no encontrado.' },
            },
          },
        },
        ValidationError: {
          description: 'Error de validación en los datos enviados.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: { status: 'error', message: 'El nombre del proyecto no puede estar vacío.' },
            },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
    tags: [
      { name: 'Health',   description: 'Estado del servidor' },
      { name: 'Projects', description: 'CRUD de proyectos e imagen de portada' },
      { name: 'Tasks',    description: 'CRUD de tareas, filtros y vistas especiales' },
      { name: 'Labels',   description: 'CRUD de etiquetas' },
    ],
    paths: {
      // ── Health ──────────────────────────────────────────────────────
      '/api/health': {
        get: {
          tags: ['Health'],
          summary: 'Estado del servidor',
          security: [],
          responses: {
            200: {
              description: 'Servidor operativo.',
              content: {
                'application/json': {
                  example: { status: 'ok', timestamp: '2026-05-29T12:00:00.000Z' },
                },
              },
            },
          },
        },
      },

      // ── Projects ─────────────────────────────────────────────────────
      '/api/projects': {
        get: {
          tags: ['Projects'],
          summary: 'Listar proyectos del usuario',
          description: 'Devuelve todos los proyectos del usuario autenticado con contadores de tareas por estado. Permite búsqueda por nombre.',
          parameters: [
            {
              name: 'search',
              in: 'query',
              description: 'Texto para filtrar proyectos por nombre (case-insensitive).',
              schema: { type: 'string', example: 'web' },
            },
          ],
          responses: {
            200: {
              description: 'Lista de proyectos.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data:   { type: 'array', items: { $ref: '#/components/schemas/Project' } },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
          },
        },
        post: {
          tags: ['Projects'],
          summary: 'Crear proyecto',
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ProjectInput' } },
            },
          },
          responses: {
            201: {
              description: 'Proyecto creado.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data:   { $ref: '#/components/schemas/Project' },
                    },
                  },
                },
              },
            },
            400: { $ref: '#/components/responses/ValidationError' },
            401: { $ref: '#/components/responses/Unauthorized' },
          },
        },
      },

      '/api/projects/{id}': {
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'ID del proyecto.' },
        ],
        get: {
          tags: ['Projects'],
          summary: 'Obtener proyecto por ID',
          description: 'Devuelve un proyecto con sus contadores de tareas. Solo accesible si pertenece al usuario autenticado.',
          responses: {
            200: {
              description: 'Proyecto encontrado.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data:   { $ref: '#/components/schemas/Project' },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            404: { $ref: '#/components/responses/NotFound' },
          },
        },
        put: {
          tags: ['Projects'],
          summary: 'Actualizar proyecto',
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ProjectInput' } },
            },
          },
          responses: {
            200: {
              description: 'Proyecto actualizado.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data:   { $ref: '#/components/schemas/Project' },
                    },
                  },
                },
              },
            },
            400: { $ref: '#/components/responses/ValidationError' },
            401: { $ref: '#/components/responses/Unauthorized' },
            404: { $ref: '#/components/responses/NotFound' },
          },
        },
        delete: {
          tags: ['Projects'],
          summary: 'Eliminar proyecto',
          description: 'Elimina el proyecto y todas sus tareas en cascada.',
          responses: {
            204: { description: 'Proyecto eliminado.' },
            401: { $ref: '#/components/responses/Unauthorized' },
            404: { $ref: '#/components/responses/NotFound' },
          },
        },
      },

      '/api/projects/{id}/image': {
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'ID del proyecto.' },
        ],
        post: {
          tags: ['Projects'],
          summary: 'Subir imagen de portada',
          description: 'Sube una imagen al bucket `project-images` de Supabase Storage y actualiza `image_url` del proyecto.',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['image'],
                  properties: {
                    image: { type: 'string', format: 'binary', description: 'Archivo de imagen (jpg, png, webp…).' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Imagen subida y proyecto actualizado.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data:   { $ref: '#/components/schemas/Project' },
                    },
                  },
                },
              },
            },
            400: {
              description: 'No se recibió ningún archivo.',
              content: {
                'application/json': {
                  example: { status: 'error', message: 'No se recibió ningún archivo.' },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            404: { $ref: '#/components/responses/NotFound' },
          },
        },
      },

      '/api/projects/{id}/tasks': {
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'ID del proyecto.' },
        ],
        get: {
          tags: ['Tasks'],
          summary: 'Listar tareas de un proyecto',
          description: 'Devuelve todas las tareas del proyecto incluyendo sus etiquetas. Soporta filtros por estado y prioridad.',
          parameters: [
            { name: 'status',   in: 'query', schema: { type: 'string', enum: ['todo', 'in_progress', 'done'] }, description: 'Filtrar por estado.' },
            { name: 'priority', in: 'query', schema: { type: 'string', enum: ['low', 'medium', 'high'] },       description: 'Filtrar por prioridad.' },
          ],
          responses: {
            200: {
              description: 'Lista de tareas.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data:   { type: 'array', items: { $ref: '#/components/schemas/Task' } },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            404: { $ref: '#/components/responses/NotFound' },
          },
        },
        post: {
          tags: ['Tasks'],
          summary: 'Crear tarea en un proyecto',
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/TaskInput' } },
            },
          },
          responses: {
            201: {
              description: 'Tarea creada con sus etiquetas.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data:   { $ref: '#/components/schemas/Task' },
                    },
                  },
                },
              },
            },
            400: { $ref: '#/components/responses/ValidationError' },
            401: { $ref: '#/components/responses/Unauthorized' },
            404: { $ref: '#/components/responses/NotFound' },
          },
        },
      },

      // ── Tasks ────────────────────────────────────────────────────────
      '/api/tasks/inbox': {
        get: {
          tags: ['Tasks'],
          summary: 'Bandeja de entrada',
          description: 'Devuelve todas las tareas con estado `todo` o `in_progress` del usuario, ordenadas por fecha de creación descendente.',
          responses: {
            200: {
              description: 'Tareas activas del usuario.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data:   { type: 'array', items: { $ref: '#/components/schemas/Task' } },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
          },
        },
      },

      '/api/tasks/today': {
        get: {
          tags: ['Tasks'],
          summary: 'Tareas de hoy',
          description: 'Devuelve las tareas con `due_date` igual a la fecha actual (UTC), ordenadas por prioridad y estado.',
          responses: {
            200: {
              description: 'Tareas de hoy.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data:   { type: 'array', items: { $ref: '#/components/schemas/Task' } },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
          },
        },
      },

      '/api/tasks/range': {
        get: {
          tags: ['Tasks'],
          summary: 'Tareas en rango de fechas',
          description: 'Devuelve las tareas del usuario cuyo `due_date` esté entre `from` y `to` (inclusive). Usado por la vista de calendario semanal.',
          parameters: [
            { name: 'from', in: 'query', required: true, schema: { type: 'string', format: 'date', example: '2026-05-26' }, description: 'Fecha de inicio (YYYY-MM-DD).' },
            { name: 'to',   in: 'query', required: true, schema: { type: 'string', format: 'date', example: '2026-06-01' }, description: 'Fecha de fin (YYYY-MM-DD).' },
          ],
          responses: {
            200: {
              description: 'Tareas en el rango.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data:   { type: 'array', items: { $ref: '#/components/schemas/Task' } },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Faltan parámetros `from` o `to`.',
              content: {
                'application/json': {
                  example: { status: 'error', message: 'Los parámetros from y to son requeridos.' },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
          },
        },
      },

      '/api/tasks/{id}': {
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'ID de la tarea.' },
        ],
        put: {
          tags: ['Tasks'],
          summary: 'Actualizar tarea',
          description: 'Actualiza cualquier campo de la tarea, incluidas sus etiquetas (`labelIds`). Si `labelIds` se omite, las etiquetas no cambian.',
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/TaskInput' } },
            },
          },
          responses: {
            200: {
              description: 'Tarea actualizada.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data:   { $ref: '#/components/schemas/Task' },
                    },
                  },
                },
              },
            },
            400: { $ref: '#/components/responses/ValidationError' },
            401: { $ref: '#/components/responses/Unauthorized' },
            404: { $ref: '#/components/responses/NotFound' },
          },
        },
        delete: {
          tags: ['Tasks'],
          summary: 'Eliminar tarea',
          responses: {
            204: { description: 'Tarea eliminada.' },
            401: { $ref: '#/components/responses/Unauthorized' },
            404: { $ref: '#/components/responses/NotFound' },
          },
        },
      },

      '/api/tasks/{id}/status': {
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'ID de la tarea.' },
        ],
        patch: {
          tags: ['Tasks'],
          summary: 'Actualizar estado de una tarea',
          description: 'Endpoint ligero para cambiar únicamente el `status`. Usado por el kanban drag & drop.',
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/TaskStatusInput' } },
            },
          },
          responses: {
            200: {
              description: 'Estado actualizado.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data:   { $ref: '#/components/schemas/Task' },
                    },
                  },
                },
              },
            },
            400: { $ref: '#/components/responses/ValidationError' },
            401: { $ref: '#/components/responses/Unauthorized' },
            404: { $ref: '#/components/responses/NotFound' },
          },
        },
      },

      // ── Labels ───────────────────────────────────────────────────────
      '/api/labels': {
        get: {
          tags: ['Labels'],
          summary: 'Listar etiquetas',
          description: 'Devuelve todas las etiquetas disponibles (globales, no filtradas por usuario).',
          responses: {
            200: {
              description: 'Lista de etiquetas.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data:   { type: 'array', items: { $ref: '#/components/schemas/Label' } },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
          },
        },
        post: {
          tags: ['Labels'],
          summary: 'Crear etiqueta',
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/LabelInput' } },
            },
          },
          responses: {
            201: {
              description: 'Etiqueta creada.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data:   { $ref: '#/components/schemas/Label' },
                    },
                  },
                },
              },
            },
            400: { $ref: '#/components/responses/ValidationError' },
            401: { $ref: '#/components/responses/Unauthorized' },
          },
        },
      },

      '/api/labels/{id}': {
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'ID de la etiqueta.' },
        ],
        delete: {
          tags: ['Labels'],
          summary: 'Eliminar etiqueta',
          description: 'Elimina la etiqueta. Las tareas que la tenían asignada pierden esa etiqueta automáticamente (cascade en `task_labels`).',
          responses: {
            204: { description: 'Etiqueta eliminada.' },
            401: { $ref: '#/components/responses/Unauthorized' },
            404: { $ref: '#/components/responses/NotFound' },
          },
        },
      },

      '/api/labels/{id}/tasks': {
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'ID de la etiqueta.' },
        ],
        get: {
          tags: ['Labels'],
          summary: 'Tareas de una etiqueta',
          description: 'Devuelve todas las tareas que tienen esta etiqueta asignada, filtradas por los proyectos del usuario autenticado.',
          responses: {
            200: {
              description: 'Tareas con la etiqueta.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data:   { type: 'array', items: { $ref: '#/components/schemas/Task' } },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
          },
        },
      },
    },
  },
  apis: [],
};

module.exports = swaggerJsdoc(options);
