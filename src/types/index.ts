export type Language = 'ar' | 'fr' | 'en';

export type UserRole = 'customer' | 'admin';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  phone?: string;
  createdAt?: string;
  ordersCount?: number;
  totalSpent?: number;
}

export interface ManagedFileItem {
  file: UploadedFileInfo;
  sourceType: 'print' | 'research' | 'bill' | 'document';
  referenceCode: string;
  customerName: string;
  customerPhone: string;
  orderStatus: OrderStatus | FlexyStatus;
  requestId: string;
  notes?: string;
}

export type OrderStatus = 'new' | 'processing' | 'ready' | 'completed' | 'cancelled';
export type FlexyStatus = 'new' | 'processing' | 'completed' | 'rejected';

export interface CartItem {
  productId: string;
  name: string;
  nameFr?: string;
  nameEn?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  category?: string;
  stock?: number;
}

export interface Product {
  id: string;
  name: string;
  nameFr?: string;
  nameEn?: string;
  description: string;
  descriptionFr?: string;
  descriptionEn?: string;
  price: number;
  discountPrice?: number;
  category: string;
  stock: number;
  imageUrl: string;
  additionalImages?: string[]; // Multiple photos support
  featured?: boolean;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Order {
  id: string;
  referenceCode: string;
  customerUid?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryMethod: 'pickup' | 'delivery';
  deliveryAddress?: string;
  notes?: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: 'cash_on_delivery' | 'cash_in_store';
  createdAt: string;
  updatedAt?: string;
}

export interface UploadedFileInfo {
  originalName: string;
  size: number; // in bytes
  mimeType: string;
  downloadUrl: string;
  pageCount?: number;
  uploadedAt: string;
}

export interface PrintRequest {
  id: string;
  referenceCode: string;
  customerUid?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  files: UploadedFileInfo[];
  copies: number;
  colorMode: 'bw' | 'color';
  sidedness: 'single' | 'double';
  paperSize: 'A4' | 'A3' | 'other';
  pageRange: string; // 'all' or '1-5'
  notes?: string;
  internalNotes?: string;
  calculatedPrice?: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface ResearchRequest {
  id: string;
  referenceCode: string;
  customerUid?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  title: string;
  academicLevel: string;
  specialty: string;
  serviceType: string;
  deadline?: string;
  files: UploadedFileInfo[];
  resultFiles?: UploadedFileInfo[];
  notes?: string;
  internalNotes?: string;
  calculatedPrice?: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface FlexyRequest {
  id: string;
  referenceCode: string;
  customerUid?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  operator: 'mobilis' | 'djezzy' | 'ooredoo' | 'idoom_fibre';
  targetNumberOrContract: string; // Phone number or Idoom contract ID
  amount: number;
  notes?: string;
  adminNote?: string;
  status: FlexyStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface BillPaymentRequest {
  id: string;
  referenceCode: string;
  customerUid?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  billType: 'electricity_gas' | 'water' | 'landline' | 'internet';
  billReference: string;
  amount: number;
  billFile?: UploadedFileInfo;
  notes?: string;
  adminNote?: string;
  status: FlexyStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface DocumentExtractionRequest {
  id: string;
  referenceCode: string;
  customerUid?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string; // MANDATORY & VALIDATED
  serviceCategory?: 'competitions' | 'documents';
  serviceItem?: string;
  customServiceName?: string;
  docCategory: string;
  nationalIdOrNin?: string;
  notes?: string;
  attachedFiles?: UploadedFileInfo[];
  resultFiles?: UploadedFileInfo[];
  status: OrderStatus;
  adminNote?: string;
  calculatedPrice?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CustomerMessage {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  isRead: boolean;
  status: 'new' | 'replied' | 'archived';
  adminReply?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BannerItem {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  subtitle?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export interface JobOffer {
  id: string;
  title: string;
  organization: string;
  position: string;
  wilaya: string;
  specialty: string;
  description: string;
  requirements?: string;
  deadline?: string;
  officialLink?: string;
  attachmentUrl?: string;
  isNew?: boolean;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt?: string;
}

export interface Lesson {
  id: string;
  title: string;
  level: 'primary' | 'middle' | 'high' | 'university';
  grade?: string;
  subject: string;
  semester?: '1' | '2' | '3';
  description?: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SectionConfig {
  id: string;
  key: string;
  titleAr: string;
  titleFr: string;
  titleEn: string;
  isVisible: boolean;
  order: number;
}

export interface SiteSettings {
  id: string;
  siteName: string;
  siteNameAr: string;
  logoUrl?: string;
  heroBannerUrl?: string;
  heroSubtitle?: string;
  country: string;
  currency: string;
  phone: string;
  phoneWhatsApp: string;
  email: string;
  address: string;
  workingHours: string;
  facebookUrl?: string;
  instagramUrl?: string;
  deliveryActive: boolean;
  deliveryPrice: number;
  sectionsConfig: Record<string, boolean>;
  retentionDays: number;
  novemberBannerEnabled?: boolean;
  updatedAt: string;
}

export interface AdminLog {
  id: string;
  adminEmail: string;
  action: string;
  details: string;
  targetId?: string;
  timestamp: string;
}

