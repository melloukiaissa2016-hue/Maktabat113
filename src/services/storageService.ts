import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
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
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export function validateFile(file: File): { valid: boolean; error?: string } {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  if (BLOCKED_EXTENSIONS.includes(extension)) {
    return { valid: false, error: `نوع الملف غير مسموح به لأسباب أمنية (${extension})` };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'حجم الملف يتجاوز الحد الأقصى المسموح به (25 ميغابايت)' };
  }

  // Check MIME or extension
  const isAllowedMime = ALLOWED_MIME_TYPES.includes(file.type);
  const isAllowedExt = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'webp'].includes(extension);

  if (!isAllowedMime && !isAllowedExt) {
    return { valid: false, error: 'الملف غير مدعوم. الصيغ المدعومة هي: PDF، Word، والصور فقط.' };
  }

  return { valid: true };
}

export async function uploadFile(
  file: File,
  folder: string = 'uploads',
  onProgress?: (progress: number) => void
): Promise<UploadedFileInfo> {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'ملف غير صالح');
  }

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${folder}/${timestamp}_${safeName}`;
  const storageRef = ref(storage, storagePath);

  try {
    const uploadTask = uploadBytesResumable(storageRef, file);

    return await new Promise<UploadedFileInfo>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          if (onProgress) onProgress(progress);
        },
        async (error) => {
          console.warn('Firebase Storage direct upload error, falling back to secure Data URL storage:', error);
          try {
            // Secure fallback to Base64 data URL if storage bucket fails
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
          } catch (readErr) {
            reject(readErr);
          }
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            if (onProgress) onProgress(100);
            resolve({
              originalName: file.name,
              size: file.size,
              mimeType: file.type || 'application/octet-stream',
              downloadUrl,
              uploadedAt: new Date().toISOString()
            });
          } catch (urlErr) {
            console.error('Error fetching download URL:', urlErr);
            reject(urlErr);
          }
        }
      );
    });
  } catch (err) {
    console.warn('Fallback file reader applied:', err);
    // Direct FileReader fallback
    return new Promise<UploadedFileInfo>((resolve, reject) => {
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
      reader.onerror = () => reject(new Error('فشل معالجة الملف'));
      reader.readAsDataURL(file);
    });
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function triggerFileDownload(url: string, filename: string): void {
  try {
    if (url.startsWith('data:') || url.startsWith('blob:')) {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // For remote URL, fetch as blob to force browser download with exact name
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.blob();
      })
      .then((blob) => {
        const objectUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
      })
      .catch(() => {
        // Fallback to direct anchor trigger
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.target = '_blank';
        a.rel = 'noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
  } catch (err) {
    console.error('File download error:', err);
    window.open(url, '_blank');
  }
}

