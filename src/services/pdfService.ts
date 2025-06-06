import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { APP_CONFIG } from '../config/app';

interface StoryPDFOptions {
  title: string;
  author?: string;
  content: string;
  coverImageUrl?: string;
}

/**
 * Servicio para la generación de PDFs de cuentos
 */
export const PdfService = {
  /**
   * Genera un PDF con una portada personalizada y el contenido del cuento
   * @param options Opciones para la generación del PDF
   * @returns Promise que resuelve con un Blob del PDF generado
   */
  async generateStoryPdf(options: StoryPDFOptions): Promise<Blob> {
    const { title, author, content } = options;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Colores y estilos
    const backgroundColor = '#fff6e0';
    const textColor = '#ce9789'; // Color más amigable para niños
    const titleColor = '#BB79D1';
    
    // Agregar la portada
    await this.addCoverPage(pdf, title, author);
    
    // Agregar el contenido
    await this.addContentPages(pdf, content, backgroundColor, textColor, title);
    
    // Agregar contraportada
    await this.addBackCoverPage(pdf);
    
    // Añadir pie de página a todas las páginas
    const totalPages = pdf.getNumberOfPages ? pdf.getNumberOfPages() : pdf.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      this.addFooter(pdf, i, totalPages);
    }
    
    return pdf.output('blob');
  },
  
  /**
   * Crea la portada del PDF
   */
  async addCoverPage(pdf: jsPDF, title: string, author?: string): Promise<void> {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Establecer el fondo de la portada
    pdf.setFillColor(255, 246, 224); // #fff6e0 en RGB
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Cargar la imagen de fondo
    try {
      // Simulamos cargar la imagen de fondo usando html2canvas
      const backgroundDiv = document.createElement('div');
      backgroundDiv.style.backgroundImage = 'url(/fondo_png.png)';
      backgroundDiv.style.backgroundSize = 'cover';
      backgroundDiv.style.width = '210mm';
      backgroundDiv.style.height = '297mm';
      document.body.appendChild(backgroundDiv);
      
      const canvas = await html2canvas(backgroundDiv, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      document.body.removeChild(backgroundDiv);
      
      // Agregar imagen de fondo con opacidad
      const imgData = canvas.toDataURL('image/png');
      // Usar método alternativo para manejar la opacidad
      const opacity = 0.15;
      // Las versiones más nuevas de jsPDF tienen globalAlpha en options
      try {
        // Intentar primero con la versión más nueva de la API
        pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST', 0);
      } catch (e) {
        // Si falla, intentar con la API estándar
        pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
      }
    } catch (error) {
      console.error('Error al cargar la imagen de fondo:', error);
    }
    
    // Agregar el logo
    try {
      const logo = new Image();
      logo.src = '/logo_png.png';
      
      // Esperar a que el logo se cargue
      await new Promise<void>((resolve) => {
        logo.onload = () => resolve();
        logo.onerror = () => {
          console.error('Error al cargar el logo');
          resolve();
        };
      });
      
      // Crear un canvas temporal para el logo
      const logoCanvas = document.createElement('canvas');
      const logoWidth = 60; // ancho en mm
      const logoHeight = (logo.height / logo.width) * logoWidth;
      
      logoCanvas.width = logo.width;
      logoCanvas.height = logo.height;
      const ctx = logoCanvas.getContext('2d');
      if (ctx) {  // Verificar que el contexto no sea null
        ctx.drawImage(logo, 0, 0, logo.width, logo.height);
        
        const logoData = logoCanvas.toDataURL('image/png');
        pdf.addImage(logoData, 'PNG', (pageWidth - logoWidth) / 2, 40, logoWidth, logoHeight);
      }
    } catch (error) {
      console.error('Error al cargar el logo:', error);
    }
    
    // Añadir el título
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor('#BB79D1'); // Morado de la marca
    
    // Ajustar el tamaño de la fuente según la longitud del título
    const titleFontSize = Math.min(32, 1000 / title.length);
    pdf.setFontSize(titleFontSize);
    
    const titleWidth = pdf.getStringUnitWidth(title) * titleFontSize / pdf.internal.scaleFactor;
    const titleX = (pageWidth - titleWidth) / 2;
    
    // Agregar título
    pdf.text(title, pageWidth / 2, pageHeight / 2, { align: 'center' });
    
    // Agregar autor si existe
    if (author) {
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor('#555555');
      pdf.setFontSize(12);
      pdf.text(`por ${author}`, pageWidth / 2, pageHeight / 2 + 15, { align: 'center' });
    }
    
    // Agregar fecha de generación
    const currentDate = new Date().toLocaleDateString();
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor('#777777');
    pdf.text(`Generado por ${APP_CONFIG.name}!`, pageWidth / 2, pageHeight - 20, { align: 'center' });
  },
  
  /**
   * Agrega las páginas con el contenido del cuento
   */
  async addContentPages(pdf: jsPDF, content: string, backgroundColor: string, textColor: string, title: string): Promise<void> {
    // Añadir una nueva página para el contenido
    pdf.addPage();
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Establecer el color de fondo blanco para las páginas de contenido
    pdf.setFillColor(255, 255, 255); // Blanco
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Añadir encabezado con logo y título
    await this.addHeaderToPage(pdf, title);
    
    // Configurar estilos de texto para el contenido - más grande y negrita para niños
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16); // Letra más grande para mejor legibilidad infantil
    pdf.setTextColor(textColor);
    
    // Márgenes
    const margin = 25; // Márgenes más amplios para mejor experiencia de lectura
    const effectiveWidth = pageWidth - 2 * margin;
    
    // Dividir el contenido en párrafos
    const paragraphs = content.split('\n\n');
    if (paragraphs.length === 1) {
      // Si solo hay un párrafo, dividir por saltos de línea simples
      paragraphs.splice(0, 1, ...content.split('\n'));
    }
    
    // Contador para llevar la posición Y actual
    let yPos = margin + 20; // Aumentamos el margen superior para dar espacio al encabezado
    
    // Iterar sobre cada párrafo
    for (const paragraph of paragraphs) {
      if (paragraph.trim() === '') continue;
      
      // Dividir el texto en líneas para que quepa dentro de la página
      const lines = pdf.splitTextToSize(paragraph, effectiveWidth);
      
      // Verificar si necesitamos una nueva página para este párrafo
      if (yPos + lines.length * 9 > pageHeight - margin) {
        pdf.addPage();
        pdf.setFillColor(255, 255, 255); // Fondo blanco para las nuevas páginas de contenido
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        
        // Añadir encabezado en la nueva página
        await this.addHeaderToPage(pdf, title);
        
        // Importante: restaurar el color del texto después de añadir el encabezado
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.setTextColor(textColor); // Restauramos el color original para el contenido
        
        yPos = margin + 20; // Reiniciar posición Y considerando espacio para el encabezado
      }
      
      // Agregar las líneas del párrafo
      pdf.text(lines, margin, yPos);
      
      // Actualizar la posición Y para el siguiente párrafo con menos espaciado
      yPos += lines.length * 9 + 3; // Reducido el espaciado entre párrafos
    }
  },

  /**
   * Agrega un encabezado a la página actual con logo en miniatura y título
   */
  async addHeaderToPage(pdf: jsPDF, title: string): Promise<void> {
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Añadir logo en miniatura
    try {
      const logo = new Image();
      logo.src = '/logo_png.png';
      
      // Esperar a que el logo se cargue
      await new Promise<void>((resolve) => {
        logo.onload = () => resolve();
        logo.onerror = () => {
          console.error('Error al cargar el logo para el encabezado');
          resolve();
        };
      });
      
      // Crear un canvas temporal para el logo
      const logoCanvas = document.createElement('canvas');
      const logoWidth = 15; // ancho en mm (más pequeño para el encabezado)
      const logoHeight = (logo.height / logo.width) * logoWidth;
      
      logoCanvas.width = logo.width;
      logoCanvas.height = logo.height;
      const ctx = logoCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(logo, 0, 0, logo.width, logo.height);
        
        const logoData = logoCanvas.toDataURL('image/png');
        
        // Posicionar logo en esquina superior izquierda con un margen
        pdf.addImage(logoData, 'PNG', 10, 10, logoWidth, logoHeight);
      }
    } catch (error) {
      console.error('Error al añadir logo al encabezado:', error);
    }
    
    // Añadir título en esquina superior derecha
    if (title) {
      // Configurar estilo infantil y amigable para el encabezado
      pdf.setFont('helvetica', 'bold'); // Cambiar a negrita para mejor legibilidad infantil
      pdf.setFontSize(12); // Ligeramente más grande
      pdf.setTextColor('#BB79D1'); // Color de marca TaleMe
      
      // Truncar título si es muy largo
      let displayTitle = title;
      if (displayTitle.length > 30) {
        displayTitle = displayTitle.substring(0, 27) + '...';
      }
      
      // Dibujar un fondo suave para el título
      const titleWidth = pdf.getStringUnitWidth(displayTitle) * 12 / pdf.internal.scaleFactor;
      const padding = 3; // Padding en mm
      
      pdf.setFillColor(240, 248, 255); // Fondo azul muy suave para mejor contraste en fondo blanco
      pdf.roundedRect(pageWidth - titleWidth - 20, 8, titleWidth + 10, 10, 2, 2, 'F');
      
      // Posicionar en esquina superior derecha con fondo
      pdf.text(displayTitle, pageWidth - 15, 15, { align: 'right' });
    }
  },

  /**
   * Agrega una contraportada al PDF con logo y texto de cierre
   */
  async addBackCoverPage(pdf: jsPDF): Promise<void> {
    pdf.addPage();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Establecer el fondo de la contraportada
    pdf.setFillColor(255, 246, 224); // #fff6e0 en RGB
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Cargar la imagen de fondo con baja opacidad
    try {
      // Simulamos cargar la imagen de fondo usando html2canvas
      const backgroundDiv = document.createElement('div');
      backgroundDiv.style.backgroundImage = 'url(/fondo_png.png)';
      backgroundDiv.style.backgroundSize = 'cover';
      backgroundDiv.style.width = '210mm';
      backgroundDiv.style.height = '297mm';
      document.body.appendChild(backgroundDiv);
      
      const canvas = await html2canvas(backgroundDiv, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      document.body.removeChild(backgroundDiv);
      
      // Agregar imagen de fondo con opacidad
      const imgData = canvas.toDataURL('image/png');
      try {
        pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST', 0);
      } catch (e) {
        pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
      }
    } catch (error) {
      console.error('Error al cargar la imagen de fondo:', error);
    }
    
    // Agregar el logo
    try {
      const logo = new Image();
      logo.src = '/logo_png.png';
      
      // Esperar a que el logo se cargue
      await new Promise<void>((resolve) => {
        logo.onload = () => resolve();
        logo.onerror = () => {
          console.error('Error al cargar el logo');
          resolve();
        };
      });
      
      // Crear un canvas temporal para el logo
      const logoCanvas = document.createElement('canvas');
      const logoWidth = 50; // ancho en mm
      const logoHeight = (logo.height / logo.width) * logoWidth;
      
      logoCanvas.width = logo.width;
      logoCanvas.height = logo.height;
      const ctx = logoCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(logo, 0, 0, logo.width, logo.height);
        
        const logoData = logoCanvas.toDataURL('image/png');
        pdf.addImage(logoData, 'PNG', (pageWidth - logoWidth) / 2, pageHeight / 3 - 25, logoWidth, logoHeight);
      }
    } catch (error) {
      console.error('Error al cargar el logo:', error);
    }
    
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor('#BB79D1');
    pdf.setFontSize(18);
    pdf.text(`Generado por ${APP_CONFIG.name}!`, pageWidth / 2, pageHeight / 2 - 10, { align: 'center' });
    
    // Agregar año actual
    const currentYear = new Date().getFullYear().toString();
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor('#777777');
    pdf.text(currentYear, pageWidth / 2, pageHeight / 2 + 30, { align: 'center' });
  },
  
  /**
   * Añade un pie de página a la página actual
   */
  addFooter(pdf: jsPDF, currentPage: number, totalPages: number): void {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    pdf.setFontSize(8);
    pdf.setTextColor('#777777');
    
    // Agregar número de página
    pdf.text(`${currentPage} / ${totalPages}`, pageWidth - 20, pageHeight - 10);
    
    // Agregar nombre de la aplicación y versión
    pdf.text(`${APP_CONFIG.name} v${APP_CONFIG.version}`, 20, pageHeight - 10);
  },
  
  /**
   * Descarga el PDF generado
   */
  downloadPdf(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}; 