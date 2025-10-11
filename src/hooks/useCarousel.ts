// src/hooks/useCarousel.ts

import { useState, useMemo } from "react";

/**
 * Custom hook for managing carousel state and logic.
 * @param dataArray The array of items (movies, promotions, etc.)
 * @param itemsPerSlide The number of items to show per slide.
 * @returns An object containing: currentIndex, totalSlides, nextSlide, prevSlide, and the items for the current slide.
 */
export const useCarousel = <T>(dataArray: T[] = [], itemsPerSlide: number) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Tính tổng số slides cần thiết
  const totalSlides = useMemo(() => {
    if (dataArray.length === 0) return 0;
    return Math.ceil(dataArray.length / itemsPerSlide);
  }, [dataArray.length, itemsPerSlide]);

  // Hàm chuyển slide tiếp theo
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  // Hàm chuyển slide trước đó
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };
  
  // Hàm chuyển đến slide cụ thể
  const goToSlide = (index: number) => {
    if (index >= 0 && index < totalSlides) {
        setCurrentIndex(index);
    }
  }

  // Lấy các item cho slide hiện tại
  const currentSlideItems = useMemo(() => {
    const startIndex = currentIndex * itemsPerSlide;
    const endIndex = startIndex + itemsPerSlide;
    return dataArray.slice(startIndex, endIndex);
  }, [dataArray, currentIndex, itemsPerSlide]);


  return {
    currentIndex,
    totalSlides,
    nextSlide,
    prevSlide,
    goToSlide,
    currentSlideItems
  };
};