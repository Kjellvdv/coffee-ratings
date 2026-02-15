# Guía de Testing - Coffee Rater

Esta guía describe los flujos de testing manual y las pruebas críticas para verificar que la aplicación funciona correctamente antes del despliegue.

## Testing Checklist Rápido

Usa esta lista para verificar todas las funcionalidades principales:

### Autenticación
- [ ] Registro de nuevo usuario funciona
- [ ] Login con credenciales correctas funciona
- [ ] Login con credenciales incorrectas muestra error
- [ ] Logout funciona correctamente
- [ ] Sesión persiste después de recargar página
- [ ] Rutas protegidas redirigen a login si no autenticado

### Wizard de Perfil de Sabor (Agregar Café)
- [ ] Step 1: Campos básicos se validan correctamente
- [ ] Step 1: Subida de imagen funciona
- [ ] Step 1: Click en imagen extrae color correctamente
- [ ] Step 2: Rating 0-10 funciona
- [ ] Step 2: Botón "Omitir perfil de sabor" funciona
- [ ] Steps 3-5: Todos los controles 1-5 funcionan
- [ ] Step 5: Multi-select de notas de sabor funciona
- [ ] Step 6: Review muestra todos los datos correctamente
- [ ] Step 6: Toggle de privacidad funciona
- [ ] Step 6: Guardar crea el café y redirige a Mi Colección

### Mi Colección
- [ ] Muestra todos los cafés del usuario actual
- [ ] Stats se calculan correctamente
- [ ] Búsqueda filtra en tiempo real
- [ ] Filtro de nivel de tueste funciona
- [ ] Ordenamiento funciona (fecha, rating, nombre, precio)
- [ ] Botón editar muestra alerta (pendiente de implementación)
- [ ] Botón eliminar muestra confirmación y elimina
- [ ] Exportar JSON descarga archivo correcto
- [ ] Exportar CSV descarga archivo correcto con UTF-8 (abre bien en Excel)

### Feed Social
- [ ] Muestra cafés públicos de todos los usuarios
- [ ] No muestra cafés privados
- [ ] "Cargar Más" carga siguiente página
- [ ] Click en "Ver Detalles" abre FeedDetailPage
- [ ] Muestra nombre de usuario y display name correctamente
- [ ] Muestra tiempo relativo ("hace 2 horas")

### Feed Detail Page
- [ ] Muestra toda la información del café
- [ ] Muestra perfil de sabor calculado
- [ ] Muestra notas de sabor como chips
- [ ] Muestra valores detallados (fuerza, aroma, etc.)
- [ ] Imagen se muestra correctamente con color extraído
- [ ] "Volver al Feed" regresa a la página del feed

### Privacidad
- [ ] Café marcado como privado NO aparece en feed
- [ ] Café público SÍ aparece en feed
- [ ] Otros usuarios NO pueden ver cafés privados del usuario

### Autorización
- [ ] Usuario NO puede editar cafés de otros usuarios
- [ ] Usuario NO puede eliminar cafés de otros usuarios
- [ ] Usuario solo ve sus propios cafés en Mi Colección

### Responsive Design (Mobile)
- [ ] Login page funciona en móvil
- [ ] Wizard funciona en móvil (todos los steps)
- [ ] Mi Colección funciona en móvil
- [ ] Feed funciona en móvil
- [ ] Headers se ajustan correctamente en pantallas pequeñas
- [ ] Cards se ven bien en móvil
- [ ] Botones son clicables en touch screens

### Error Handling
- [ ] ErrorBoundary atrapa errores de React
- [ ] Errores de API muestran mensajes en español
- [ ] Loading states muestran spinners
- [ ] Campos requeridos muestran errores de validación en español

---

## Flujos de Testing Detallados

### 1. Flujo Completo: Registro → Café → Feed

**Objetivo**: Verificar el flujo completo de un nuevo usuario desde el registro hasta compartir un café en el feed.

**Pasos**:

1. **Registro**
   - Ir a `/login`
   - Click en "¿No tienes cuenta? Regístrate"
   - Llenar formulario:
     - Usuario: `testuser1`
     - Email: `test1@example.com`
     - Contraseña: `password123`
     - Nombre para mostrar: `Test Usuario 1`
   - Click "Registrarse"
   - ✅ Verificar: Redirige a `/` (Mi Colección)
   - ✅ Verificar: Header muestra "Bienvenido, Test Usuario 1"

