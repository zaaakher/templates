import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = new Hono()

// Función para generar el HTML del índice
async function generateIndex() {
  const templatesDir = path.join(__dirname, '../../templates')
  const templates = fs.readdirSync(templatesDir)
    .filter(file => fs.statSync(path.join(templatesDir, file)).isDirectory())
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Templates Directory</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            background: #f5f5f5;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 0.5rem;
        }
        .templates {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1rem;
            margin-top: 2rem;
        }
        .template-card {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }
        .template-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        .template-card h2 {
            margin: 0 0 1rem 0;
            color: #2c3e50;
        }
        .template-links {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
        .template-links a {
            text-decoration: none;
            color: #3498db;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            background: #f8f9fa;
            transition: background 0.2s;
        }
        .template-links a:hover {
            background: #e9ecef;
        }
    </style>
</head>
<body>
    <h1>Available Templates</h1>
    <div class="templates">
        ${templates.map(template => {
            const templatePath = path.join(templatesDir, template)
            const files = fs.readdirSync(templatePath)
            return `
                <div class="template-card">
                    <h2>${template}</h2>
                    <div class="template-links">
                        ${files.map(file => `
                            <a href="templates/${template}/${file}">${file}</a>
                        `).join('')}
                    </div>
                </div>
            `
        }).join('')}
    </div>
</body>
</html>
  `
  return html
}

// Middleware para logging
app.use('*', async (c, next) => {
  console.log(`Request path: ${c.req.path}`)
  await next()
})

// Servir archivos estáticos desde la carpeta templates
app.use('/templates/*', serveStatic({ 
  root: '../templates',
  rewriteRequestPath: (path) => {
    console.log('Original path:', path)
    return path.replace('/templates/', '')
  }
}))

// Ruta principal que muestra el índice
app.get('/', async (c) => {
  return c.html(await generateIndex())
})

// Ruta para generar el archivo index.html estático
app.get('/generate-static', async (c) => {
  const html = await generateIndex()
  const outputPath = path.join(__dirname, '../../docs/index.html')
  
  // Asegurarse de que el directorio docs existe
  fs.mkdirSync(path.join(__dirname, '../../docs'), { recursive: true })
  
  // Copiar la carpeta templates a docs
  const templatesDir = path.join(__dirname, '../../templates')
  const docsTemplatesDir = path.join(__dirname, '../../docs/templates')
  fs.cpSync(templatesDir, docsTemplatesDir, { recursive: true })
  
  // Guardar el index.html
  fs.writeFileSync(outputPath, html)
  return c.text('Static files generated in docs folder')
})

serve({
  fetch: app.fetch,
  port: 4000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
