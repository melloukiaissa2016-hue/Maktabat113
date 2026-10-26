import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  Product,
  Order,
  PrintRequest,
  ResearchRequest,
  JobOffer,
  Lesson,
  SiteSettings,
  AdminLog,
  AppUser
} from '../types';

// Helper to generate human-readable reference codes
export function generateReferenceCode(prefix: 'ORD' | 'PRN' | 'RES' | 'DOC'): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${randomNum}`;
}

// ---------------- PRODUCTS ----------------

export async function fetchProducts(): Promise<Product[]> {
  try {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'products');
    return [];
  }
}

export function subscribeProducts(callback: (products: Product[]) => void) {
  const q = query(collection(db, 'products'));
  return onSnapshot(
    q,
    (snap) => {
      const prods = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
      callback(prods);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'products');
    }
  );
}

export async function saveProduct(product: Partial<Product>): Promise<string> {
  try {
    if (product.id) {
      const docRef = doc(db, 'products', product.id);
      await updateDoc(docRef, {
        ...product,
        updatedAt: new Date().toISOString()
      });
      return product.id;
    } else {
      const docRef = await addDoc(collection(db, 'products'), {
        ...product,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'products');
    throw error;
  }
}

export async function deleteProduct(productId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
    throw error;
  }
}

// ---------------- ORDERS ----------------

export async function createOrder(orderData: Omit<Order, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'orders');
    throw error;
  }
}

export function subscribeOrders(callback: (orders: Order[]) => void) {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
      callback(orders);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'orders');
    }
  );
}

export function subscribeCustomerOrders(customerUid: string, callback: (orders: Order[]) => void) {
  const q = query(
    collection(db, 'orders'),
    where('customerUid', '==', customerUid),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
      callback(orders);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'orders');
    }
  );
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    throw error;
  }
}

// ---------------- PRINT REQUESTS ----------------

export async function createPrintRequest(requestData: Omit<PrintRequest, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'printRequests'), {
      ...requestData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'printRequests');
    throw error;
  }
}

export function subscribePrintRequests(callback: (requests: PrintRequest[]) => void) {
  const q = query(collection(db, 'printRequests'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as PrintRequest));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'printRequests');
    }
  );
}

export function subscribeCustomerPrintRequests(customerUid: string, callback: (requests: PrintRequest[]) => void) {
  const q = query(
    collection(db, 'printRequests'),
    where('customerUid', '==', customerUid),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as PrintRequest));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'printRequests');
    }
  );
}

export async function updatePrintRequest(
  requestId: string,
  updates: Partial<PrintRequest>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'printRequests', requestId), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `printRequests/${requestId}`);
    throw error;
  }
}

// ---------------- RESEARCH REQUESTS ----------------

export async function createResearchRequest(requestData: Omit<ResearchRequest, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'researchRequests'), {
      ...requestData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'researchRequests');
    throw error;
  }
}

export function subscribeResearchRequests(callback: (requests: ResearchRequest[]) => void) {
  const q = query(collection(db, 'researchRequests'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ResearchRequest));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'researchRequests');
    }
  );
}

export function subscribeCustomerResearchRequests(customerUid: string, callback: (requests: ResearchRequest[]) => void) {
  const q = query(
    collection(db, 'researchRequests'),
    where('customerUid', '==', customerUid),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ResearchRequest));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'researchRequests');
    }
  );
}

export async function updateResearchRequest(
  requestId: string,
  updates: Partial<ResearchRequest>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'researchRequests', requestId), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `researchRequests/${requestId}`);
    throw error;
  }
}

// ---------------- TRACK BY CODE ----------------

export async function findByReferenceCode(code: string): Promise<{
  type: 'order' | 'print' | 'research';
  data: Order | PrintRequest | ResearchRequest;
} | null> {
  const clean = code.trim().toUpperCase();

  // Try orders
  try {
    const oSnap = await getDocs(query(collection(db, 'orders'), where('referenceCode', '==', clean), limit(1)));
    if (!oSnap.empty) {
      return { type: 'order', data: { id: oSnap.docs[0].id, ...oSnap.docs[0].data() } as Order };
    }
  } catch {}

  // Try printRequests
  try {
    const pSnap = await getDocs(query(collection(db, 'printRequests'), where('referenceCode', '==', clean), limit(1)));
    if (!pSnap.empty) {
      return { type: 'print', data: { id: pSnap.docs[0].id, ...pSnap.docs[0].data() } as PrintRequest };
    }
  } catch {}

  // Try researchRequests
  try {
    const rSnap = await getDocs(query(collection(db, 'researchRequests'), where('referenceCode', '==', clean), limit(1)));
    if (!rSnap.empty) {
      return { type: 'research', data: { id: rSnap.docs[0].id, ...rSnap.docs[0].data() } as ResearchRequest };
    }
  } catch {}

  return null;
}

// ---------------- JOB OFFERS ----------------

export function subscribeJobOffers(callback: (jobs: JobOffer[]) => void) {
  const q = query(collection(db, 'jobOffers'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as JobOffer));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'jobOffers');
    }
  );
}

export async function saveJobOffer(job: Partial<JobOffer>): Promise<string> {
  try {
    if (job.id) {
      await updateDoc(doc(db, 'jobOffers', job.id), {
        ...job,
        updatedAt: new Date().toISOString()
      });
      return job.id;
    } else {
      const docRef = await addDoc(collection(db, 'jobOffers'), {
        ...job,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'jobOffers');
    throw error;
  }
}

export async function deleteJobOffer(jobId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'jobOffers', jobId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `jobOffers/${jobId}`);
    throw error;
  }
}

// ---------------- LESSONS BANK ----------------

export function subscribeLessons(callback: (lessons: Lesson[]) => void) {
  const q = query(collection(db, 'lessons'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Lesson));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'lessons');
    }
  );
}

export async function saveLesson(lesson: Partial<Lesson>): Promise<string> {
  try {
    if (lesson.id) {
      await updateDoc(doc(db, 'lessons', lesson.id), {
        ...lesson,
        updatedAt: new Date().toISOString()
      });
      return lesson.id;
    } else {
      const docRef = await addDoc(collection(db, 'lessons'), {
        ...lesson,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'lessons');
    throw error;
  }
}

export async function deleteLesson(lessonId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'lessons', lessonId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `lessons/${lessonId}`);
    throw error;
  }
}

// ---------------- SITE SETTINGS ----------------

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 'global',
  siteName: 'Maktaba113',
  siteNameAr: 'مكتبة 113',
  logoUrl: '',
  phone: '0550 11 31 13',
  phoneWhatsApp: '+213550113113',
  email: 'contact@maktaba113.com',
  address: 'وسط المدينة - حي الاستقلال، الجزائر',
  workingHours: 'السبت - الخميس: 08:00 صباحاً - 20:00 مساءً | الجمعة: 14:00 - 20:00',
  facebookUrl: 'https://facebook.com',
  instagramUrl: 'https://instagram.com',
  deliveryActive: true,
  deliveryPrice: 400,
  sectionsConfig: {
    home: true,
    school_supplies: true,
    printing: true,
    research: true,
    documents: true,
    jobs: true,
    lessons: true,
    toys: true,
    sweets: true,
    cosmetics: true,
    offers: true,
    contact: true
  },
  retentionDays: 30,
  updatedAt: new Date().toISOString()
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const docRef = doc(db, 'siteSettings', 'global');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as SiteSettings;
    } else {
      // Seed default settings
      await setDoc(docRef, DEFAULT_SITE_SETTINGS);
      return DEFAULT_SITE_SETTINGS;
    }
  } catch (error) {
    console.warn('Using default site settings fallback:', error);
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
  try {
    const docRef = doc(db, 'siteSettings', 'global');
    await setDoc(docRef, {
      ...settings,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'siteSettings/global');
    throw error;
  }
}

// ---------------- ADMIN LOGS ----------------

export async function logAdminAction(action: string, details: string, adminEmail: string, targetId?: string) {
  try {
    await addDoc(collection(db, 'adminLogs'), {
      adminEmail,
      action,
      details,
      targetId: targetId || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.warn('Logging skipped or error:', error);
  }
}

export function subscribeAdminLogs(callback: (logs: AdminLog[]) => void) {
  const q = query(collection(db, 'adminLogs'), orderBy('timestamp', 'desc'), limit(50));
  return onSnapshot(
    q,
    (snap) => {
      const logs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdminLog));
      callback(logs);
    },
    (error) => {
      console.warn('Could not subscribe to admin logs:', error);
    }
  );
}

// ---------------- CUSTOMERS / USERS ----------------

export function subscribeUsers(callback: (users: AppUser[]) => void) {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const users = snap.docs.map((d) => ({ uid: d.id, ...d.data() } as AppUser));
      callback(users);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'users');
    }
  );
}

export async function deleteUserRecord(userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
    throw error;
  }
}

// ---------------- SEED INITIAL REAL DATA IF EMPTY ----------------

export async function seedInitialDataIfNeeded() {
  try {
    const snap = await getDocs(query(collection(db, 'products'), limit(1)));
    if (snap.empty) {
      console.log('Seeding initial Maktaba113 database records...');

      const initialProducts: Omit<Product, 'id'>[] = [
        {
          name: 'حزمة كراس 96 صفحة مسطر - عبوة 5 كراريس فاخرة',
          nameFr: 'Pack de 5 Cahiers 96 pages Seyès Qualité Supérieure',
          nameEn: 'Pack of 5 Spiral/Bound Notebooks 96 Pages',
          description: 'كراريس عالية الجودة، ورق ناصع البياض 70 غرام لا ينفذ منه الحبر، ملائم للطلبة والتلاميذ.',
          descriptionFr: 'Cahiers grand format, papier extra blanc 70g sans buvard, idéal pour écoliers et étudiants.',
          descriptionEn: 'High quality notebooks with thick 70gsm white paper.',
          price: 450,
          discountPrice: 400,
          category: 'cat_school_supplies',
          stock: 45,
          imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
          featured: true,
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          name: 'مجموعة أقلام جافة ملونة فاخرة (أزرق، أسود، أحمر، أخضر)',
          nameFr: 'Lot de 4 Stylos à bille classiques pointe fine',
          nameEn: 'Set of 4 Fine Ballpoint Pens',
          description: 'كتابة سلسة ومريحة، خط 0.7 ملم يدوم طويلاً، علامة أصلية معتمدة.',
          descriptionFr: 'Écriture fluide et nette 0.7mm, prise en main ergonomique.',
          descriptionEn: 'Smooth writing ballpoint pens with ergonomic grip.',
          price: 200,
          category: 'cat_school_supplies',
          stock: 120,
          imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80',
          featured: true,
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          name: 'طقم هندسة مدرسي متكامل مع علبة معدنية ومفرجار',
          nameFr: 'Boîte de Géométrie Métallique Complète avec Compas',
          nameEn: 'Complete Mathematical Geometry Set with Metal Box',
          description: 'يحتوي على مسطرة 15 سم، منقلة، كوسين، ممحاة، مبراة، ومفرجار معدني متين.',
          descriptionFr: 'Kit complet : règle, équerres, rapporteur, compas métallique résistant.',
          descriptionEn: 'Durable school math compass and ruler set.',
          price: 550,
          discountPrice: 490,
          category: 'cat_school_supplies',
          stock: 30,
          imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80',
          featured: true,
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          name: 'رزمة ورق طباعة A4 ناصع البياض 80 غرام (500 ورقة)',
          nameFr: 'Rame de Papier A4 80g Extra Blanc (500 Feuilles)',
          nameEn: 'A4 White Copier Paper Ream 80gsm (500 Sheets)',
          description: 'ورق طباعة ليزري ومكتبي ممتاز، مقاوم لانحشار الطابعات، مثالي للمذكرات والوثائق.',
          descriptionFr: 'Papier multi-usages blanc haute brillance sans bourrage pour photocopieur et imprimante.',
          descriptionEn: 'Premium 80gsm copy paper, jam-free.',
          price: 850,
          discountPrice: 800,
          category: 'cat_printing',
          stock: 60,
          imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80',
          featured: true,
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          name: 'حقيبة ظهر مدرسية مريحة ومتينة متعددة الجيوب',
          nameFr: 'Cartable & Sac à Dos Scolaire Ergonomique',
          nameEn: 'Ergonomic Student Backpack',
          description: 'خفيفة الوزن ومبطنة للظهر والأكتاف مع مقصورة للكتب واللوحة الإلكترونية.',
          descriptionFr: 'Dos et bretelles rembourrés pour un confort optimal, tissu déperlant résistant.',
          descriptionEn: 'Durable multi-compartment school bag.',
          price: 2800,
          discountPrice: 2450,
          category: 'cat_school_supplies',
          stock: 15,
          imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
          featured: true,
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          name: 'لعبة تركيب ومكعبات خشبية تعليمية للأطفال',
          nameFr: 'Jeu de Construction et Blocs en Bois Éducatif',
          nameEn: 'Educational Wooden Building Blocks for Kids',
          description: 'تساعد على تنمية الذكاء والتركيز والتنسيق الحركي، ألوان طبيعية آمنة 100%.',
          descriptionFr: 'Développe la motricité fine et l\'éveil spatial, bois naturel non toxique.',
          descriptionEn: 'Safe natural wooden blocks for cognitive development.',
          price: 1600,
          discountPrice: 1400,
          category: 'cat_toys',
          stock: 20,
          imageUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80',
          featured: false,
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          name: 'علبة شوكولاتة وبسكويت محشو للتحفيز والمذاكرة',
          nameFr: 'Boîte de Biscuits et Chocolat Gourmand pour Étudiants',
          nameEn: 'Study Energy Snack Box (Chocolate & Biscuits)',
          description: 'وجبة سريعة لذيذة تمنح الطاقة والنشاط أثناء فترات المراجعة والامتحانات.',
          descriptionFr: 'Pause gourmande et énergisante idéale pendant les révisions.',
          descriptionEn: 'Delicious snacks for study breaks.',
          price: 350,
          category: 'cat_sweets',
          stock: 50,
          imageUrl: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?auto=format&fit=crop&w=600&q=80',
          featured: false,
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          name: 'مرطب شفاه وكريم يدين طبيعي معطر للفتيات والطالبات',
          nameFr: 'Crème Mains & Baume à Lèvres Hydratant Naturel',
          nameEn: 'Natural Moisturizing Hand Cream & Lip Balm',
          description: 'ترطيب عميق وحماية يومية بحجم عملي ملائم لحقيبة الدراسة والعمل.',
          descriptionFr: 'Soin protecteur doux pour les mains et lèvres, parfum délicat.',
          descriptionEn: 'Gentle hydration cream for daily student carry.',
          price: 600,
          category: 'cat_cosmetics',
          stock: 25,
          imageUrl: 'https://images.unsplash.com/photo-1608248597359-54876b509355?auto=format&fit=crop&w=600&q=80',
          featured: false,
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ];

      for (const p of initialProducts) {
        await addDoc(collection(db, 'products'), p);
      }

      // Initial job offers
      const initialJobs: Omit<JobOffer, 'id'>[] = [
        {
          title: 'مسابقة توظيف أساتذة التعليم الابتدائي والمتوسط',
          organization: 'مديرية التربية الوطنية',
          position: 'أستاذ تعليم ابتدائي / متوسط (لغة عربية، رياضيات، فرنسية)',
          wilaya: 'الجزائر العاصمة وكافة الولايات',
          specialty: 'تعليم وتربية',
          description: 'فتح باب الترشح لمسابقات التوظيف على أساس الشهادات للالتحاق برتب الأساتذة للطورين الابتدائي والمتوسط.',
          requirements: 'شهادة ليسانس أو ماستر في التخصص المطلوب + ملف إداري كامل.',
          deadline: '2026-11-15',
          officialLink: 'https://www.education.gov.dz',
          isNew: true,
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          title: 'توظيف مهندسين في الإعلام الآلي وشبكات الحاسوب',
          organization: 'مؤسسة عمومية ذات طابع تجاري',
          position: 'مهندس دولة في الإعلام الآلي',
          wilaya: 'وهران',
          specialty: 'إعلام آلي وشبكات',
          description: 'إعلان توظيف خارجي لشغل منصب مهندس دولة مكلف بإدارة وتطوير الأنظمة وقواعد البيانات.',
          requirements: 'شهادة مهندس دولة أو ماستر في الإعلام الآلي، خبرة سنة على الأقل مطلوبة.',
          deadline: '2026-11-20',
          officialLink: 'https://www.anem.dz',
          isNew: true,
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ];

      for (const j of initialJobs) {
        await addDoc(collection(db, 'jobOffers'), j);
      }

      // Initial lessons
      const initialLessons: Omit<Lesson, 'id'>[] = [
        {
          title: 'ملخص شامل في المتتاليات العددية وقوانين البكالوريا مع تمارين محلولة',
          level: 'high',
          grade: '3 ثانوي (بكالوريا)',
          subject: 'الرياضيات',
          semester: '1',
          description: 'ملف PDF جاهز للطباعة يحتوي على القواعد، النهايات، البرهان بالتراجع، ومسائل شاملة.',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileName: 'Resume_Suites_Bac_Maths.pdf',
          fileType: 'application/pdf',
          fileSize: 1420000,
          createdAt: new Date().toISOString()
        },
        {
          title: 'فروض واختبارات نموذجية في مادة العلوم الفيزيائية مع التصحيح النموذجي',
          level: 'middle',
          grade: '4 متوسط (شهادة BEM)',
          subject: 'الفيزياء والتكنولوجيا',
          semester: '1',
          description: 'سلسلة تمارين المادة وتحولاتها والأمن الكهربائي المحضرة لشهادة التعليم المتوسط.',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileName: 'Physique_BEM_Devoirs.pdf',
          fileType: 'application/pdf',
          fileSize: 980000,
          createdAt: new Date().toISOString()
        }
      ];

      for (const l of initialLessons) {
        await addDoc(collection(db, 'lessons'), l);
      }
    }
  } catch (err) {
    console.warn('Initial seed check:', err);
  }
}
