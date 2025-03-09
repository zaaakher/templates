const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());

// Servir archivos estáticos desde la carpeta templates
app.use("/templates", express.static(path.join(__dirname, "public/templates")));

// Ruta para listar directorios en formato JSON
app.get("/api/templates", async (req, res) => {
  try {
    const templatesPath = path.join(__dirname, "public/templates");
    console.log("Buscando templates en:", templatesPath); // Para debug

    // Verificar si el directorio existe
    try {
      await fs.access(templatesPath);
    } catch (e) {
      console.error("El directorio no existe:", templatesPath);
      return res.status(500).json({ error: "Directory not found" });
    }

    const dirs = await fs.readdir(templatesPath);
    console.log("Directorios encontrados:", dirs); // Para debug

    const templates = await Promise.all(
      dirs.map(async (dir) => {
        const dirPath = path.join(templatesPath, dir);
        const stat = await fs.stat(dirPath);

        if (stat.isDirectory()) {
          const files = await fs.readdir(dirPath);
          const filesInfo = await Promise.all(
            files.map(async (file) => {
              const filePath = path.join(dirPath, file);
              const fileStat = await fs.stat(filePath);
              return {
                name: file,
                path: `/templates/${dir}/${file}`,
                size: fileStat.size,
                modified: fileStat.mtime,
              };
            })
          );

          return {
            name: dir,
            path: `/templates/${dir}`,
            files: filesInfo,
          };
        }
        return null;
      })
    );

    res.json({
      templates: templates.filter((t) => t !== null),
    });
  } catch (error) {
    console.error("Error:", error); // Para debug
    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener información de un template específico
app.get("/api/templates/:template", async (req, res) => {
  try {
    const templatePath = path.join(
      __dirname,
      "public/templates",
      req.params.template
    );
    const files = await fs.readdir(templatePath);

    const filesInfo = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(templatePath, file);
        const stat = await fs.stat(filePath);
        return {
          name: file,
          path: `/templates/${req.params.template}/${file}`,
          size: stat.size,
          modified: stat.mtime,
        };
      })
    );

    res.json({
      name: req.params.template,
      path: `/templates/${req.params.template}`,
      files: filesInfo,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para debug - muestra la estructura de directorios
app.get("/debug", (req, res) => {
  const debugInfo = {
    currentDir: __dirname,
    publicTemplatesPath: path.join(__dirname, "public/templates"),
    exists: fs.existsSync(path.join(__dirname, "public/templates")),
  };
  res.json(debugInfo);
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Directorio actual:", __dirname);
  console.log("Ruta a templates:", path.join(__dirname, "public/templates"));
});
