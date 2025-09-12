import { useState } from 'react';
import type { SelectedSeat } from '../types';

export const useSeatSelection = (maxSeats: number = 10) => {
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);

  const selectSeat = (seat: SelectedSeat) => {
    setSelectedSeats(prev => {
      // Check if seat is already selected
      const isSelected = prev.some(s => s.seatId === seat.seatId);
      
      if (isSelected) {
        // Remove seat if already selected
        return prev.filter(s => s.seatId !== seat.seatId);
      } else {
        // Add seat if under limit
        if (prev.length < maxSeats) {
          return [...prev, seat];
        }
        return prev;
      }
    });
  };

  const removeSeat = (seatId: string) => {
    setSelectedSeats(prev => prev.filter(s => s.seatId !== seatId));
  };

  const clearSelection = () => {
    setSelectedSeats([]);
  };

  const getTotalPrice = () => {
    return selectedSeats.reduce((total, seat) => total + seat.price, 0);
  };

  const isSeatSelected = (seatId: string) => {
    return selectedSeats.some(s => s.seatId === seatId);
  };

  return {
    selectedSeats,
    selectSeat,
    removeSeat,
    clearSelection,
    getTotalPrice,
    isSeatSelected,
    seatCount: selectedSeats.length,
    canSelectMore: selectedSeats.length < maxSeats,
  };
};