2. **Agregar Primer Café**
   - Click "+ Agregar Café"
   - ✅ Verificar: Redirige a `/add-coffee` (Wizard)

3. **Step 1: Información Básica**
   - Nombre del café: `Ethiopia Yirgacheffe`
   - Tostador: `Blue Bottle Coffee`
   - Origen: `Etiopía`
   - Nivel de tueste: `Claro`
   - Método de procesamiento: `Lavado`
   - Precio: `18.50`
   - (Opcional) Subir imagen de un café
   - (Opcional) Click en la imagen para extraer color
   - Click "Siguiente"
   - ✅ Verificar: Avanza a Step 2

4. **Step 2: Valoración Rápida**
   - Seleccionar 8 estrellas
   - Click "Continuar a preguntas de sabor"
   - ✅ Verificar: Avanza a Step 3

5. **Step 3: Fuerza e Intensidad**
   - Fuerza: 3
   - Aroma: 5
   - Click "Siguiente"
   - ✅ Verificar: Avanza a Step 4

6. **Step 4: Balance de Sabor**
   - Dulzura: 3
   - Acidez: 5
   - Amargor: 2
   - Click "Siguiente"
   - ✅ Verificar: Avanza a Step 5

7. **Step 5: Notas de Sabor y Cuerpo**
   - Seleccionar: "Frutal" y "Floral"
   - Cuerpo: 2
   - Duración del sabor: 4
   - Retrogusto: 5
   - Click "Siguiente"
   - ✅ Verificar: Avanza a Step 6

8. **Step 6: Revisar y Guardar**
   - ✅ Verificar: Muestra todos los datos ingresados
   - ✅ Verificar: Muestra perfil calculado (debería ser "Brillante y Frutal")
   - IMPORTANTE: NO marcar "Mantener privado" (dejar público)
   - Click "Guardar Café"
   - ✅ Verificar: Redirige a Mi Colección
   - ✅ Verificar: Muestra el café recién agregado

9. **Verificar en Mi Colección**
   - ✅ Verificar: Stats muestran "1" en Total de Cafés
   - ✅ Verificar: Valoración promedio = 8
   - ✅ Verificar: Precio promedio = $18.5
   - ✅ Verificar: Card del café muestra todo correctamente

10. **Verificar en Feed**
    - Click "Ver Comunidad"
    - ✅ Verificar: Redirige a `/feed`
    - ✅ Verificar: Muestra el café recién agregado
    - ✅ Verificar: Muestra "Test Usuario 1" como autor
    - ✅ Verificar: Muestra perfil "Brillante y Frutal"
    - Click "Ver Detalles"
    - ✅ Verificar: Muestra página de detalles completa

### 2. Flujo de Privacidad

**Objetivo**: Verificar que los cafés privados no aparecen en el feed público.

**Pasos**:

1. Agregar un segundo café (seguir wizard completo)
2. En Step 6, MARCAR "Mantener esta valoración privada"
3. Guardar café
4. ✅ Verificar: Café aparece en Mi Colección
5. Ir a Feed
6. ✅ Verificar: Café privado NO aparece en el feed
7. ✅ Verificar: Primer café (público) SÍ aparece

**Cambiar privacidad** (cuando edición esté implementada):
- Editar café privado
- Desmarcar privacidad
- Guardar
- ✅ Verificar: Ahora aparece en feed

### 3. Flujo Multi-Usuario

**Objetivo**: Verificar aislamiento de datos entre usuarios.

**Pasos**:

1. **Crear segundo usuario**
   - Logout
   - Registrar nuevo usuario:
     - Usuario: `testuser2`
     - Email: `test2@example.com`
     - Contraseña: `password123`
     - Nombre: `Test Usuario 2`

2. **Agregar café del segundo usuario**
   - Agregar un café (puede ser rápido, omitir perfil de sabor)
   - Asegurar que sea público

3. **Verificar Mi Colección**
   - ✅ Verificar: Solo muestra cafés del usuario 2
   - ✅ Verificar: NO muestra cafés del usuario 1

4. **Verificar Feed**
   - Ir a Feed
   - ✅ Verificar: Muestra cafés de AMBOS usuarios
   - ✅ Verificar: Cada café muestra el autor correcto

