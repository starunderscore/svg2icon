// File utility functions for SVG2Icon

export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  allowedExtensions?: string[];
  minSize?: number;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates a file against given criteria
 */
export function validateFile(file: File, options: FileValidationOptions = {}): FileValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/svg+xml'],
    allowedExtensions = ['.svg'],
    minSize = 1
  } = options;

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size ${formatFileSize(file.size)} exceeds maximum allowed size of ${formatFileSize(maxSize)}`);
  }

  if (file.size < minSize) {
    errors.push(`File size ${formatFileSize(file.size)} is below minimum required size of ${formatFileSize(minSize)}`);
  }

  // Check MIME type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type "${file.type}" is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }

  // Check file extension
  if (allowedExtensions.length > 0) {
    const fileExtension = getFileExtension(file.name);
    if (!allowedExtensions.includes(fileExtension)) {
      errors.push(`File extension "${fileExtension}" is not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`);
    }
  }

  // Check for empty MIME type (might indicate issues)
  if (!file.type) {
    warnings.push('File has no MIME type information. This may cause issues.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates specifically for SVG files
 */
export function validateSvgFile(file: File): FileValidationResult {
  return validateFile(file, {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/svg+xml', 'text/xml', 'application/xml'],
    allowedExtensions: ['.svg'],
    minSize: 10 // 10 bytes minimum
  });
}

/**
 * Converts a File to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove data URL prefix to get just the base64 data
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to read file as base64 string'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file: ' + reader.error?.message));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Converts a File to text string
 */
export function fileToText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as text string'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file: ' + reader.error?.message));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Converts base64 string back to a Blob
 */
export function base64ToBlob(base64: string, mimeType: string = 'image/svg+xml'): Blob {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: mimeType });
}

/**
 * Downloads a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Downloads text content as a file
 */
export function downloadText(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

/**
 * Downloads base64 content as a file
 */
export function downloadBase64(base64: string, filename: string, mimeType: string): void {
  const blob = base64ToBlob(base64, mimeType);
  downloadBlob(blob, filename);
}

/**
 * Gets file extension from filename
 */
export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex !== -1 ? filename.substring(lastDotIndex).toLowerCase() : '';
}

/**
 * Gets filename without extension
 */
export function getFileNameWithoutExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex !== -1 ? filename.substring(0, lastDotIndex) : filename;
}

/**
 * Formats file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Parses file size string back to bytes
 */
export function parseFileSize(sizeString: string): number {
  const match = sizeString.match(/^(\d+(?:\.\d+)?)\s*([KMGT]?B)$/i);
  if (!match) return 0;
  
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  
  const multipliers: Record<string, number> = {
    'B': 1,
    'KB': 1024,
    'MB': 1024 * 1024,
    'GB': 1024 * 1024 * 1024,
    'TB': 1024 * 1024 * 1024 * 1024
  };
  
  return value * (multipliers[unit] || 1);
}

/**
 * Validates SVG content for security issues
 */
export function validateSvgContent(svgContent: string): FileValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for script tags
  if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(svgContent)) {
    errors.push('SVG contains script tags which are not allowed for security reasons');
  }

  // Check for external references
  if (/xlink:href\s*=\s*["'](?!#|data:)[^"']*["']/gi.test(svgContent)) {
    warnings.push('SVG contains external references which may not work in all contexts');
  }

  // Check for suspicious event handlers
  const eventHandlers = ['onclick', 'onload', 'onerror', 'onmouseover'];
  const eventHandlerPattern = new RegExp(`\\b(?:${eventHandlers.join('|')})\\s*=`, 'gi');
  if (eventHandlerPattern.test(svgContent)) {
    errors.push('SVG contains event handlers which are not allowed for security reasons');
  }

  // Basic SVG structure validation
  if (!/<svg\b[^>]*>/i.test(svgContent)) {
    errors.push('Content does not appear to be a valid SVG (missing <svg> tag)');
  }

  // Check for closing SVG tag
  if (!/<\/svg>/i.test(svgContent)) {
    warnings.push('SVG may be incomplete (missing closing </svg> tag)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Sanitizes SVG content by removing potentially dangerous elements
 */
export function sanitizeSvgContent(svgContent: string): string {
  let sanitized = svgContent;

  // Remove script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers
  const eventHandlers = ['onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout', 'onmousedown', 'onmouseup'];
  eventHandlers.forEach(handler => {
    const pattern = new RegExp(`\\s+${handler}\\s*=\\s*["'][^"']*["']`, 'gi');
    sanitized = sanitized.replace(pattern, '');
  });

  // Remove external href references (keep internal ones starting with #)
  sanitized = sanitized.replace(/xlink:href\s*=\s*["'](?!#)[^"']*["']/gi, '');

  return sanitized;
}

/**
 * Creates a data URL from file content
 */
export function createDataUrl(content: string, mimeType: string): string {
  const base64 = btoa(content);
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Extracts content from a data URL
 */
export function parseDataUrl(dataUrl: string): { mimeType: string; content: string } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  
  try {
    return {
      mimeType: match[1],
      content: atob(match[2])
    };
  } catch (error) {
    return null;
  }
}

/**
 * Checks if a file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Checks if a file is an SVG
 */
export function isSvgFile(file: File): boolean {
  return file.type === 'image/svg+xml' || 
         file.name.toLowerCase().endsWith('.svg');
}

/**
 * Generates a safe filename from user input
 */
export function sanitizeFilename(filename: string): string {
  // Remove or replace dangerous characters
  const sanitized = filename
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '') // Remove invalid chars
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^[._]+|[._]+$/g, '') // Remove leading/trailing dots and underscores
    .substring(0, 100); // Limit length

  // Ensure we have a valid filename
  return sanitized || 'unnamed_file';
}

/**
 * Compares two files for equality
 */
export async function filesEqual(file1: File, file2: File): Promise<boolean> {
  if (file1.size !== file2.size) return false;
  if (file1.name !== file2.name) return false;
  if (file1.type !== file2.type) return false;
  if (file1.lastModified !== file2.lastModified) return false;

  // For small files, compare content
  if (file1.size < 1024 * 1024) { // 1MB
    try {
      const content1 = await fileToBase64(file1);
      const content2 = await fileToBase64(file2);
      return content1 === content2;
    } catch (error) {
      return false;
    }
  }

  return true;
}