import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { useNotifications } from '@/context/NotificationContext';

/**
 * Connects to the Socket.IO server and maps incoming events
 * to notifications in the global store.
 *
 * Mount this hook once inside <App> or a top-level layout.
 */
export const useSocketNotifications = () => {
  const { addNotification } = useNotifications();

  useEffect(() => {
    const socket = getSocket();

    // Booking events
    socket.on('booking:new', (data: { bookingId: number; packageTitle: string }) => {
      addNotification({
        type: 'info',
        title: 'New Booking',
        message: `Booking #${data.bookingId} received for "${data.packageTitle}"`,
        link: '/bookings',
      });
    });

    socket.on('booking:approved', (data: { bookingId: number }) => {
      addNotification({
        type: 'success',
        title: 'Booking Approved',
        message: `Booking #${data.bookingId} has been approved.`,
        link: '/bookings',
      });
    });

    socket.on('booking:cancelled', (data: { bookingId: number }) => {
      addNotification({
        type: 'error',
        title: 'Booking Cancelled',
        message: `Booking #${data.bookingId} was cancelled.`,
        link: '/bookings',
      });
    });

    // Payment events
    socket.on('payment:received', (data: { bookingId: number; amount: number }) => {
      addNotification({
        type: 'success',
        title: 'Payment Received',
        message: `Payment of $${data.amount.toFixed(2)} received for booking #${data.bookingId}`,
        link: '/bookings',
      });
    });

    // System events
    socket.on('system:alert', (data: { message: string }) => {
      addNotification({
        type: 'warning',
        title: 'System Alert',
        message: data.message,
      });
    });

    return () => {
      socket.off('booking:new');
      socket.off('booking:approved');
      socket.off('booking:cancelled');
      socket.off('payment:received');
      socket.off('system:alert');
    };
  }, [addNotification]);
};
