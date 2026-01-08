-- 1. Adicionar order_index em projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS order_index INTEGER;

-- Inicializar valores existentes com ordem baseada na data de criação
WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at DESC) as rn
  FROM projects
)
UPDATE projects SET order_index = ranked.rn
FROM ranked WHERE projects.id = ranked.id;

CREATE INDEX IF NOT EXISTS idx_projects_order ON projects(order_index);

-- 2. Adicionar order_index em project_members
ALTER TABLE project_members ADD COLUMN IF NOT EXISTS order_index INTEGER;

WITH ranked AS (
  SELECT id, row_number() OVER (PARTITION BY project_id ORDER BY created_at) as rn
  FROM project_members
)
UPDATE project_members SET order_index = ranked.rn
FROM ranked WHERE project_members.id = ranked.id;

CREATE INDEX IF NOT EXISTS idx_members_order ON project_members(project_id, order_index);