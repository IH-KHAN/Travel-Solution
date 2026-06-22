import api from '@/lib/api';

/**
 * Updates a Tour Booking paymentStatus to 'Paid'.
 * This is the "simulate payment success" call.
 */
export const payTourBooking = async (bookingId: number): Promise<void> => {
  await api.patch(`/Bookings/${bookingId}/pay`, {});
};

/**
 * Updates a Hotel Booking bookingStatus to 'Paid'.
 */
export const payHotelBooking = async (bookingId: number): Promise<void> => {
  await api.patch(`/HotelBookings/${bookingId}/pay`, {});
};
