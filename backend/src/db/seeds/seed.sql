INSERT INTO projects (name, description) VALUES
  ('App E-commerce', 'Plataforma de ventas online con catálogo y carrito de compras'),
  ('Dashboard Analytics', 'Panel de métricas y visualización de datos para clientes'),
  ('API Gateway', 'Servicio central de enrutamiento y autenticación de microservicios')
ON CONFLICT (name) DO NOTHING;

INSERT INTO tasks (project_id, title, description, status, priority, due_date)
SELECT p.id, t.title, t.description, t.status::task_status, t.priority::task_priority, t.due_date
FROM projects p
JOIN (VALUES
  ('App E-commerce', 'Diseño de base de datos', 'Modelado de tablas para productos, usuarios y pedidos', 'done', 'high', '2024-01-15'::date),
  ('App E-commerce', 'Implementar autenticación JWT', 'Login, registro y refresh token', 'done', 'high', '2024-01-20'::date),
  ('App E-commerce', 'Módulo de pagos con Stripe', 'Integración de checkout y webhooks', 'in_progress', 'high', '2024-02-01'::date),
  ('App E-commerce', 'Tests de integración', 'Cobertura mínima del 80% en endpoints críticos', 'todo', 'medium', '2024-02-15'::date),
  ('App E-commerce', 'Deploy en AWS', 'Configurar EC2, RDS y S3', 'todo', 'low', NULL::date),

  ('Dashboard Analytics', 'Definir esquema de eventos', 'Estructura del tracking de eventos de usuario', 'done', 'high', '2024-01-10'::date),
  ('Dashboard Analytics', 'Componente de gráficas', 'Charts de línea, barra y pie con Recharts', 'in_progress', 'medium', '2024-01-25'::date),
  ('Dashboard Analytics', 'Filtros por rango de fecha', 'Selector de fechas y lógica de filtrado', 'in_progress', 'medium', '2024-01-28'::date),
  ('Dashboard Analytics', 'Exportar reportes CSV', 'Generación y descarga de reportes', 'todo', 'low', NULL::date),

  ('API Gateway', 'Rate limiting', 'Implementar throttling por IP y API key', 'in_progress', 'high', '2024-01-22'::date),
  ('API Gateway', 'Circuit breaker pattern', 'Manejo de fallos entre microservicios', 'todo', 'high', '2024-02-05'::date),
  ('API Gateway', 'Documentación OpenAPI', 'Swagger con todos los endpoints documentados', 'todo', 'medium', NULL::date)
) AS t(project_name, title, description, status, priority, due_date)
  ON p.name = t.project_name;
