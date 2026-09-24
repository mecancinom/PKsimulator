# PharmacoSim — Simulador de Farmacocinética Clínica y Biofarmacia

Plataforma educativa interactiva orientada a la enseñanza médica de la farmacocinética clínica y biofarmacia. Permite simular modelos monocompartimentales y bicompartimentales con resolución numérica mediante **Runge-Kutta de 4º orden (RK4)**, múltiples vías de administración (intravenosa en bolo/infusión continua, e inhalatoria con fracción deglutida y depuración ciliar), dosificación múltiple y comparación de escenarios en tiempo real.

---

## 🚀 Cómo visualizar la aplicación en GitHub (GitHub Pages)

Este repositorio ya está preconfigurado para desplegarse automáticamente en **GitHub Pages** mediante **GitHub Actions** con rutas relativas (`base: './'`).

### Pasos para activar GitHub Pages en el repositorio:

1. Ve a tu repositorio en GitHub.
2. Haz clic en la pestaña **Settings** (Configuración).
3. En el menú lateral izquierdo, haz clic en **Pages**.
4. En **Build and deployment** -> **Source**, selecciona:  
   👉 **GitHub Actions**
5. Al hacer un push a la rama `main` (o `master`), el workflow `.github/workflows/deploy.yml` compilará y publicará la aplicación automáticamente.
6. En un par de minutos, podrás abrir y usar la aplicación directamente en la URL generada:  
   `https://<tu-usuario>.github.io/<nombre-del-repositorio>/`

---

## 💻 Ejecución y Desarrollo Local

Para clonar y ejecutar la aplicación en tu entorno local:

### 1. Clonar el repositorio
```bash
git clone https://github.com/<tu-usuario>/<nombre-del-repositorio>.git
cd <nombre-del-repositorio>
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar el servidor de desarrollo
```bash
npm run dev
```
Abre tu navegador en `http://localhost:3000` (o el puerto indicado en la consola).

### 4. Compilar para producción
```bash
npm run build
```
La carpeta generada `/dist` contiene los archivos estáticos listos para ser servidos en cualquier servidor o plataforma web.

### 5. Ejecutar tests unitarios
```bash
npm run test
```

---

## 🛠️ Tecnologías y Arquitectura

- **Framework**: React 19 con TypeScript y Vite.
- **Estilos**: Tailwind CSS 4.
- **Gráficos**: Recharts con curvas dinámicas de concentración y masa de fármaco en compartimentos.
- **Ecuaciones Matemáticas**: KaTeX con representación LaTeX en tiempo real.
- **Solver Numérico**: Algoritmo RK4 de paso adaptativo para modelos diferenciales continuos (EDOs).
- **Iconografía**: Lucide React.
- **Testing**: Vitest con suite de validación de masa y conservación.