5. **Intentar acceder directamente a café ajeno**
   - Copiar ID de un café del usuario 1
   - Como usuario 2, intentar editar/eliminar (cuando esté implementado)
   - ✅ Verificar: NO permite editar/eliminar (403 Forbidden)

### 4. Flujo de Búsqueda y Filtros

**Objetivo**: Verificar que búsqueda y filtros funcionan correctamente.

**Pre-requisito**: Tener al menos 5 cafés con datos variados.

**Pasos**:

1. **Búsqueda por nombre**
   - En Mi Colección, escribir parte del nombre de un café
   - ✅ Verificar: Filtra instantáneamente
   - ✅ Verificar: Muestra solo cafés que coinciden

2. **Búsqueda por tostador**
   - Escribir nombre del tostador
   - ✅ Verificar: Filtra por tostador

3. **Filtro de nivel de tueste**
   - Seleccionar "Claro"
   - ✅ Verificar: Muestra solo cafés con tueste claro
   - Cambiar a "Todos"
   - ✅ Verificar: Muestra todos de nuevo

4. **Ordenar por valoración**
   - Seleccionar "Valoración" en "Ordenar por"
   - Seleccionar "Descendente"
   - ✅ Verificar: Cafés ordenados de mayor a menor valoración

5. **Ordenar por fecha**
   - Seleccionar "Fecha"
   - Seleccionar "Ascendente"
   - ✅ Verificar: Cafés ordenados del más antiguo al más nuevo

6. **Combinar filtros**
   - Buscar texto + filtrar tueste + ordenar por precio
   - ✅ Verificar: Todos los filtros se aplican correctamente

### 5. Flujo de Exportación

**Objetivo**: Verificar que la exportación de datos funciona correctamente.

**Pasos**:

1. **Exportar como JSON**
   - Ir a Mi Colección
   - Click en botón "Exportar"
   - Click "Exportar como JSON"
   - ✅ Verificar: Descarga archivo `mis-cafes-YYYY-MM-DD.json`
   - Abrir archivo
   - ✅ Verificar: Contiene todos los cafés en formato JSON
   - ✅ Verificar: Campos en español (nombre, tostador, etc.)

2. **Exportar como CSV**
   - Click en "Exportar"
   - Click "Exportar como CSV"
   - ✅ Verificar: Descarga archivo `mis-cafes-YYYY-MM-DD.csv`
   - Abrir en Excel/Google Sheets
   - ✅ Verificar: Columnas con encabezados en español
   - ✅ Verificar: Caracteres especiales (tildes) se muestran correctamente
   - ✅ Verificar: Comas en descripciones no rompen el formato

### 6. Flujo de Error Handling

**Objetivo**: Verificar que los errores se manejan correctamente.

**Casos de prueba**:

1. **Formulario de registro con errores**
   - Intentar registrar con usuario de 2 caracteres
   - ✅ Verificar: Muestra "debe tener al menos 3 caracteres"
   - Intentar con email inválido
   - ✅ Verificar: Muestra "Correo electrónico inválido"

2. **Wizard con campos vacíos**
   - Intentar avanzar Step 1 sin nombre
   - ✅ Verificar: Muestra "El nombre del café es requerido"
   - Intentar sin tostador
   - ✅ Verificar: Muestra "El tostador es requerido"

3. **Login con credenciales incorrectas**
   - Intentar login con contraseña incorrecta
   - ✅ Verificar: Muestra error "Usuario o contraseña incorrectos"

4. **Eliminar café**
   - Click en botón eliminar
   - ✅ Verificar: Muestra confirmación
   - Click "Cancelar"
   - ✅ Verificar: No elimina
   - Click eliminar de nuevo
   - Click "Aceptar"
   - ✅ Verificar: Elimina el café

5. **Error de conexión** (para testing avanzado)
   - Detener el backend
   - Intentar cargar Mi Colección
   - ✅ Verificar: Muestra error de conexión
   - ✅ Verificar: No crashea la aplicación (ErrorBoundary)

---

## Testing en Diferentes Navegadores

### Navegadores de Escritorio

Probar en:
- [ ] Chrome (última versión)
- [ ] Firefox (última versión)
- [ ] Safari (si en Mac)
- [ ] Edge (última versión)

