-- Migración: rol de administrador para AppAdmin
-- Ejecutar una vez sobre la base de datos api_dism.
USE api_dism;

ALTER TABLE usuarios
  ADD COLUMN EsAdmin TINYINT(1) NOT NULL DEFAULT 0;

-- Marca como administrador al usuario que necesite entrar en AppAdmin (ajusta el nombre de usuario):
-- UPDATE usuarios SET EsAdmin = 1 WHERE Usuario = 'admin';
