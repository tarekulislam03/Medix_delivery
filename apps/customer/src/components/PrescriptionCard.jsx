import React, { useRef, useState } from 'react';
import { Camera, Upload, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useT } from '../lib/i18n';

export default function PrescriptionCard() {
  const t = useT();
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/[0.07] via-white to-white border border-emerald-600/15 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] select-none">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        aria-label={t('Upload prescription file')}
      />

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm sm:text-[15px] text-gray-900 tracking-tight leading-tight">
            {t('Upload prescription here')}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-1">
            {t("We'll deliver the medicines..")}
          </p>
        </div>

        {!previewUrl && (
          <motion.button
            type="button"
            onClick={triggerUpload}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', damping: 20, stiffness: 350 }}
            className="min-h-[38px] px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-full flex items-center justify-center gap-1.5 shadow-xs touch-manipulation shrink-0 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Upload</span>
          </motion.button>
        )}
      </div>

      {/* Uploaded Thumbnail Preview Card */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="overflow-hidden"
          >
            <div className="pt-3 border-t border-emerald-600/10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-black/10 bg-gray-100 shrink-0">
                  <img
                    src={previewUrl}
                    alt={t('Prescription preview')}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('Prescription attached')}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 truncate">{t('Will be verified by partner chemist')}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemove}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-90 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-all shrink-0 cursor-pointer"
                aria-label={t('Remove prescription')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
