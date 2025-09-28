// src/hooks/useBannerCarousel.ts

import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for a simple, full-width, auto-sliding carousel (banner).
 * * @param imagesLength The number of items in the carousel (e.g., images.length).
 * @param interval The delay in milliseconds for the auto-slide feature (default: 4000ms).
 * @returns An object containing the current slide index and functions to navigate.
 */
export const useBannerCarousel = (
    imagesLength: number, 
    interval: number = 5000
) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev === imagesLength - 1 ? 0 : prev + 1));
    }, [imagesLength]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev === 0 ? imagesLength - 1 : prev - 1));
    }, [imagesLength]);

    // Chức năng chuyển slide tự động
    useEffect(() => {
        if (imagesLength > 1) { // Chỉ bật auto-slide nếu có nhiều hơn 1 ảnh
            const timer = setInterval(() => {
                nextSlide();
            }, interval);
            
            // Cleanup function để xóa timer khi component unmount hoặc dependencies thay đổi
            return () => clearInterval(timer);
        }
    }, [imagesLength, interval, nextSlide]); // nextSlide đã được memoize với useCallback

    const goToSlide = (index: number) => {
        if (index >= 0 && index < imagesLength) {
            setCurrentIndex(index);
        }
    };

    return {
        currentIndex,
        prevSlide,
        nextSlide,
        goToSlide,
    };
};