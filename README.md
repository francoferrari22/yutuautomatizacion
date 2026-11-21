# Yutu Studio — Panel web de automatización

Panel estático profesional para organizar videos destinados a YouTube. Diseñado para publicarse mediante GitHub Pages y utilizarse desde computadora o celular.

## Incluye esta versión
- Diseño adaptable (desktop y móvil).
- Selección múltiple de videos y zona para arrastrar y soltar.
- Clasificación: Short, video largo o ambos.
- Preferencia de visibilidad y fecha/hora de referencia.
- Notas por lote.
- Cola persistente en el navegador mediante `localStorage`.
- Resumen de cantidades y exportación de la cola en JSON.
- Workflow de GitHub Actions para desplegar automáticamente a GitHub Pages.

## Instalación en el repositorio
Subí **todo el contenido del ZIP**, incluyendo la carpeta oculta `.github/workflows/` y su archivo `pages.yml`, a la raíz del repositorio. No subas solamente los tres archivos visibles.

Si el repositorio ya contiene un workflow de Pages anterior, evitá mantener dos workflows que publiquen al mismo entorno. Desactivá o eliminá el anterior para que no compitan.

## Configuración de GitHub Pages
En el repositorio:
1. Abrí **Settings → Pages**.
2. En **Build and deployment → Source**, seleccioná **GitHub Actions**.
3. Guardá los cambios.
4. Abrí la pestaña **Actions** y esperá que termine el workflow `Deploy Yutu Studio to GitHub Pages`.
5. Al finalizar, GitHub mostrará la URL del sitio en **Settings → Pages**.

El workflow se ejecuta automáticamente en cada actualización de la rama `main` y también se puede iniciar manualmente desde Actions.

## Alcance y límites actuales
Esta versión es un panel frontend. Los archivos de video se seleccionan en el navegador, pero **no se cargan a un servidor, no se procesan y no se publican en YouTube**. La cola guarda metadatos (nombre, tamaño, formato, visibilidad, notas y programación de referencia) en el almacenamiento local del navegador. Los archivos de video no se guardan en la cola ni se suben a internet. Si borrás los datos del navegador o cambiás de dispositivo, la cola local puede no estar disponible; exportá el JSON como respaldo.

## Próxima etapa
Para automatizar publicaciones reales hará falta:
- Backend HTTPS con autenticación.
- Almacenamiento de archivos de video.
- Worker de procesamiento (por ejemplo FFmpeg) y cola de tareas.
- OAuth 2.0 de Google/YouTube y YouTube Data API.
- Gestión de cuotas, reintentos, estados y registros.
- Variables secretas guardadas en el proveedor del backend, nunca en este repositorio ni en JavaScript público.

El objetivo de 5–10 videos diarios requiere dimensionar duración y peso de los videos y calcular CPU, almacenamiento y transferencia antes de elegir el proveedor de nube.
