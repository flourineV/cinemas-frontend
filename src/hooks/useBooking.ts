import { useState, useEffect } from 'react';
import type { Booking } from '../types';
import { bookingService } from '../services/api';

export const useBooking = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const bookingData = await bookingService.getBookings();
      setBookings(bookingData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const newBooking = await bookingService.createBooking(bookingData);
      setBookings(prev => [newBooking, ...prev]);
      return newBooking;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await bookingService.cancelBooking(bookingId);
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'Cancelled' as const }
            : booking
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return {
    bookings,
    loading,
    error,
    createBooking,
    cancelBooking,
    refetch: fetchBookings,
  };
};
