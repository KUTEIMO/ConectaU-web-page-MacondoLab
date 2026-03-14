import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, GraduationCap, Building2, Shield, ArrowRight, CheckCircle, Lock, Award, Smartphone, Download, Apple, Loader } from 'lucide-react';
import { getProjects } from '../services/projectsService';
import { APK_DOWNLOAD_URL, APK_FILENAME } from '../constants/downloads';

// URL del formulario externo de registro
const EXTERNAL_FORM_URL = 'https://forms.app/form/69b5c9809e518e0002192eea?preview=true';

export default function Landing() {
  const [stats, setStats] = useState({
    vacancies: '—',
    companies: '—',
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const projects = await getProjects({ status: 'active' });
        const companyCount = new Set(projects.map((project) => project.companyId)).size;
        setStats({
          vacancies: projects.length.toString(),
          companies: companyCount.toString(),
        });
      } catch (error) {
        console.error('Error loading landing stats:', error);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-1 sm:space-x-2 min-w-0 flex-1">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs sm:text-sm">CU</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-text-primary truncate">ConectaU</h1>
                <p className="text-xs text-text-secondary hidden sm:block truncate">Conectando talento universitario con oportunidades reales</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <Link
                to="/legal"
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-text-secondary hover:text-primary touch-manipulation whitespace-nowrap hidden sm:inline-block"
              >
                Avisos Legales
              </Link>
              <Link
                to="/login"
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base text-text-primary hover:text-primary touch-manipulation whitespace-nowrap"
              >
                <span className="hidden xs:inline">Ingresar</span>
                <span className="xs:hidden">Entrar</span>
              </Link>
              <Link
                to="/register"
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-white rounded-md hover:bg-primary-dark text-sm sm:text-base touch-manipulation whitespace-nowrap"
              >
                <span className="hidden xs:inline">Registrarse</span>
                <span className="xs:hidden">Registro</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 sm:py-16 md:py-20" style={{ background: 'linear-gradient(to bottom, #EFEFEF, white)' }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4 sm:mb-6 px-2">
              ConectaU — conecta talento universitario con oportunidades reales.
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
              Plataforma verificada por universidades que facilita proyectos cortos, pagos seguros por escrow y portafolios certificados para estudiantes universitarios
            </p>
            <div className="flex flex-col items-center justify-center gap-6 px-4 mt-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Únete al lanzamiento de ConectaU</h3>
              <p id="cta-description" className="text-base sm:text-lg text-text-secondary max-w-xl mx-auto mb-2">
                Regístrate y sé de los primeros estudiantes y empresas en conocer la plataforma que conecta talento universitario con proyectos reales.
              </p>
              <a
                href={EXTERNAL_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Abrir formulario de registro en nueva pestaña"
                aria-describedby="cta-description"
                className="btn-primary inline-flex items-center justify-center space-x-2 py-3 sm:py-3 px-8 sm:px-10 text-lg sm:text-xl font-semibold rounded-md shadow-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-primary text-white hover:bg-primary-dark touch-manipulation mt-2 min-w-[220px] min-h-[56px]"
              >
                <span>Quiero registrarme</span>
                <ArrowRight className="h-6 w-6" aria-hidden="true" />
              </a>

              {/* Botones originales debajo del CTA */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 mt-4 w-full">
                <Link
                  to="/register"
                  className="btn-primary inline-flex items-center justify-center space-x-2 py-3 sm:py-2 px-6 text-sm sm:text-base touch-manipulation"
                  aria-label="Ir a la página de crear perfil"
                >
                  <Briefcase className="h-5 w-5" aria-hidden="true" />
                  <span>Crear perfil</span>
                </Link>
                <Link
                  to="/jobs"
                  className="btn-secondary inline-flex items-center justify-center space-x-2 py-3 sm:py-2 px-6 text-sm sm:text-base touch-manipulation"
                  aria-label="Ir a la página para explorar proyectos"
                >
                  <span>Explorar proyectos</span>
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-surface py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="card text-center">
              <Briefcase className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-text-primary">{stats.vacancies}</p>
              <p className="text-text-secondary text-sm">Vacantes activas</p>
            </div>
            <div className="card text-center">
              <GraduationCap className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-text-primary">2k+</p>
              <p className="text-text-secondary text-sm">Estudiantes</p>
            </div>
            <div className="card text-center">
              <Building2 className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-text-primary">{stats.companies}</p>
              <p className="text-text-secondary text-sm">Empresas</p>
            </div>
            <div className="card text-center">
              <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-text-primary">Escrow</p>
              <p className="text-text-secondary text-sm">Pagos seguros</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">Cómo funciona</h2>
            <p className="text-text-secondary text-sm sm:text-base">Flujo simple en 3 pasos</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="card text-center">
              <div className="w-16 h-16 bg-accent rounded-full mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">Verificación universitaria</h3>
              <p className="text-text-secondary">
                Perfil verificado por la universidad para garantizar confianza.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-secondary rounded-full mx-auto mb-4 flex items-center justify-center">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">Pagos seguros</h3>
              <p className="text-text-secondary">
                Fondos en escrow hasta la entrega satisfactoria.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">Portafolio certificado</h3>
              <p className="text-text-secondary">
                Proyectos aprobados se añaden a tu portafolio oficial.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About / Quiénes somos */}
      <section className="bg-surface py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="card p-4 sm:p-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-4 sm:mb-6">Quiénes somos</h2>
            <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
              ConectaU es una plataforma digital creada por estudiantes e instituciones universitarias de Cúcuta para reducir la brecha entre la formación académica y la experiencia laboral. Nuestra misión es facilitar conexiones seguras y verificadas entre estudiantes y empresas locales, mediante proyectos cortos que permiten a los jóvenes ganar experiencia real y a las organizaciones acceder a talento fresco y verificado. Respaldados por convenios institucionales, ofrecemos pagos seguros, verificación académica y portafolios profesionales certificados.
            </p>
          </div>
        </div>
      </section>

      {/* Misión, Visión y Valores */}
      <section className="bg-white py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div className="card p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-3 sm:mb-4">Misión</h3>
              <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                Facilitar la conexión entre estudiantes universitarios y empresas mediante una plataforma digital confiable que promueva la empleabilidad y el desarrollo profesional.
              </p>
            </div>
            <div className="card p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-3 sm:mb-4">Visión</h3>
              <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                Para 2035, ser la plataforma líder en Colombia y América Latina para vincular talento universitario con el sector productivo.
              </p>
            </div>
          </div>
          <div className="card p-4 sm:p-6">
            <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-4 sm:mb-6">Valores</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-text-primary mb-1">Confianza</h4>
                  <p className="text-text-secondary text-sm">Respaldo institucional y pagos seguros.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Building2 className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-text-primary mb-1">Colaboración</h4>
                  <p className="text-text-secondary text-sm">Alianzas entre universidades y empresas.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <GraduationCap className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-text-primary mb-1">Desarrollo local</h4>
                  <p className="text-text-secondary text-sm">Impulsar la economía regional.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-text-primary mb-1">Responsabilidad</h4>
                  <p className="text-text-secondary text-sm">Compromiso con la empleabilidad juvenil.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Propuesta de valor */}
      <section className="bg-surface py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">Propuesta de valor</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="card p-4 sm:p-6">
              <div className="flex items-center mb-4">
                <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-primary mr-2 sm:mr-3 flex-shrink-0" />
                <h3 className="text-xl sm:text-2xl font-bold text-text-primary">Para estudiantes</h3>
              </div>
              <ul className="space-y-3 text-text-secondary">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                  <span>Ganar experiencia real</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                  <span>Construir un portafolio certificado</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                  <span>Recibir pagos seguros por proyectos</span>
                </li>
              </ul>
            </div>
            <div className="card p-4 sm:p-6">
              <div className="flex items-center mb-4">
                <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-secondary mr-2 sm:mr-3 flex-shrink-0" />
                <h3 className="text-xl sm:text-2xl font-bold text-text-primary">Para empresas</h3>
              </div>
              <ul className="space-y-3 text-text-secondary">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                  <span>Acceder a talento verificado para proyectos cortos</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                  <span>Procesos transparentes</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                  <span>Pagos protegidos</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Descargas de apps móviles */}
      <section className="bg-white py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2 flex items-center justify-center gap-2 flex-wrap">
              <Smartphone className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <span>Descarga nuestra app móvil</span>
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto text-sm sm:text-base px-4">
              Accede a ConectaU desde tu dispositivo móvil y mantente conectado en cualquier momento. 
              Descarga la aplicación y comienza a conectar talento con oportunidades.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Android */}
              <div className="card border-2 border-green-100 hover:border-green-300 transition-colors p-4 sm:p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                    <Smartphone className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-2">Android</h3>
                  <p className="text-xs sm:text-sm text-text-secondary mb-3 sm:mb-4">
                    Versión actual disponible para dispositivos Android
                  </p>
                  <div className="w-full space-y-2 sm:space-y-3">
                    <div className="bg-surface rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-text-secondary">
                      <p className="font-semibold text-text-primary mb-1">Versión actual:</p>
                      <p>v1.0.0 - Universal APK</p>
                    </div>
                    <a
                      href={APK_DOWNLOAD_URL}
                      className="w-full btn-primary inline-flex items-center justify-center gap-2 py-3 text-sm sm:text-base touch-manipulation"
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Descargar ${APK_FILENAME}`}
                    >
                      <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Descargar APK</span>
                    </a>
                    <p className="text-xs text-text-secondary mt-2">
                      Compatible con Android 5.0 y superior
                    </p>
                  </div>
                </div>
              </div>

              {/* iOS */}
              <div className="card border-2 border-gray-100 opacity-75 p-4 sm:p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                    <Apple className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-2">iOS</h3>
                  <p className="text-xs sm:text-sm text-text-secondary mb-3 sm:mb-4">
                    Próximamente disponible en App Store
                  </p>
                  <div className="w-full space-y-2 sm:space-y-3">
                    <div className="bg-surface rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-text-secondary">
                      <p className="font-semibold text-text-primary mb-1 flex items-center justify-center gap-2">
                        <Loader className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                        En desarrollo
                      </p>
                      <p>Estamos trabajando en la versión iOS</p>
                    </div>
                    <button
                      disabled
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-text-secondary bg-surface rounded-md cursor-not-allowed inline-flex items-center justify-center gap-2 border border-border touch-manipulation"
                    >
                      <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Próximamente</span>
                    </button>
                    <p className="text-xs text-text-secondary mt-2">
                      Compatible con iOS 12.0 y superior
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 text-center px-4">
              <div className="inline-block bg-primary/10 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-text-secondary">
                  <strong className="text-text-primary">Nota:</strong> La app de Android requiere que habilites 
                  la instalación desde fuentes desconocidas en la configuración de seguridad de tu dispositivo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center text-text-secondary">
            <p className="text-sm sm:text-base">ConectaU - Universidad Simón Bolívar</p>
            <p className="text-xs sm:text-sm mt-2">© 2025 Todos los derechos reservados</p>
            <div className="mt-4">
              <Link
                to="/legal"
                className="text-xs sm:text-sm text-text-secondary hover:text-primary underline"
              >
                Avisos Legales y Entorno de Desarrollo
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


