import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBannerCarousel } from "@/hooks/useBannerCarousel";

interface BannerCarouselProps {
  images: string[];
  autoPlayInterval?: number;
}

export default function BannerCarousel({
  images,
  autoPlayInterval = 5000,
}: BannerCarouselProps) {
  const {
    currentIndex: bannerIndex,
    prevSlide: prevBanner,
    nextSlide: nextBanner,
  } = useBannerCarousel(images.length, autoPlayInterval);

  return (
    <div className="relative w-full">
      <section className="-mt-4 w-full max-w-5xl mx-auto aspect-[32/13] overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out h-full"
          style={{ transform: `translateX(-${bannerIndex * 100}%)` }}
        >
          {images.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`Slide ${idx}`}
              className="min-w-full h-full object-cover"
            />
          ))}
        </div>
      </section>
      <button
        onClick={prevBanner}
        className="absolute left-40 top-1/2 -translate-y-1/2 p-2 z-10 text-white hidden sm:block focus:outline-none"
      >
        <ChevronLeft size={44} />
      </button>
      <button
        onClick={nextBanner}
        className="absolute right-40 top-1/2 -translate-y-1/2 p-2 z-10 text-white hidden sm:block focus:outline-none"
      >
        <ChevronRight size={44} />
      </button>
    </div>
  );
}
