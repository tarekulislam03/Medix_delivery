import React, { useRef, useState } from 'react';
import { Camera, Upload, X, FileCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PrescriptionCard() {
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
    <div className="bg-surface rounded-card shadow-card border border-gray-100 p-3 sm:p-3.5 transition-all">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload prescription file"
      />

      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-light flex items-center justify-center flex-shrink-0 text-brand-green">
            <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-brand-green" />
          </div>

          <div className="flex-1 min-w-0 pr-1">
            <h3 className="font-bold text-xs sm:text-sm text-ink truncate leading-tight">
              Have a prescription?
            </h3>
            <p className="text-[11px] sm:text-xs text-ink-light mt-0.5 leading-snug line-clamp-1">
              Upload and we'll arrange your medicines
            </p>
          </div>
        </div>

        {!previewUrl && (
          <motion.button
            type="button"
            onClick={triggerUpload}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="min-h-[40px] px-3.5 py-1.5 bg-brand-green hover:bg-brand-dark text-white text-xs font-semibold rounded-pill flex items-center justify-center gap-1.5 shadow-sm touch-manipulation flex-shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload</span>
          </motion.button>
        )}
      </div>

      {/* Thumbnail preview with remove button */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mt-2.5 pt-2.5 border-t border-gray-100 flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
                <img
                  src={previewUrl}
                  alt="Prescription preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1 text-xs font-medium text-brand-green">
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Prescription selected</span>
                </div>
                <p className="text-[10px] text-ink-lighter">Ready for ordering</p>
              </div>
            </div>

            <motion.button
              type="button"
              onClick={handleRemove}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center text-ink-light hover:text-red-600 rounded-full touch-manipulation"
              aria-label="Remove prescription"
            >
              <div className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-50 flex items-center justify-center">
                <X className="w-3.5 h-3.5 text-gray-500 hover:text-red-500" />
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
