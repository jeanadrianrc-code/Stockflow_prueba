# Guía de Despliegue: StockFlow (Next.js + SQLite)

StockFlow está diseñado utilizando **Next.js (App Router)** y una base de datos local **SQLite** (`better-sqlite3`). 

Debido a que SQLite guarda toda la información (productos, abonos, captures y deudas) en un archivo local (`database.sqlite`), **no es recomendable desplegar esta aplicación en plataformas Serverless como Netlify o Vercel directamente**.

---

## ⚠️ ¿Por qué no usar Netlify o Vercel para SQLite?
1. **Almacenamiento Efímero (Temporal):** Netlify y Vercel funcionan con arquitecturas "Serverless". Cada vez que un usuario entra, se levanta una función temporal. Si registras un cliente, una compra o subes un capture de abono, **se guardará temporalmente, pero se borrará por completo a los pocos minutos** cuando la función se apague.
2. **Solo Lectura:** Los servidores serverless no garantizan permisos de escritura persistentes en disco.

---

## 🚀 Las mejores alternativas para alojar StockFlow (¡Con Base de Datos Persistente!)

Para mantener tu base de datos SQLite segura, persistente y completamente gratuita o de bajo costo, te recomendamos utilizar **Render.com** o **Railway.app**. Estas plataformas te permiten conectar un **Disco Persistente (Volume)** para que tu archivo de base de datos nunca se borre.

---

### Opción A: Despliegue en Render.com (Recomendado y Sencillo)

Render te permite alojar aplicaciones Web de Node.js y conectarles un disco de almacenamiento persistente gratis o muy económico.

1. Crea una cuenta gratuita en [Render.com](https://render.com/).
2. Conecta tu repositorio de GitHub (donde subas este código).
3. Crea un **Web Service** con la siguiente configuración:
   - **Environment:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
4. Ve a la pestaña **Advanced** del servicio en Render y añade una variable de entorno:
   - `PORT` = `3000`
5. Ve a la pestaña **Disks** (Discos) en el panel de control de Render y haz clic en **Add Disk**:
   - **Name:** `sqlite-data`
   - **Mount Path:** `/opt/app-data`
   - **Size:** `1 GB` (suficiente para miles de imágenes en base64 y registros).
6. Modifica la ruta de tu base de datos para que apunte al disco montado en producción agregando una variable de entorno `DATABASE_URL` o configurándola en Render.

---

### Opción B: Despliegue en Railway.app (Rápido y Potente)

Railway es excelente para desplegar Next.js con SQLite mediante Docker o plantillas de Node.

1. Crea una cuenta en [Railway.app](https://railway.app/).
2. Haz clic en **New Project** -> **Deploy from GitHub repo**.
3. Una vez seleccionado tu repositorio, ve a las configuraciones del servicio.
4. Haz clic en **Volumes** -> **Add Volume**:
   - Esto creará un disco persistente. Anota el punto de montaje (ej: `/data`).
5. Configura la variable de entorno en tu aplicación para que guarde el archivo `database.sqlite` dentro de esa carpeta `/data/database.sqlite` en lugar de la raíz del proyecto.
