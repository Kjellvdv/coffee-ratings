# Guía de Despliegue - Coffee Rater

Esta guía te llevará paso a paso desde el código local hasta tener Coffee Rater funcionando en producción y accesible por internet.

## Tabla de Contenidos

1. [Pre-requisitos](#pre-requisitos)
2. [Opción 1: Railway (Recomendado)](#opción-1-railway-recomendado)
3. [Opción 2: Render](#opción-2-render)
4. [Verificación Post-Despliegue](#verificación-post-despliegue)
5. [Troubleshooting](#troubleshooting)
6. [Dominio Personalizado (Opcional)](#dominio-personalizado-opcional)

---

## Pre-requisitos

Antes de comenzar, asegúrate de tener:

- [ ] Código subido a GitHub (repositorio público o privado)
- [ ] Cuenta de GitHub activa
- [ ] La aplicación funciona correctamente en local
- [ ] Has completado los tests de TESTING.md

### Preparar Repositorio para Despliegue

1. **Verificar que .gitignore está correcto**

```bash
# Verificar que estos archivos NO están en git
cat .gitignore
```

Debe incluir:
```
node_modules/
dist/
.env
.env.local
*.log
```

2. **Commit y push todos los cambios**

```bash
git add .
git commit -m "Preparar para despliegue en producción"
git push origin main
```

3. **Verificar build local**

```bash
npm run build
```

✅ Debe completar sin errores.

---

## Opción 1: Railway (Recomendado)

Railway es la opción más fácil y rápida. Incluye PostgreSQL y maneja todo automáticamente.

**Costo**: $5/mes de crédito gratis (suficiente para uso personal)

### Paso 1: Crear Cuenta en Railway

1. Visita https://railway.app
2. Click en "Login" → "Login with GitHub"
3. Autoriza Railway a acceder a tu GitHub
4. ✅ Verificado: Estás en el dashboard de Railway

### Paso 2: Crear Nuevo Proyecto

1. Click en "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Selecciona tu repositorio `coffee-rater`
4. ✅ Verificado: Railway comienza a detectar tu proyecto

### Paso 3: Agregar Base de Datos PostgreSQL

1. En tu proyecto, click en "+ New"
2. Selecciona "Database"
3. Selecciona "Add PostgreSQL"
4. Railway crea la base de datos automáticamente
5. ✅ Verificado: Ves un servicio "PostgreSQL" en tu proyecto

**IMPORTANTE**: Railway automáticamente crea una variable de entorno `DATABASE_URL` que tu aplicación usará.

### Paso 4: Configurar Variables de Entorno

1. Click en tu servicio de la aplicación (no la base de datos)
2. Ve a la pestaña "Variables"
3. Click en "Raw Editor"
4. Agrega las siguientes variables:

```bash
# Railway ya provee DATABASE_URL automáticamente
# Solo necesitas agregar estas:

SESSION_SECRET=GENERA_UNO_ALEATORIO_AQUI_CON_AL_MENOS_32_CARACTERES
NODE_ENV=production
PORT=3000
```

**Generar SESSION_SECRET seguro**:

En tu terminal local, ejecuta:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copia el resultado y úsalo como `SESSION_SECRET`.

5. Click "Deploy" (arriba a la derecha)

### Paso 5: Configurar Build Settings

Railway detecta automáticamente Node.js, pero verifica:

1. Ve a "Settings" de tu servicio
2. En "Build Command", debe estar vacío (usa package.json scripts)
3. En "Start Command", debe estar: `npm start`
4. ✅ Verificado: Settings correctos

### Paso 6: Aplicar Migraciones de Base de Datos

**IMPORTANTE**: Debes ejecutar las migraciones manualmente la primera vez.

Opción A - Desde Railway CLI (Recomendado):

1. Instala Railway CLI:
```bash
npm install -g @railway/cli
```

2. Autentícate:
```bash
railway login
```

3. Linkea tu proyecto:
```bash
cd /workspace/coffee-rater
railway link
```

4. Ejecuta migraciones:
```bash
railway run npm run db:push
```

✅ Verificado: Ves "Database pushed successfully"

Opción B - Conectar temporalmente desde local:

1. En Railway, ve a PostgreSQL → Connect
2. Copia la "Database URL"
3. En local:
```bash
export DATABASE_URL="<la-url-que-copiaste>"
npm run db:push
```

### Paso 7: Desplegar

1. Railway automáticamente despliega cuando detecta cambios en GitHub
2. O puedes forzar redeploy: Click en el servicio → "Deploy" (arriba)
3. Espera 2-5 minutos mientras Railway:
   - Instala dependencias
   - Ejecuta `npm run build`
   - Inicia el servidor

4. ✅ Verificado: Status muestra "Active" con checkmark verde

### Paso 8: Obtener URL de Producción

1. Click en tu servicio de la aplicación
2. Ve a "Settings"
3. En "Networking", verás "Public Networking"
4. Click en "Generate Domain"
5. Railway te da una URL como: `https://coffee-rater-production.up.railway.app`

6. ✅ Verificado: Click en la URL y tu aplicación carga

### Paso 9: Verificación Post-Despliegue

Sigue los pasos en [Verificación Post-Despliegue](#verificación-post-despliegue) más abajo.

---

## Opción 2: Render

Render ofrece un tier gratuito con algunas limitaciones (el servidor se duerme después de 15 minutos de inactividad).

**Costo**:
- Free tier: $0 (con spin-down de 15 min)
- Paid: $7/mes para backend + $7/mes para base de datos

### Paso 1: Crear Cuenta en Render

1. Visita https://render.com
2. Click en "Get Started" → "Sign Up with GitHub"
3. Autoriza Render
4. ✅ Verificado: Estás en el dashboard

### Paso 2: Crear Base de Datos PostgreSQL

1. Click en "New +" → "PostgreSQL"
2. Configuración:
   - Name: `coffee-rater-db`
   - Database: `coffee_rater`
   - User: `coffee_user`
   - Region: Elige el más cercano a tus usuarios
   - PostgreSQL Version: 16 (latest)
   - Plan: Free (o Starter si prefieres)

3. Click "Create Database"
4. Espera 1-2 minutos mientras Render provisiona la base de datos
5. ✅ Verificado: Status muestra "Available"

6. **Copiar URL de Base de Datos**:
   - En la página de la base de datos, busca "Connections"
   - Copia el "Internal Database URL" (NO el External)
   - Se ve como: `postgresql://user:pass@dpg-xxx/dbname`

### Paso 3: Crear Web Service

1. Click en "New +" → "Web Service"
2. Selecciona "Build and deploy from a Git repository"
3. Conecta tu repositorio de GitHub `coffee-rater`
4. Click "Connect"

5. Configuración:
   - Name: `coffee-rater`
   - Region: Mismo que la base de datos
   - Branch: `main`
   - Root Directory: (dejar vacío)
   - Runtime: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: Free (o Starter si prefieres $7/mes sin spin-down)

6. Scroll hacia abajo a "Environment Variables"

### Paso 4: Configurar Variables de Entorno

Click en "Add Environment Variable" y agrega:

```bash
# Variable 1
Key: DATABASE_URL
Value: <pega-el-internal-database-url-que-copiaste>

# Variable 2
Key: SESSION_SECRET
Value: <genera-uno-aleatorio-32-caracteres>

# Variable 3
Key: NODE_ENV
Value: production

# Variable 4
Key: PORT
Value: 3000
```

**Generar SESSION_SECRET**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

7. Click "Create Web Service"

### Paso 5: Esperar Despliegue Inicial

Render comenzará a:
1. Clonar tu repositorio
2. Instalar dependencias
3. Ejecutar build
4. Iniciar servidor

Esto toma 3-5 minutos. Verás los logs en tiempo real.

✅ Verificado: Status cambia a "Live" con punto verde

### Paso 6: Aplicar Migraciones

1. En la página del Web Service, ve a "Shell" (tab arriba)
2. Click "Launch Shell" (esto abre una terminal en tu servidor)
3. Ejecuta:
```bash
npm run db:push
```

4. ✅ Verificado: Ves "Database pushed successfully"

**Nota**: Si Shell no está disponible en el free tier, usa Render CLI:

```bash
# Instalar Render CLI
npm install -g @render/cli

# Login
render login

# Ejecutar comando
render run -s coffee-rater npm run db:push
```

### Paso 7: Obtener URL

1. En la página del Web Service
2. Verás la URL arriba: `https://coffee-rater.onrender.com`
3. Click en ella para abrir tu aplicación

### Paso 8: Verificación Post-Despliegue

Sigue los pasos en [Verificación Post-Despliegue](#verificación-post-despliegue) más abajo.

---

## Verificación Post-Despliegue

Una vez que tu aplicación esté desplegada, sigue estos pasos para verificar que todo funciona:

### 1. Verificar que la Aplicación Carga

1. Abre la URL de producción en tu navegador
2. ✅ Verificar: La página de login carga correctamente
3. ✅ Verificar: No hay errores en la consola del navegador (F12 → Console)
4. ✅ Verificar: Estilos se aplican correctamente (no broken CSS)

### 2. Crear Cuenta de Prueba

1. Click en "Registrarse"
2. Crea una cuenta de prueba:
   - Usuario: `test_production`
   - Email: `test@tudominio.com`
   - Contraseña: `TestPass123!`
   - Nombre: `Usuario Test`

3. ✅ Verificar: El registro funciona
4. ✅ Verificar: Redirige a Mi Colección

### 3. Agregar un Café

1. Click "+ Agregar Café"
2. Completa el wizard completo:
   - Llena información básica
   - Sube una imagen (opcional)
   - Completa el perfil de sabor
   - Guarda como público

3. ✅ Verificar: Redirige a Mi Colección
4. ✅ Verificar: El café aparece correctamente

### 4. Verificar Feed Social

1. Click "Ver Comunidad"
2. ✅ Verificar: El café que acabas de agregar aparece en el feed
3. ✅ Verificar: El perfil de sabor se muestra correctamente
4. Click "Ver Detalles"
5. ✅ Verificar: La página de detalles carga correctamente

### 5. Verificar Búsqueda y Filtros

1. Vuelve a Mi Colección
2. Agrega 2-3 cafés más (puede ser rápido, omitir perfil)
3. ✅ Verificar: Búsqueda funciona
4. ✅ Verificar: Filtros funcionan
5. ✅ Verificar: Stats se calculan correctamente

### 6. Verificar Exportación

1. Click "Exportar" → "Exportar como JSON"
2. ✅ Verificar: Descarga el archivo
3. ✅ Verificar: El JSON es válido y contiene los datos

### 7. Verificar Persistencia de Sesión

1. Recarga la página (F5)
2. ✅ Verificar: Sigues logueado
3. Cierra el navegador
4. Reabre y vuelve a la URL
5. ✅ Verificar: Sigues logueado

### 8. Verificar en Móvil

1. Abre la URL en tu teléfono móvil
2. ✅ Verificar: La interfaz se adapta correctamente
3. ✅ Verificar: Todos los botones funcionan
4. ✅ Verificar: Puedes completar el wizard en móvil

### 9. Performance Check (Opcional pero Recomendado)

1. Abre Chrome DevTools (F12)
2. Ve a "Lighthouse" tab
3. Click "Analyze page load"
4. ✅ Verificar: Performance > 70
5. ✅ Verificar: Accessibility > 90
6. ✅ Verificar: Best Practices > 80

### 10. Verificar Logs (Para Debugging)

**En Railway**:
1. Ve a tu servicio → "Deployments"
2. Click en el deployment activo → "View Logs"
3. ✅ Verificar: No hay errores críticos

**En Render**:
1. Ve a tu Web Service → "Logs"
2. ✅ Verificar: No hay errores críticos

---

## Troubleshooting

### Problema: "Application Error" o "502 Bad Gateway"

**Causa**: El servidor no está iniciando correctamente.

**Solución**:
1. Verifica los logs del servidor
2. Asegúrate de que todas las variables de entorno están configuradas
3. Verifica que `npm start` funciona localmente después de `npm run build`
4. Asegúrate de que el PORT está configurado correctamente

### Problema: "DATABASE_URL must be set"

**Causa**: La variable de entorno DATABASE_URL no está configurada.

**Solución**:
- **Railway**: El PostgreSQL debe estar en el mismo proyecto. Railway lo configura automáticamente.
- **Render**: Verifica que copiaste la "Internal Database URL" correctamente.

### Problema: "Column does not exist" o errores de base de datos

**Causa**: Las migraciones no se han ejecutado.

**Solución**:
1. Conecta al servidor via Shell/CLI
2. Ejecuta `npm run db:push`
3. Redespliega la aplicación

### Problema: "Session store not available"

**Causa**: No se puede conectar a PostgreSQL para almacenar sesiones.

**Solución**:
1. Verifica que DATABASE_URL es correcta
2. Verifica que la base de datos está corriendo
3. En Railway: Asegúrate de que el servicio de PostgreSQL está "Active"
4. En Render: Asegúrate de que estás usando "Internal Database URL"

### Problema: Frontend carga pero API no responde

**Causa**: CORS o rutas de API mal configuradas.

**Solución**:
1. Verifica los logs del servidor
2. En desarrollo local, el proxy de Vite maneja `/api/*`
3. En producción, el servidor Express sirve tanto frontend como backend
4. Asegúrate de que `npm run build` se ejecutó correctamente

### Problema: Imágenes no cargan

**Causa**: Las imágenes se guardan como base64 en la base de datos.

**Solución**:
1. Verifica que las imágenes no son demasiado grandes (< 5MB recomendado)
2. Considera usar un servicio externo como Cloudinary para imágenes grandes

### Problema: El servidor se "duerme" (solo Render free tier)

**Causa**: Render free tier pone el servidor en sleep después de 15 minutos de inactividad.

**Solución**:
- Espera 30-60 segundos al visitar la URL (el servidor se despierta automáticamente)
- O actualiza a Render Starter ($7/mes) para eliminar el spin-down

### Problema: Build falla con "Out of memory"

**Causa**: El servidor tiene poca RAM.

**Solución**:
1. Reduce el build size:
   - Asegúrate de que `node_modules` no está en Git
   - Verifica que solo se instalan dependencias de producción
2. En Render: Actualiza a un plan con más RAM
3. En Railway: El plan básico debería ser suficiente

---

## Dominio Personalizado (Opcional)

Si quieres usar tu propio dominio como `https://coffee-rater.com` en lugar de `https://coffee-rater.railway.app`:

### Paso 1: Comprar Dominio

Compra un dominio en:
- Namecheap: ~$10-15/año
- Google Domains: ~$12/año
- Cloudflare: ~$10/año

### Paso 2: Configurar Dominio en Railway

1. En Railway, ve a tu servicio → "Settings"
2. Scroll a "Networking" → "Custom Domains"
3. Click "Add Domain"
4. Ingresa tu dominio: `coffee-rater.com`
5. Railway te dará un CNAME target (como: `xxx.railway.app`)

### Paso 3: Configurar DNS

1. Ve al panel de tu proveedor de dominio
2. Agrega un registro CNAME:
   - Type: `CNAME`
   - Name: `@` (o deja vacío para root domain)
   - Value: `xxx.railway.app` (el que Railway te dio)
   - TTL: Automatic o 3600

3. Espera 5-60 minutos para propagación DNS

### Paso 4: Configurar Dominio en Render

1. En Render, ve a tu Web Service → "Settings"
2. Scroll a "Custom Domains"
3. Click "Add Custom Domain"
4. Ingresa tu dominio
5. Render te dará instrucciones de CNAME

Sigue las mismas instrucciones de DNS que arriba.

### Paso 5: HTTPS Automático

Tanto Railway como Render configuran HTTPS automáticamente con Let's Encrypt.

✅ Verificar: Tu dominio carga con `https://` después de la propagación.

---

## Monitoreo y Mantenimiento

### Logs

**Ver logs en producción**:

Railway:
```bash
railway logs
```

Render:
- Ve a tu servicio → "Logs" (en la UI)

### Backups de Base de Datos

**Railway**:
- Railway hace backups automáticos
- Puedes crear snapshots manuales en PostgreSQL → "Data" → "Backups"

**Render**:
- Render Starter plan incluye backups diarios
- Free tier no tiene backups automáticos (exporta datos manualmente)

### Actualizar la Aplicación

1. Haz cambios en tu código local
2. Commit y push a GitHub:
```bash
git add .
git commit -m "Agregar nueva funcionalidad"
git push origin main
```

3. Railway/Render automáticamente detecta el push y redespliega

### Rollback (Revertir a Versión Anterior)

**Railway**:
1. Ve a "Deployments"
2. Click en un deployment anterior
3. Click "Redeploy"

**Render**:
1. Ve a "Deploys"
2. Click en un deploy anterior
3. Click "Redeploy"

---

## Checklist Final de Despliegue

Marca todos estos items antes de considerar el despliegue completo:

- [ ] Aplicación desplegada y accesible vía URL pública
- [ ] Base de datos PostgreSQL configurada y migraciones aplicadas
- [ ] Variables de entorno configuradas (SESSION_SECRET, DATABASE_URL, NODE_ENV)
- [ ] Cuenta de prueba creada exitosamente en producción
- [ ] Agregar café funciona correctamente
- [ ] Feed social muestra cafés públicos
- [ ] Búsqueda y filtros funcionan
- [ ] Exportación de datos funciona
- [ ] Sesión persiste después de recargar
- [ ] Aplicación funciona en móvil
- [ ] Performance Lighthouse > 70
- [ ] No hay errores en los logs de producción
- [ ] HTTPS funciona correctamente
- [ ] (Opcional) Dominio personalizado configurado

---

## Costos Estimados

### Railway
- **Hobby**: $5/mes de crédito incluido
  - Web service: ~$2/mes
  - PostgreSQL: ~$1-3/mes
  - **Total**: $3-5/mes (dentro del crédito gratis)

### Render
- **Free Tier**: $0/mes
  - Backend con spin-down después de 15 min
  - Database free por 90 días
- **Starter**: $14/mes
  - Backend sin spin-down: $7/mes
  - Database: $7/mes

### Dominio Personalizado (Opcional)
- $10-15/año (~$1/mes)

---

## Siguientes Pasos

Una vez desplegado:

1. **Comparte tu aplicación**: Envía la URL a amigos para que prueben
2. **Monitorea uso**: Revisa logs y métricas regularmente
3. **Itera**: Implementa el roadmap futuro (ver README.md)

---

## Soporte

Si tienes problemas durante el despliegue:

1. Revisa esta guía completamente
2. Verifica los logs del servidor
3. Consulta la documentación oficial:
   - Railway: https://docs.railway.app
   - Render: https://render.com/docs

---

¡Felicidades! 🎉 Tu aplicación Coffee Rater está ahora en producción y accesible para el mundo entero. ☕

---

**Última actualización**: Febrero 2026
