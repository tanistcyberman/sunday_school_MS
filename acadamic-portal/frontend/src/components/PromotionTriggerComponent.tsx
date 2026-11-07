import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../services/api';
import { ShieldAlert, UserCheck, AlertTriangle, CheckCircle, X, Loader2 } from 'lucide-react';

interface PromotionTriggerProps {
  gradeLevel?: number;
  onCompleted?: () => void;
}

export const PromotionTriggerComponent: React.FC<PromotionTriggerProps> = ({ gradeLevel, onCompleted }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleOpen = () => {
    setResult(null);
    setIsOpen(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await adminApi.executePromotion(gradeLevel);
      setResult(res);
      if (onCompleted) {
        onCompleted();
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Promotion execution failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-navy-900 to-navy-800 text-gold-400 border border-gold-500/50 hover:border-gold-400 hover:text-gold-300 shadow-md hover:shadow-lg transition-all font-bold text-sm tracking-wide"
      >
        <UserCheck className="w-4 h-4 text-gold-500" />
        <span>{t('admin.promotion.triggerBtn')}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
            
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {!result ? (
              <div>
                <div className="w-14 h-14 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-amber-600 mb-4 mx-auto">
                  <ShieldAlert className="w-8 h-8" />
                </div>

                <h3 className="text-xl font-bold text-navy-950 text-center mb-2">
                  {t('admin.promotion.modalTitle')}
                </h3>

                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-sm mb-6 flex gap-3 items-start">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p>{t('admin.promotion.modalWarning')}</p>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={loading}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors"
                  >
                    {t('admin.promotion.cancel')}
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-900 text-gold-400 hover:bg-navy-800 font-bold text-sm shadow hover:shadow-md transition-all border border-gold-500/40"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin text-gold-400" />}
                    <span>{t('admin.promotion.confirm')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-2">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-emerald-600 mb-4 mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>

                <h3 className="text-xl font-bold text-navy-950 mb-2">
                  {t('admin.promotion.successTitle')}
                </h3>

                <div className="grid grid-cols-3 gap-3 my-6 text-center">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="block text-2xl font-black text-emerald-700">{result.promotedCount}</span>
                    <span className="text-xs font-semibold text-emerald-800">{t('admin.promotion.promotedCount')}</span>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <span className="block text-2xl font-black text-blue-700">{result.graduatedCount}</span>
                    <span className="text-xs font-semibold text-blue-800">{t('admin.promotion.graduatedCount')}</span>
                  </div>

                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                    <span className="block text-2xl font-black text-rose-700">{result.retainedCount}</span>
                    <span className="text-xs font-semibold text-rose-800">{t('admin.promotion.retainedCount')}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-navy-900 text-gold-400 font-bold hover:bg-navy-800 transition-colors"
                >
                  OK
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
};
