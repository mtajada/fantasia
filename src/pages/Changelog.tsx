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
          backgroundColor: 'black',
        }}
      >
        <div className="container mx-auto py-8 px-4 flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Button
                size="sm"
                onClick={() => navigate(-1)}
                className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25 transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
                  ¿Qué Hay de Nuevo? ✨
                </h1>
                <p className="text-gray-300 mt-1">
                  ¡Todas las actualizaciones picantes y cambios emocionantes de Fantasia! 🌶️
                </p>
              </div>
            </div>

            {/* Changelog entries */}
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <Card className="bg-gray-900/90 backdrop-blur-md border border-gray-800 p-8 shadow-2xl">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
                    <span>Cargando registro de cambios...</span>
                  </div>
                </Card>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <Card className="bg-gray-900/90 backdrop-blur-md border border-gray-800 p-8 shadow-2xl">
                  <div className="flex items-center gap-3 text-red-400">
                    <AlertCircle className="h-5 w-5" />
                    <div>
                      <p className="font-semibold">Error cargando registro de cambios</p>
                      <p className="text-sm text-gray-400 mt-1">{error}</p>
                    </div>
                  </div>
                </Card>
              </div>
            ) : changelogData.length === 0 ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <Card className="bg-gray-900/90 backdrop-blur-md border border-gray-800 p-8 shadow-2xl">
                  <div className="text-center text-gray-300">
                    <p className="font-semibold">No hay datos de registro de cambios disponibles</p>
                    <p className="text-sm mt-1 text-gray-400">Por favor verifica que el archivo CHANGELOG.md existe y tiene el formato correcto.</p>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="space-y-6">
                {changelogData.map((entry, index) => (
                  <Card key={entry.version} className="bg-gray-900/90 backdrop-blur-md border border-gray-800 shadow-2xl">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant={getVersionBadgeVariant(entry.version)} className="text-sm bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0">
                            v{entry.version}
                          </Badge>
                          {index === 0 && (
                            <Badge variant="default" className="bg-gradient-to-r from-pink-500 to-violet-500 text-white border-0">
                              <Star className="h-3 w-3 mr-1" />
                              Última Versión
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">{formatDate(entry.date)}</span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <Accordion type="multiple" className="w-full">
                        {entry.features && entry.features.length > 0 && (
                          <AccordionItem value={`features-${entry.version}`}>
                            <AccordionTrigger className="text-left hover:no-underline text-gray-200">
                              <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-pink-400" />
                                <span className="font-semibold">Nuevas Características</span>
                                <Badge variant="outline" className="border-gray-600 text-gray-300">{entry.features.length}</Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-2 mt-2">
                                {entry.features.map((feature, i) => (
                                  <li key={i} className="flex items-start gap-2 text-gray-300">
                                    <span className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0"></span>
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        )}

                        {entry.improvements && entry.improvements.length > 0 && (
                          <AccordionItem value={`improvements-${entry.version}`}>
                            <AccordionTrigger className="text-left hover:no-underline text-gray-200">
                              <div className="flex items-center gap-2">
                                <Wrench className="h-4 w-4 text-violet-400" />
                                <span className="font-semibold">Mejoras</span>
                                <Badge variant="outline" className="border-gray-600 text-gray-300">{entry.improvements.length}</Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-2 mt-2">
                                {entry.improvements.map((improvement, i) => (
                                  <li key={i} className="flex items-start gap-2 text-gray-300">
                                    <span className="w-2 h-2 bg-violet-400 rounded-full mt-2 flex-shrink-0"></span>
                                    <span>{improvement}</span>
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        )}

                        {entry.technical && entry.technical.length > 0 && (
                          <AccordionItem value={`technical-${entry.version}`}>
                            <AccordionTrigger className="text-left hover:no-underline text-gray-200">
                              <div className="flex items-center gap-2">
                                <Wrench className="h-4 w-4 text-purple-400" />
                                <span className="font-semibold">Cambios Técnicos</span>
                                <Badge variant="outline" className="border-gray-600 text-gray-300">{entry.technical.length}</Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-2 mt-2">
                                {entry.technical.map((tech, i) => (
                                  <li key={i} className="flex items-start gap-2 text-gray-300">
                                    <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                                    <span className="font-mono text-sm">{tech}</span>
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        )}

                        {entry.fixes && entry.fixes.length > 0 && (
                          <AccordionItem value={`fixes-${entry.version}`}>
                            <AccordionTrigger className="text-left hover:no-underline text-gray-200">
                              <div className="flex items-center gap-2">
                                <Bug className="h-4 w-4 text-orange-400" />
                                <span className="font-semibold">Corrección de Errores</span>
                                <Badge variant="outline" className="border-gray-600 text-gray-300">{entry.fixes.length}</Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-2 mt-2">
                                {entry.fixes.map((fix, i) => (
                                  <li key={i} className="flex items-start gap-2 text-gray-300">
                                    <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></span>
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
              <Card className="bg-gray-900/80 backdrop-blur-md border border-gray-800 shadow-2xl">
                <CardContent className="pt-6">
                  <p className="text-gray-400 text-sm">
                    Este registro de cambios sigue el formato de{' '}
                    <a
                      href="https://keepachangelog.com/en/1.0.0/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-400 hover:text-pink-400 underline transition-colors"
                    >
                      Keep a Changelog
                    </a>
                    {' '}y se adhiere a{' '}
                    <a
                      href="https://semver.org/spec/v2.0.0.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-400 hover:text-pink-400 underline transition-colors"
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