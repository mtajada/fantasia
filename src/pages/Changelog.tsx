import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import PageTransition from "../components/PageTransition";
import { Calendar, Star, Wrench, Bug, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useChangelog } from '@/hooks/useChangelog';

const Changelog: React.FC = () => {
  const navigate = useNavigate();
  const { changelogData, isLoading, error } = useChangelog();

  const getVersionBadgeVariant = (version: string) => {
    if (version.includes('1.1.3')) return 'default';
    if (version.includes('1.1')) return 'secondary';
    return 'outline';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <PageTransition>
      <div 
        className="min-h-screen flex flex-col"
        style={{
          backgroundImage: 'url(/fondo_png.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="container mx-auto py-8 px-4 flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-[#BB79D1] hover:text-[#A5D6F6]"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-[#222]">Registro de Cambios</h1>
                <p className="text-[#555] mt-1">
                  Todas las mejoras y cambios notables de TaleMe!
                </p>
              </div>
            </div>

            {/* Changelog entries */}
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <Card className="bg-white/90 backdrop-blur-sm border-0 p-8">
                  <div className="flex items-center gap-3 text-[#555]">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Cargando registro de cambios...</span>
                  </div>
                </Card>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <Card className="bg-white/90 backdrop-blur-sm border-0 p-8">
                  <div className="flex items-center gap-3 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    <div>
                      <p className="font-semibold">Error al cargar el changelog</p>
                      <p className="text-sm text-[#555] mt-1">{error}</p>
                    </div>
                  </div>
                </Card>
              </div>
            ) : changelogData.length === 0 ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <Card className="bg-white/90 backdrop-blur-sm border-0 p-8">
                  <div className="text-center text-[#555]">
                    <p className="font-semibold">No hay datos de changelog disponibles</p>
                    <p className="text-sm mt-1">Verifica que el archivo CHANGELOG.md existe y tiene el formato correcto.</p>
                  </div>
                </Card>
              </div>
            ) : (
            <div className="space-y-6">
              {changelogData.map((entry, index) => (
                <Card key={entry.version} className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={getVersionBadgeVariant(entry.version)} className="text-sm">
                          v{entry.version}
                        </Badge>
                        {index === 0 && (
                          <Badge variant="default" className="bg-[#BB79D1] text-white">
                            <Star className="h-3 w-3 mr-1" />
                            Última versión
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[#555]">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">{formatDate(entry.date)}</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <Accordion type="multiple" className="w-full">
                      {entry.features && entry.features.length > 0 && (
                        <AccordionItem value={`features-${entry.version}`}>
                          <AccordionTrigger className="text-left hover:no-underline">
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-[#F6A5B7]" />
                              <span className="font-semibold">Nuevas Funcionalidades</span>
                              <Badge variant="outline">{entry.features.length}</Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-2 mt-2">
                              {entry.features.map((feature, i) => (
                                <li key={i} className="flex items-start gap-2 text-[#555]">
                                  <span className="w-2 h-2 bg-[#F6A5B7] rounded-full mt-2 flex-shrink-0"></span>
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      )}

                      {entry.improvements && entry.improvements.length > 0 && (
                        <AccordionItem value={`improvements-${entry.version}`}>
                          <AccordionTrigger className="text-left hover:no-underline">
                            <div className="flex items-center gap-2">
                              <Wrench className="h-4 w-4 text-[#7DC4E0]" />
                              <span className="font-semibold">Mejoras</span>
                              <Badge variant="outline">{entry.improvements.length}</Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-2 mt-2">
                              {entry.improvements.map((improvement, i) => (
                                <li key={i} className="flex items-start gap-2 text-[#555]">
                                  <span className="w-2 h-2 bg-[#7DC4E0] rounded-full mt-2 flex-shrink-0"></span>
                                  <span>{improvement}</span>
                                </li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      )}

                      {entry.technical && entry.technical.length > 0 && (
                        <AccordionItem value={`technical-${entry.version}`}>
                          <AccordionTrigger className="text-left hover:no-underline">
                            <div className="flex items-center gap-2">
                              <Wrench className="h-4 w-4 text-[#BB79D1]" />
                              <span className="font-semibold">Cambios Técnicos</span>
                              <Badge variant="outline">{entry.technical.length}</Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-2 mt-2">
                              {entry.technical.map((tech, i) => (
                                <li key={i} className="flex items-start gap-2 text-[#555]">
                                  <span className="w-2 h-2 bg-[#BB79D1] rounded-full mt-2 flex-shrink-0"></span>
                                  <span className="font-mono text-sm">{tech}</span>
                                </li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      )}

                      {entry.fixes && entry.fixes.length > 0 && (
                        <AccordionItem value={`fixes-${entry.version}`}>
                          <AccordionTrigger className="text-left hover:no-underline">
                            <div className="flex items-center gap-2">
                              <Bug className="h-4 w-4 text-[#f7c59f]" />
                              <span className="font-semibold">Correcciones</span>
                              <Badge variant="outline">{entry.fixes.length}</Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-2 mt-2">
                              {entry.fixes.map((fix, i) => (
                                <li key={i} className="flex items-start gap-2 text-[#555]">
                                  <span className="w-2 h-2 bg-[#f7c59f] rounded-full mt-2 flex-shrink-0"></span>
                                  <span>{fix}</span>
                                </li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      )}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
            )}

            {/* Footer info */}
            <div className="mt-12 text-center">
              <Card className="bg-white/80 backdrop-blur-sm border-0">
                <CardContent className="pt-6">
                  <p className="text-[#555] text-sm">
                    Este registro sigue el formato de{' '}
                    <a 
                      href="https://keepachangelog.com/es-ES/1.0.0/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#BB79D1] hover:text-[#A5D6F6] underline"
                    >
                      Keep a Changelog
                    </a>
                    {' '}y adhiere a{' '}
                    <a 
                      href="https://semver.org/spec/v2.0.0.html" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#BB79D1] hover:text-[#A5D6F6] underline"
                    >
                      Semantic Versioning
                    </a>
                    .
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Changelog; 