import { useState } from "react";
import ReactDOM from "react-dom";

interface TrailerModalForDetailProps {
  trailerUrl: string;
  buttonLabel?: string; // có thể bỏ trống
  icon?: React.ReactNode; // icon truyền vào
  className?: string; // class thêm tùy chỉnh
}

export default function TrailerModalForDetail({
  trailerUrl,
  buttonLabel = "",
  icon,
  className = "",
}: TrailerModalForDetailProps) {
  const [open, setOpen] = useState(false);

  if (!trailerUrl) return null;

  const embedUrl = trailerUrl.includes("watch?v=")
    ? trailerUrl.replace("watch?v=", "embed/")
    : trailerUrl;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]"
      onClick={() => setOpen(false)}
    >
      <div
        className="relative w-[95%] md:w-[80%] lg:w-[70%] aspect-video bg-black rounded-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          width="100%"
          height="100%"
          src={`${embedUrl}?autoplay=1`}
          title="YouTube trailer"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
        <button
          onClick={() => setOpen(false)}
          className="absolute top-2 right-2 text-white bg-black/60 rounded-full p-2 hover:bg-black/80"
        >
          ✕
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center justify-center text-white text-sm font-semibold py-2 px-3 transition-colors hover:text-yellow-700 ${className}`}
      >
        {icon}
        {buttonLabel && <span className="ml-1">{buttonLabel}</span>}
      </button>

      {open && ReactDOM.createPortal(modalContent, document.body)}
    </>
  );
}
