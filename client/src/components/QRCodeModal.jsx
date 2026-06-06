import { motion, AnimatePresence } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";

export default function QRCodeModal({ link, onClose }) {
  if (!link) return null;

  const url = link.originalUrl;

  return (
    <AnimatePresence>
      {link && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="relative rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-2 top-2 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              aria-label="Close QR"
            >
              ✕
            </button>

            <QRCodeCanvas
              id="clickpilot-qr"
              value={url}
              size={220}
              includeMargin
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
