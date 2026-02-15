# Deployment Checklist - Coffee Rater

Use esta lista antes y después del despliegue para asegurar que todo funcione correctamente.

## Pre-Despliegue

### Verificación Local

- [ ] `npm run build` completa sin errores
- [ ] `npm run check` pasa sin errores de TypeScript
- [ ] La aplicación funciona correctamente en local (ver TESTING.md)
- [ ] Todos los tests manuales principales completados
- [ ] No hay console.errors en el navegador
- [ ] Imágenes se cargan correctamente
- [ ] Export JSON/CSV funciona

### Código y Git

- [ ] Todos los cambios committed
- [ ] `.gitignore` incluye `.env`, `node_modules`, `dist`
- [ ] `.env` NO está en Git (verificar con `git status`)
- [ ] Código pusheado a GitHub: `git push origin main`
- [ ] README.md actualizado con información del proyecto
- [ ] DEPLOYMENT.md revisado

### Variables de Entorno

- [ ] `SESSION_SECRET` generado (32+ caracteres aleatorios)
- [ ] `DATABASE_URL` preparado (se configurará en plataforma)
- [ ] `NODE_ENV=production` listo para configurar

## Durante el Despliegue

### Railway

- [ ] Cuenta creada en Railway
- [ ] Repositorio conectado
- [ ] PostgreSQL agregado al proyecto
- [ ] Variables de entorno configuradas:
  - [ ] `SESSION_SECRET`
  - [ ] `NODE_ENV=production`
  - [ ] `DATABASE_URL` (auto-configurado por Railway)
- [ ] Migraciones ejecutadas: `railway run npm run db:push`
- [ ] Dominio generado y accesible
- [ ] Build completo exitosamente (ver logs)
- [ ] Servidor iniciado (status "Active")

### Render

- [ ] Cuenta creada en Render
- [ ] PostgreSQL database creada
- [ ] Internal Database URL copiado
- [ ] Web Service creado y configurado
- [ ] Variables de entorno configuradas:
  - [ ] `DATABASE_URL` (Internal URL)
  - [ ] `SESSION_SECRET`
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=3000`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm start`
- [ ] Migraciones ejecutadas via Shell o CLI
- [ ] Status "Live" con punto verde
- [ ] URL accesible

## Post-Despliegue

### Verificación Básica

- [ ] URL de producción carga (no 502/500 errors)
- [ ] Página de login se muestra correctamente
- [ ] Estilos CSS aplicados correctamente
- [ ] No hay errores en consola del navegador (F12)
- [ ] HTTPS funciona (candado verde en navegador)

### Funcionalidad Core

- [ ] Registro de usuario funciona
- [ ] Login funciona
- [ ] Sesión persiste después de reload
- [ ] Agregar café funciona (wizard completo)
- [ ] Café aparece en Mi Colección
- [ ] Café público aparece en Feed
- [ ] Café privado NO aparece en Feed
- [ ] Búsqueda funciona
- [ ] Filtros funcionan
- [ ] Export JSON descarga correctamente
- [ ] Export CSV descarga correctamente
- [ ] Logout funciona

### Verificación de Datos

- [ ] Stats se calculan correctamente
- [ ] Perfil de sabor se calcula y muestra
- [ ] Imágenes subidas se muestran
- [ ] Colores extraídos se muestran
- [ ] Fecha de creación es correcta

### Performance y Móvil

- [ ] Lighthouse Performance > 70 (Chrome DevTools)
- [ ] Lighthouse Accessibility > 90
- [ ] Lighthouse Best Practices > 80
- [ ] Aplicación funciona en móvil (probado en teléfono real)
- [ ] Wizard completo funciona en móvil
- [ ] Headers responsive funcionan
- [ ] Botones son fáciles de tocar en móvil

### Logs y Monitoreo

- [ ] Logs del servidor no muestran errores críticos
- [ ] No hay "DATABASE_URL must be set" en logs
- [ ] No hay errores de migración en logs
- [ ] Sesiones se guardan correctamente (no "Session store not available")

### Multi-Usuario

