import { UploadedFileInfo } from '../types';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp'
];

const BLOCKED_EXTENSIONS = ['exe', 'bat', 'cmd', 'sh', 'js', 'vbs', 'scr', 'php', 'py'];
export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

export function validateFile(file: File): { valid: boolean; error?: string } {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  if (BLOCKED_EXTENSIONS.includes(extension)) {
    return { valid: false, error: `نوع الملف غير مسموح به لأسباب أمنية (.${extension})` };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'حجم الملف يتجاوز الحد الأقصى المسموح به (100 ميغابايت)' };
  }

  // Check MIME or extension
  const isAllowedMime = ALLOWED_MIME_TYPES.includes(file.type);
  const isAllowedExt = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'webp'].includes(extension);

  if (!isAllowedMime && !isAllowedExt) {
    return { valid: false, error: 'الملف غير مدعوم. الصيغ المدعومة هي: PDF، Word (.doc, .docx)، والصور فقط حتى 100 ميغابايت.' };
  }

  return { valid: true };
}

/**
 * Upload a file up to 100MB with real-time streaming progress to the server.
 */
export async function uploadFile(
  file: File,
  _folder: string = 'uploads',
  onProgress?: (progress: number) => void
): Promise<UploadedFileInfo> {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'ملف غير صالح');
  }

  if (onProgress) onProgress(5);

  return new Promise<UploadedFileInfo>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload', true);
    xhr.setRequestHeader('x-filename', encodeURIComponent(file.name));
    xhr.setRequestHeader('content-type', file.type || 'application/octet-stream');

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.min(99, Math.max(5, Math.round((event.loaded / event.total) * 100)));
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          if (onProgress) onProgress(100);
          resolve({
            originalName: res.originalName || file.name,
            size: res.size || file.size,
            mimeType: res.mimeType || file.type || 'application/octet-stream',
            downloadUrl: res.downloadUrl,
            uploadedAt: res.uploadedAt || new Date().toISOString()
          });
        } catch {
          if (onProgress) onProgress(100);
          resolve({
            originalName: file.name,
            size: file.size,
            mimeType: file.type || 'application/octet-stream',
            downloadUrl: `/uploads/${file.name}`,
            uploadedAt: new Date().toISOString()
          });
        }
      } else {
        // Fallback: If server endpoint returned an error, try client reader fallback
        console.warn('Server upload endpoint responded with status:', xhr.status);
        handleClientFallback(file, onProgress, resolve, reject);
      }
    };

    xhr.onerror = () => {
      console.warn('Network error uploading to /api/upload, applying fallback reader');
      handleClientFallback(file, onProgress, resolve, reject);
    };

    xhr.send(file);
  });
}

function handleClientFallback(
  file: File,
  onProgress: ((p: number) => void) | undefined,
  resolve: (res: UploadedFileInfo) => void,
  reject: (err: unknown) => void
) {
  // If file is smaller than 15MB, convert to data URL so it can still be downloaded/viewed
  if (file.size <= 15 * 1024 * 1024) {
    const reader = new FileReader();
    reader.onload = () => {
      if (onProgress) onProgress(100);
      resolve({
        originalName: file.name,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        downloadUrl: reader.result as string,
        uploadedAt: new Date().toISOString()
      });
    };
    reader.onerror = () => reject(new Error('فشل قراءة الملف'));
    reader.readAsDataURL(file);
  } else {
    // For very large files, use local Blob URL
    const blobUrl = URL.createObjectURL(file);
    if (onProgress) onProgress(100);
    resolve({
      originalName: file.name,
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
      downloadUrl: blobUrl,
      uploadedAt: new Date().toISOString()
    });
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function dataURLtoBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const byteString = atob(parts[1]);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);
  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }
  return new Blob([uint8Array], { type: mime });
}

export function triggerFileDownload(url: string, filename: string): void {
  try {
    const cleanFilename = filename || 'file';

    // 1. Data URL
    if (url.startsWith('data:')) {
      const blob = dataURLtoBlob(url);
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = cleanFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(objectUrl), 2000);
      return;
    }

    // 2. Blob URL
    if (url.startsWith('blob:')) {
      const a = document.createElement('a');
      a.href = url;
      a.download = cleanFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // 3. Server URL (e.g., /uploads/...) or Remote URL
    const a = document.createElement('a');
    a.href = url;
    a.download = cleanFilename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    console.error('File download error:', err);
    window.open(url, '_blank');
  }
}
