import React, { useState, useMemo } from 'react';
import { Search, ShoppingBag, Check, SlidersHorizontal, X, ChevronRight, ChevronLeft, Eye } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

interface ShopViewProps {
  products: Product[];
  onNavigate: (view: string) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({ products, onNavigate }) => {
  const { t, language } = useLanguage();
  const { addItem, items } = useCart();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'default' | 'priceAsc' | 'priceDesc'>('default');
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [selectedGalleryProduct, setSelectedGalleryProduct] = useState<Product | null>(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number>(0);

  const categories = [
    { id: 'all', label: t('cat_all') },
    { id: 'cat_school_supplies', label: t('cat_school_supplies') },
    { id: 'cat_printing', label: t('cat_printing') },
    { id: 'cat_toys', label: t('cat_toys') },
    { id: 'cat_sweets', label: t('cat_sweets') },
    { id: 'cat_cosmetics', label: t('cat_cosmetics') },
    { id: 'cat_offers', label: t('cat_offers') },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory === 'cat_offers') {
        if (!p.discountPrice || p.discountPrice >= p.price) return false;
      } else if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query) ||
          (p.nameFr && p.nameFr.toLowerCase().includes(query)) ||
          (p.nameEn && p.nameEn.toLowerCase().includes(query));
        const matchDesc = p.description.toLowerCase().includes(query);
        if (!matchName && !matchDesc) return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.discountPrice || a.price;
      const priceB = b.discountPrice || b.price;
      if (sortBy === 'priceAsc') return priceA - priceB;
      if (sortBy === 'priceDesc') return priceB - priceA;
      return 0;
    });
  }, [products, selectedCategory, searchQuery, sortBy]);

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    setJustAddedId(product.id);
    setTimeout(() => setJustAddedId(null), 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-3xl p-6 sm:p-10 text-white shadow-lg">
        <h1 className="text-2xl sm:text-4xl font-black mb-2">{t('navStore')}</h1>
        <p className="text-emerald-100 text-xs sm:text-base max-w-2xl leading-relaxed">
          تشكيلة واسعة من الأدوات المدرسية واللوازم المكتبية وورق الطباعة والألعاب الهادفة بأسعار مدروسة ومخزون متجدد.
        </p>
      </div>

      {/* Filters and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 text-slate-400 absolute top-3 start-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchProducts')}
              className="w-full ps-11 pe-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute top-2.5 end-3 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full"
              >
                مسح
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            >
              <option value="default">الترتيب الافتراضي</option>
              <option value="priceAsc">{t('priceAsc')}</option>
              <option value="priceDesc">{t('priceDesc')}</option>
            </select>
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150 ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-lg mb-1">لم يتم العثور على أي منتج</h3>
          <p className="text-xs sm:text-sm text-slate-500">
            جرب البحث بكلمات أخرى أو اختر فئة مختلفة من الأقسام.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const hasDiscount = product.discountPrice && product.discountPrice < product.price;
            const isOutOfStock = product.stock <= 0;
            const inCartCount = items.find((i) => i.productId === product.id)?.quantity || 0;
            const isJustAdded = justAddedId === product.id;
            const displayName = language === 'fr' && product.nameFr ? product.nameFr : (language === 'en' && product.nameEn ? product.nameEn : product.name);
            const displayDesc = language === 'fr' && product.descriptionFr ? product.descriptionFr : (language === 'en' && product.descriptionEn ? product.descriptionEn : product.description);
            const allImages = [product.imageUrl, ...(product.additionalImages || [])].filter(Boolean);

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between group"
              >
                {/* Image & Gallery trigger */}
                <div 
                  onClick={() => allImages.length > 0 && setSelectedGalleryProduct(product)}
                  className={`relative aspect-square overflow-hidden bg-slate-100 flex items-center justify-center ${allImages.length > 0 ? 'cursor-pointer' : ''}`}
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={displayName}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-center p-4 text-slate-400 flex flex-col items-center justify-center gap-2">
                      <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                      <span className="text-xs font-bold text-slate-500">لا توجد صورة لهذا المنتج</span>
                    </div>
                  )}

                  {allImages.length > 1 && (
                    <span className="absolute top-3 start-3 px-2 py-0.5 bg-black/60 text-white text-[10px] font-bold rounded-md backdrop-blur-xs">
                      📷 {allImages.length} صور
                    </span>
                  )}

                  {hasDiscount && (
                    <span className="absolute top-3 end-3 px-2.5 py-1 bg-rose-500 text-white text-xs font-black rounded-lg shadow-sm">
                      تخفيض
                    </span>
                  )}

                  {isOutOfStock ? (
                    <span className="absolute bottom-3 start-3 px-2.5 py-1 bg-slate-900/80 text-white text-xs font-bold rounded-lg backdrop-blur-xs">
                      {t('outOfStock')}
                    </span>
                  ) : (
                    <span className="absolute bottom-3 start-3 px-2 py-0.5 bg-emerald-700/80 text-white text-[10px] font-bold rounded-md backdrop-blur-xs">
                      متوفر ({product.stock})
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base line-clamp-2 mb-1.5" title={displayName}>
                      {displayName}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                      {displayDesc}
                    </p>
                  </div>

                  <div>
                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-xl font-black text-emerald-700">
                        {hasDiscount ? product.discountPrice : product.price} {t('currency')}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-slate-400 line-through">
                          {product.price} {t('currency')}
                        </span>
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                        isOutOfStock
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : isJustAdded
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-900 hover:bg-emerald-600 text-white shadow-sm hover:shadow-md'
                      }`}
                    >
                      {isJustAdded ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-200" />
                          <span>تمت الإضافة للسلة</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>{t('addToCart')}</span>
                          {inCartCount > 0 && (
                            <span className="ms-1 px-1.5 py-0.2 bg-emerald-500 text-white text-[11px] rounded-full">
                              ({inCartCount})
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating cart quick bar if items exist */}
      {items.length > 0 && (
        <div className="sticky bottom-4 z-30 max-w-lg mx-auto bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-slate-700 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center font-bold">
              {items.reduce((s, i) => s + i.quantity, 0)}
            </div>
            <div>
              <p className="text-xs text-slate-400">سلة المشتريات</p>
              <p className="text-sm font-black text-white">
                {items.reduce((s, i) => s + i.price * i.quantity, 0)} {t('currency')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('cart')}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            إتمام الطلب الآن
          </button>
        </div>
      )}

      {/* Multi-Photo Zoom Gallery Modal */}
      {selectedGalleryProduct && (() => {
        const images = [selectedGalleryProduct.imageUrl, ...(selectedGalleryProduct.additionalImages || [])].filter(Boolean);
        const curImg = images[activeGalleryIndex] || images[0];

        return (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-4 sm:p-6 text-white space-y-4 shadow-2xl flex flex-col max-h-[92vh]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="truncate">
                  <h3 className="font-black text-base sm:text-lg truncate">{selectedGalleryProduct.name}</h3>
                  <span className="text-xs text-slate-400">
                    صورة {activeGalleryIndex + 1} من {images.length}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedGalleryProduct(null);
                    setActiveGalleryIndex(0);
                  }}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-300" />
                </button>
              </div>

              {/* Main Zoom Display */}
              <div className="relative flex-1 min-h-[280px] sm:min-h-[420px] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center p-2">
                <img
                  src={curImg}
                  alt={selectedGalleryProduct.name}
                  className="max-h-[60vh] max-w-full object-contain rounded-lg transition-transform duration-200"
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveGalleryIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                      className="absolute start-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-6 h-6 rtl:rotate-180" />
                    </button>
                    <button
                      onClick={() => setActiveGalleryIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                      className="absolute end-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails strip */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none justify-center">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveGalleryIndex(idx)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        activeGalleryIndex === idx
                          ? 'border-emerald-500 scale-105 shadow-md'
                          : 'border-slate-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

    </div>
  );
};