- [ ] Crear segundo usuario funciona
- [ ] Segundo usuario no ve cafés del primero en Mi Colección
- [ ] Ambos usuarios ven cafés públicos en Feed
- [ ] Usuario no puede editar café de otro (cuando esté implementado)

### Seguridad

- [ ] HTTPS habilitado (no HTTP)
- [ ] Cookies son httpOnly
- [ ] SESSION_SECRET es aleatorio y seguro (no "change-in-production")
- [ ] No se exponen secretos en el frontend
- [ ] Contraseñas hasheadas con bcrypt
- [ ] Rutas protegidas requieren autenticación

## Opcional (Si Aplica)

### Dominio Personalizado

- [ ] Dominio comprado y configurado
- [ ] DNS CNAME configurado correctamente
- [ ] Dominio propagado (5-60 minutos)
- [ ] HTTPS funciona en dominio personalizado
- [ ] Redirección de www a no-www (o viceversa)

### Backups

- [ ] Backups automáticos configurados (Railway/Render paid plan)
- [ ] O: Proceso manual de backup documentado
- [ ] Backup inicial creado manualmente

### Monitoreo

- [ ] Configurado monitoreo de uptime (opcional)
- [ ] Alertas de error configuradas (opcional)
- [ ] Analytics configurado (opcional)

## Troubleshooting Durante Verificación

### Si algo falla:

1. **Revisa los logs**
   - Railway: Deployments → View Logs
   - Render: Logs tab

2. **Verifica variables de entorno**
   - Todas configuradas correctamente
   - Sin espacios extra
   - DATABASE_URL tiene formato correcto

3. **Verifica migraciones**
   ```bash
   railway run npm run db:push
   # o
   render run -s coffee-rater npm run db:push
   ```

4. **Redeploy**
   - A veces un simple redeploy soluciona problemas
   - Railway: Click "Redeploy"
   - Render: Click "Manual Deploy"

5. **Consulta DEPLOYMENT.md**
   - Sección de Troubleshooting tiene soluciones detalladas

## Comunicación del Lanzamiento

Una vez que todo esté verificado:

- [ ] URL compartida con usuarios beta
- [ ] Instrucciones de uso enviadas
- [ ] Feedback form preparado (opcional)
- [ ] Monitoreo activo en los primeros días

## Mantenimiento Continuo

- [ ] Revisar logs semanalmente
- [ ] Monitorear uso de recursos (RAM, CPU, Database size)
- [ ] Actualizar dependencias mensualmente
- [ ] Responder a feedback de usuarios
- [ ] Implementar mejoras del roadmap

---

## Quick Commands

### Ver logs en producción
```bash
# Railway
railway logs

# Render
# (usar UI en render.com)
```

### Ejecutar migraciones
```bash
# Railway
railway run npm run db:push

# Render
render run -s coffee-rater npm run db:push
```

### Forzar redeploy
```bash
# Railway
railway up

# Git push (ambos)
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

### Abrir shell en producción
```bash
# Railway
railway run bash

# Render
# (usar Shell tab en UI)
```

---

## Estado de Despliegue

**Fecha de último despliegue**: _______________

**Plataforma**: [ ] Railway [ ] Render [ ] Otra: _______________

**URL de producción**: _______________________________________________

**Dominio personalizado**: [ ] No [ ] Sí: ___________________________

**Plan/Tier**: _______________________________________________

**Notas**:
___________________________________________________________________
___________________________________________________________________
___________________________________________________________________

---

## Checklist Rápido (para redeploys)

Para actualizaciones futuras, solo necesitas verificar:

- [ ] `npm run build` funciona localmente
- [ ] Código pusheado a GitHub
- [ ] Deploy automático completo (Railway/Render)
- [ ] URL carga correctamente
- [ ] Nueva funcionalidad funciona
- [ ] No hay errores en logs

---

**¡Felicitaciones!** 🎉

Si todos los items están marcados, tu aplicación Coffee Rater está oficialmente en producción y lista para usuarios reales.

☕ **¡A disfrutar del café y del código!** ☕
