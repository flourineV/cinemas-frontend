import { useState } from "react";
import ReactDOM from "react-dom";

interface TrailerModalProps {
  trailerUrl: string;   // link trailer YouTube từ API
  buttonLabel?: string; // text nút, mặc định là "Trailer"
}

export default function TrailerModal({ trailerUrl, buttonLabel = "Trailer" }: TrailerModalProps) {
  const [open, setOpen] = useState(false);

  if (!trailerUrl) {
    return null; // Hoặc return <></> để không hiển thị component
  }

  // Convert link watch?v=... → embed/...
  const embedUrl = trailerUrl.includes("watch?v=")
    ? trailerUrl.replace("watch?v=", "embed/")
    : trailerUrl;

 const modalContent = (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]"
      onClick={() => setOpen(false)} // click ra ngoài để đóng
    >
      <div
        className="relative w-[95%] md:w-[80%] lg:w-[70%] aspect-video bg-black rounded-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()} // tránh đóng khi click vào iframe
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
        {/* Nút đóng */}
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
      {/* Nút mở trailer */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center border border-white/50 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors hover:bg-white/10 w-1/2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5 mr-1"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.969 12l-3.328 2.5a.75.75 0 01-1.141-.645V10.145a.75.75 0 011.141-.645l3.328 2.5z"
          />
        </svg>
        {buttonLabel}
      </button>

      {open && ReactDOM.createPortal(modalContent, document.body)}
    </>
  );
}
