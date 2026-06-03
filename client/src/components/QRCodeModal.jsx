import { motion, AnimatePresence } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { HiOutlineArrowDownTray, HiOutlineClipboard, HiOutlineShare } from "react-icons/hi2";
import { toast } from "react-toastify";

export default function QRCodeModal({ link, onClose }) {
  if (!link) return null;

  const url = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/links/${link.shortCode}`;

  const downloadQr = () => {
    const canvas = document.getElementById("clickpilot-qr");
    if (!canvas) return;
    const link_el = document.createElement("a");
    link_el.download = `${link.shortCode}-qr.png`;
    link_el.href = canvas.toDataURL("image/png");
    link_el.click();
    toast.success("QR code downloaded!");
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const shareUrl = () => {
    if (navigator.share) {
      navigator.share({
        title: "Check out my link",
        text: `Visit my shortened link: ${url}`,
        url: url,
      }).catch(() => {
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <AnimatePresence>
      {link ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            onClick={(e) => e.stopPropagation()}
            className="card w-full max-w-md p-6"
          >
            <h3 className="heading-lg">QR Code</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Scan to open your short URL instantly.</p>

            <div className="mt-5 flex justify-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white p-5">
              <QRCodeCanvas id="clickpilot-qr" value={url} size={220} includeMargin />
            </div>

            <p className="mt-4 truncate rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 text-sm">{url}</p>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <button onClick={downloadQr} type="button" className="btn-secondary text-xs">
                <HiOutlineArrowDownTray /> Download
              </button>
              <button onClick={copyUrl} type="button" className="btn-secondary text-xs">
                <HiOutlineClipboard /> Copy URL
              </button>
              <button onClick={shareUrl} type="button" className="btn-secondary text-xs">
                <HiOutlineShare /> Share
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