**Casos específicos**:
- Subida de imágenes
- Extracción de color
- Export CSV (verificar UTF-8 en Excel)

### Navegadores Móviles

Probar en:
- [ ] Safari iOS (iPhone)
- [ ] Chrome Android

**Casos específicos**:
- Wizard completo en móvil
- Headers se adaptan correctamente
- Botones son fáciles de tocar
- Formularios no tienen zoom automático

---

## Performance Testing

### Verificar carga con muchos cafés

1. Agregar 20+ cafés (puedes usar el mismo wizard rápidamente)
2. Cargar Mi Colección
   - ✅ Verificar: Carga en menos de 2 segundos
   - ✅ Verificar: No hay lag al scroll

3. Cargar Feed
   - ✅ Verificar: Infinite scroll funciona suavemente
   - ✅ Verificar: Imágenes no causan lag

### Verificar queries de base de datos

1. Abrir DevTools → Network
2. Cargar Mi Colección
3. ✅ Verificar: Solo 1-2 queries (no N+1)
4. Filtrar o buscar
5. ✅ Verificar: Queries son rápidas (<100ms)

---

## Security Testing

### Authentication

1. **Intentar acceder sin login**
   - Ir directamente a `/` sin estar logueado
   - ✅ Verificar: Redirige a `/login`

2. **Session persistence**
   - Login
   - Recargar página
   - ✅ Verificar: Sigue logueado
   - Cerrar y reabrir navegador (mismo día)
   - ✅ Verificar: Sigue logueado

3. **Session expiry** (después de 30 días)
   - Cambiar fecha del sistema (opcional)
   - ✅ Verificar: Sesión expira y redirige a login

### Authorization

1. **URLs directas**
   - Como usuario 2, copiar URL de café del usuario 1
   - Intentar acceder a `/feed/[id]` de café privado
   - ✅ Verificar: No muestra café privado (404 o error)

2. **API endpoints** (testing avanzado con Postman/cURL)
   - Intentar PUT/DELETE sin autenticación
   - ✅ Verificar: Devuelve 401 Unauthorized
   - Intentar editar café de otro usuario
   - ✅ Verificar: Devuelve 403 Forbidden

---

## Deployment Testing

### Pre-deployment Checklist

Antes de desplegar a producción:

- [ ] Todos los tests manuales pasaron
- [ ] Build de producción compila sin errores: `npm run build`
- [ ] Type check pasa: `npm run check`
- [ ] No hay console.errors en producción
- [ ] Variables de entorno configuradas (SESSION_SECRET, DATABASE_URL)
- [ ] Migraciones de base de datos aplicadas: `npm run db:push`

### Post-deployment Testing

Después de desplegar a Railway/Render:

1. **Verificar ambiente de producción**
   - Visitar URL de producción
   - ✅ Verificar: Aplicación carga correctamente
   - ✅ Verificar: HTTPS funciona

2. **Crear cuenta de prueba en producción**
   - Registrar usuario de prueba
   - Agregar 2-3 cafés
   - ✅ Verificar: Todo funciona igual que en local

3. **Verificar performance**
   - Usar Lighthouse (Chrome DevTools)
   - ✅ Verificar: Performance score > 70
   - ✅ Verificar: Accessibility score > 90

4. **Verificar en móvil real**
   - Abrir en teléfono móvil
   - Completar wizard completo
   - ✅ Verificar: Todo funciona correctamente

---

## Reportar Problemas

Si encuentras un bug durante testing:

1. **Documenta**:
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots/videos si es posible
   - Navegador y versión
   - Consola de errores (F12 → Console)

2. **Prioridad**:
   - **Crítico**: No se puede usar la app (crash, no login, no guardar)
   - **Alto**: Funcionalidad principal rota (wizard, feed)
   - **Medio**: Funcionalidad secundaria (exportar, filtros)
   - **Bajo**: UI/UX mejoras

3. **Crear Issue** (si usando GitHub)

---

## Conclusión

Completar todos estos tests garantiza que Coffee Rater funciona correctamente antes del lanzamiento. Si todos los checkboxes están marcados, la aplicación está lista para producción.

**Tiempo estimado de testing completo**: 2-3 horas

¡Feliz testing! ☕
