import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, Info, FileText, ArrowLeft, Code, TestTube, Mail, Users, GraduationCap, User } from 'lucide-react';

export default function Legal() {
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
                <p className="text-xs text-text-secondary hidden sm:block truncate">Avisos Legales</p>
              </div>
            </div>
            <Link
              to="/"
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base text-text-primary hover:text-primary inline-flex items-center gap-2 touch-manipulation whitespace-nowrap"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden xs:inline">Volver al inicio</span>
              <span className="xs:hidden">Inicio</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12">
        {/* Banner de advertencia */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 sm:p-6 mb-6 sm:mb-8 rounded-r-lg">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-amber-900 mb-2">
                Entorno de Desarrollo y Pruebas
              </h2>
              <p className="text-sm sm:text-base text-amber-800 leading-relaxed">
                Esta plataforma es una <strong>versión de demostración</strong> utilizada exclusivamente para fines de desarrollo, pruebas y presentaciones. 
                Toda la información mostrada es <strong>ficticia y simulada</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Sección principal */}
        <div className="card p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center mb-4 sm:mb-6">
            <Code className="h-6 w-6 sm:h-8 sm:w-8 text-primary mr-3" />
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
              Avisos Legales y Disclaimers
            </h1>
          </div>
          
          <div className="space-y-6 sm:space-y-8">
            {/* Entorno de desarrollo */}
            <section>
              <div className="flex items-center mb-3 sm:mb-4">
                <TestTube className="h-5 w-5 sm:h-6 sm:w-6 text-secondary mr-2" />
                <h2 className="text-xl sm:text-2xl font-semibold text-text-primary">
                  Entorno de Desarrollo
                </h2>
              </div>
              <div className="bg-surface rounded-lg p-4 sm:p-5 space-y-3">
                <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                  <strong className="text-text-primary">ConectaU</strong> se encuentra actualmente en una fase de 
                  <strong className="text-text-primary"> desarrollo y pruebas</strong>. Esta plataforma ha sido creada 
                  como un prototipo para demostrar funcionalidades, validar conceptos y realizar pruebas técnicas.
                </p>
                <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                  El propósito de esta plataforma es <strong>exclusivamente educativo y de demostración</strong>. 
                  No está destinada para uso comercial, producción o transacciones reales.
                </p>
              </div>
            </section>

            {/* Información ficticia */}
            <section>
              <div className="flex items-center mb-3 sm:mb-4">
                <Info className="h-5 w-5 sm:h-6 sm:w-6 text-accent mr-2" />
                <h2 className="text-xl sm:text-2xl font-semibold text-text-primary">
                  Información Ficticia
                </h2>
              </div>
              <div className="bg-surface rounded-lg p-4 sm:p-5 space-y-4">
                <div>
                  <h3 className="font-semibold text-text-primary mb-2 text-base sm:text-lg">
                    Empresas y Organizaciones
                  </h3>
                  <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                    Todas las empresas, organizaciones y nombres comerciales mencionados en esta plataforma son 
                    <strong className="text-text-primary"> únicamente para fines de simulación</strong>. 
                    El uso de nombres de empresas reales es puramente ilustrativo y no implica ninguna relación, 
                    asociación, patrocinio o respaldo por parte de dichas empresas.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-text-primary mb-2 text-base sm:text-lg">
                    Estudiantes y Perfiles
                  </h3>
                  <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                    Los perfiles de estudiantes, nombres, fotografías y datos personales mostrados son 
                    <strong className="text-text-primary"> completamente ficticios</strong>. 
                    Cualquier similitud con personas reales es pura coincidencia. Estos datos se utilizan 
                    únicamente para simular un entorno real y demostrar las funcionalidades de la plataforma.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-text-primary mb-2 text-base sm:text-lg">
                    Vacantes y Oportunidades
                  </h3>
                  <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                    Todas las vacantes, proyectos, oportunidades laborales y descripciones de puestos 
                    presentadas en esta plataforma son <strong className="text-text-primary">ficticias</strong>. 
                    No representan ofertas de empleo reales ni oportunidades de trabajo genuinas. 
                    Estas publicaciones son parte del contenido de demostración.
                  </p>
                </div>
              </div>
            </section>

            {/* Derechos de propiedad */}
            <section>
              <div className="flex items-center mb-3 sm:mb-4">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary mr-2" />
                <h2 className="text-xl sm:text-2xl font-semibold text-text-primary">
                  Derechos de Propiedad Intelectual
                </h2>
              </div>
              <div className="bg-surface rounded-lg p-4 sm:p-5 space-y-3">
                <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                  Los nombres comerciales, marcas, logos y cualquier otro material protegido por derechos de autor 
                  que puedan aparecer en esta plataforma son propiedad de sus respectivos dueños. 
                  <strong className="text-text-primary"> No reclamamos ningún derecho sobre estos materiales</strong>.
                </p>
                <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                  El uso de estos materiales es <strong className="text-text-primary">exclusivamente para fines 
                  educativos y de demostración</strong> dentro de este entorno de desarrollo. 
                  No tenemos intención de infringir ningún derecho de propiedad intelectual.
                </p>
              </div>
            </section>

            {/* Limitación de responsabilidad */}
            <section>
              <div className="flex items-center mb-3 sm:mb-4">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-secondary mr-2" />
                <h2 className="text-xl sm:text-2xl font-semibold text-text-primary">
                  Limitación de Responsabilidad
                </h2>
              </div>
              <div className="bg-surface rounded-lg p-4 sm:p-5 space-y-3">
                <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                  Esta plataforma se proporciona <strong className="text-text-primary">"tal cual"</strong> sin garantías 
                  de ningún tipo. No nos hacemos responsables por:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-text-secondary ml-2">
                  <li>La exactitud, completitud o actualidad de la información mostrada</li>
                  <li>Interrupciones en el servicio o errores técnicos</li>
                  <li>Pérdida de datos o información</li>
                  <li>Cualquier daño derivado del uso de esta plataforma</li>
                </ul>
              </div>
            </section>

            {/* Propósito educativo */}
            <section>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-3">
                  Propósito Educativo y de Demostración
                </h2>
                <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-3">
                  Esta plataforma ha sido desarrollada como parte de un proyecto académico y de investigación 
                  para demostrar conceptos de desarrollo web, integración de servicios y diseño de interfaces. 
                  El objetivo es crear un entorno realista que permita:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-text-secondary ml-2">
                  <li>Validar funcionalidades y flujos de usuario</li>
                  <li>Realizar pruebas técnicas y de rendimiento</li>
                  <li>Demostrar capacidades de desarrollo</li>
                  <li>Presentar conceptos y propuestas de valor</li>
                </ul>
              </div>
            </section>

            {/* Equipo de desarrollo */}
            <section>
              <div className="flex items-center mb-3 sm:mb-4">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary mr-2" />
                <h2 className="text-xl sm:text-2xl font-semibold text-text-primary">
                  Equipo de Desarrollo
                </h2>
              </div>
              <div className="bg-surface rounded-lg p-4 sm:p-5 space-y-4">
                <div>
                  <h3 className="font-semibold text-text-primary mb-2 text-base sm:text-lg">
                    Desarrollador Principal
                  </h3>
                  <div className="bg-white rounded-lg p-3 sm:p-4 border border-border">
                    <div className="flex items-start space-x-3">
                      <User className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-text-primary text-sm sm:text-base">
                          Eduardo José Soto Herrera
                        </p>
                        <p className="text-xs sm:text-sm text-text-secondary mt-1">
                          Facultad de Ingenierías - Ingeniería de Sistemas
                        </p>
                        <p className="text-xs sm:text-sm text-text-secondary mt-2 leading-relaxed">
                          <strong className="text-text-primary">Responsable del desarrollo</strong> de la aplicación móvil, 
                          página web y creador de toda la lógica de la plataforma. 
                          Arquitectura, implementación técnica y funcionalidades del sistema.
                        </p>
                        <div className="mt-3 flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-text-secondary" />
                          <a 
                            href="mailto:e_soto2@unisimon.edu.co" 
                            className="text-xs sm:text-sm text-primary hover:underline"
                          >
                            e_soto2@unisimon.edu.co
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-text-primary mb-2 text-base sm:text-lg">
                    Proyecto Académico - Innovación y Emprendimiento 2
                  </h3>
                  <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-3">
                    Este proyecto forma parte del curso de <strong className="text-text-primary">Innovación y Emprendimiento 2</strong> 
                    de la Universidad Simón Bolívar. El siguiente equipo ha contribuido con la conceptualización, 
                    presentaciones, diseño y aspectos de planificación del proyecto:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-white rounded-lg p-3 border border-border">
                      <p className="font-semibold text-text-primary text-xs sm:text-sm mb-1">
                        Eduardo José Soto Herrera
                      </p>
                      <p className="text-xs text-text-secondary">
                        Desarrollo de aplicación móvil y página web
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-border">
                      <p className="font-semibold text-text-primary text-xs sm:text-sm mb-1">
                        Marco Jhoan Sierra Ariza
                      </p>
                      <p className="text-xs text-text-secondary">
                        Diseño de interfaces y prototipos en Figma
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-border">
                      <p className="font-semibold text-text-primary text-xs sm:text-sm mb-1">
                        Karen Yuliet Ramirez Gallo
                      </p>
                      <p className="text-xs text-text-secondary">
                        Relaciones sociales y comunicación del proyecto
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-border">
                      <p className="font-semibold text-text-primary text-xs sm:text-sm mb-1">
                        William Dubay Valbuena Rojas
                      </p>
                      <p className="text-xs text-text-secondary">
                        Relaciones legales y aspectos normativos
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-border sm:col-span-2">
                      <p className="font-semibold text-text-primary text-xs sm:text-sm mb-1">
                        Lissette Viviana Cardenas Pallares
                      </p>
                      <p className="text-xs text-text-secondary">
                        Diseño de identidad de marca y elementos visuales
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Contacto */}
            <section className="border-t border-border pt-6 sm:pt-8">
              <div className="flex items-center mb-3 sm:mb-4">
                <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-primary mr-2" />
                <h2 className="text-lg sm:text-xl font-semibold text-text-primary">
                  Contacto
                </h2>
              </div>
              <div className="bg-surface rounded-lg p-4 sm:p-5">
                <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-4">
                  Si tiene preguntas sobre esta plataforma, necesita más información sobre el proyecto, 
                  o desea reportar algún problema técnico, puede contactar directamente al desarrollador responsable:
                </p>
                <div className="bg-white rounded-lg p-4 border border-border">
                  <div className="flex items-start space-x-3">
                    <GraduationCap className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-text-primary text-sm sm:text-base mb-2">
                        Eduardo José Soto Herrera
                      </p>
                      <p className="text-xs sm:text-sm text-text-secondary mb-3">
                        Desarrollador Principal - Facultad de Ingenierías (Ingeniería de Sistemas)
                      </p>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-text-secondary" />
                        <a 
                          href="mailto:e_soto2@unisimon.edu.co" 
                          className="text-sm sm:text-base text-primary hover:underline font-medium"
                        >
                          e_soto2@unisimon.edu.co
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-text-secondary mt-4 italic">
                  También puede contactar a través de los canales oficiales de la Universidad Simón Bolívar 
                  para consultas generales sobre el proyecto académico.
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-text-secondary text-xs sm:text-sm mb-6">
          <p>Última actualización: {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Botón de regreso */}
        <div className="text-center">
          <Link
            to="/"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm sm:text-base touch-manipulation"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border py-6 sm:py-8 mt-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center text-text-secondary">
            <p className="text-sm sm:text-base">ConectaU - Universidad Simón Bolívar</p>
            <p className="text-xs sm:text-sm mt-2">© 2025 Todos los derechos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

