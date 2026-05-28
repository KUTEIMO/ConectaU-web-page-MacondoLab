/**
 * Configuración de enlaces de descarga
 * 
 * Para usar GitHub Releases (recomendado):
 * 1. Ve a tu repositorio en GitHub
 * 2. Crea un Release (releases > New release)
 * 3. Sube el APK como asset
 * 4. Copia la URL de descarga del asset y pégala aquí
 * 
 * Formato de URL de GitHub Releases:
 * https://github.com/USUARIO/REPO/releases/download/TAG/archivo.apk
 * 
 * Alternativas:
 * - Google Drive: Comparte el archivo y usa el ID del archivo
 *   https://drive.google.com/uc?export=download&id=FILE_ID
 * 
 * - Dropbox: Comparte el enlace y reemplaza ?dl=0 con ?dl=1
 *   https://www.dropbox.com/s/xxxxx/file.apk?dl=1
 */

// URL de descarga del APK
// URL de GitHub Releases - v1.0.0
export const APK_DOWNLOAD_URL = 
  import.meta.env.VITE_APK_DOWNLOAD_URL || 
  "https://github.com/KUTEIMO/ConectaU-web-page-MacondoLab/releases/download/v1.0.0/app-releasev1-universal.apk";

// Nombre del archivo para descarga
export const APK_FILENAME = "ConectaU.apk";

// Versión actual del APK
export const APK_VERSION = "v1.0.0";

