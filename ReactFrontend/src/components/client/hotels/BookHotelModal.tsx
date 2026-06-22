import React, { useState, useMemo } from 'react';
import { X, Calendar, CheckCircle, AlertCircle, Loader, Hotel } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createHotelBooking, createHotelBookingRoom, type HotelMasterDTO, type RoomDetailDTO } from '@/hooks/useHotels';

const BASE_URL = 'http://localhost:5246';

interface BookHotelModalProps {
  hotel: HotelMasterDTO;
  selectedRoomKey?: string | null;
  onClose: () => void;
}

const BookHotelModal: React.FC<BookHotelModalProps> = ({ hotel, selectedRoomKey, onClose }) => {
  const navigate = useNavigate();
  const userId = Number(localStorage.getItem('userId') ?? 0);
  const token  = localStorage.getItem('token');

  const [checkIn, setCheckIn]   = useState(() => { const d = new Date(); return d.toISOString().split('T')[0]; });
  const [checkOut, setCheckOut] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; });
  const [roomQuantities, setRoomQuantities] = useState<Record<string, number>>(
    selectedRoomKey ? { [selectedRoomKey]: 1 } : {}
  );
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // Group and split rooms dynamically by room view
  const splitRooms = useMemo(() => {
    const result: Array<RoomDetailDTO & { virtualRoomView?: string | null }> = [];
    hotel.rooms.forEach(room => {
      const unitsByView: Record<string, typeof room.roomUnits> = {};
      room.roomUnits?.forEach(unit => {
        const view = unit.roomView || 'Standard';
        if (!unitsByView[view]) {
          unitsByView[view] = [];
        }
        unitsByView[view].push(unit);
      });
      const views = Object.keys(unitsByView);
      if (views.length <= 1) {
        result.push({
          ...room,
          virtualRoomView: views[0] !== 'Standard' ? views[0] : null
        });
      } else {
        views.forEach(view => {
          const units = unitsByView[view];
          const activeUnitsCount = units.filter(u => u.isAvailable).length;
          result.push({
            ...room,
            virtualRoomView: view !== 'Standard' ? view : null,
            totalUnits: activeUnitsCount,
            roomUnits: units,
          });
        });
      }
    });
    return result;
  }, [hotel.rooms]);

  // Calculate totals
  const { totalRooms, totalNights, fareTotal } = useMemo(() => {
    let nights = 0;
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end   = new Date(checkOut);
      nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
    }

    let roomsCount = 0;
    let totalFare = 0;

    splitRooms.forEach(room => {
      const key = `${room.roomId}_${room.virtualRoomView || 'Standard'}`;
      const q = roomQuantities[key] || 0;
      if (q > 0) {
        roomsCount += q;
        totalFare += q * room.pricePerNight * Math.max(1, nights);
      }
    });

    return { totalRooms: roomsCount, totalNights: nights, fareTotal: totalFare };
  }, [checkIn, checkOut, roomQuantities, splitRooms]);

  const handleQuantityChange = (roomKey: string, delta: number) => {
    setRoomQuantities(prev => {
      const current = prev[roomKey] || 0;
      const next = Math.max(0, current + delta);
      const updated = { ...prev };
      if (next === 0) {
        delete updated[roomKey];
      } else {
        updated[roomKey] = next;
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !userId) {
      toast.error('Please sign in to make a booking.');
      return;
    }
    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates.');
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      toast.error('Check-out date must be after check-in date.');
      return;
    }
    if (totalRooms === 0) {
      toast.error('Please select at least one room.');
      return;
    }

    setLoading(true);
    try {
      // 1. Create main booking
      const bookingData = await createHotelBooking({
        clientID: userId,
        hotelID: hotel.hotelId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        fareTotal: fareTotal,
        bookingStatus: 'Pending',
        paymentStatus: 'Unpaid'
      });

      // 2. Create room entries
      const bookingId = bookingData.hotelBookingID || bookingData.hotelBookingId || bookingData.id;
      
      if (!bookingId) throw new Error("Could not retrieve booking ID from response.");
      
      const roomPromises = splitRooms
        .filter(room => {
          const key = `${room.roomId}_${room.virtualRoomView || 'Standard'}`;
          return (roomQuantities[key] || 0) > 0;
        })
        .map(room => {
          const key = `${room.roomId}_${room.virtualRoomView || 'Standard'}`;
          return createHotelBookingRoom({
            bookingId: bookingId,
            roomId: room.roomId,
            quantity: roomQuantities[key],
            unitPrice: room.pricePerNight,
            roomView: room.virtualRoomView || 'Standard'
          });
        });

      await Promise.all(roomPromises);

      toast.success('Hotel booked successfully!');
      onClose();
      navigate(`/payment/hotel/${bookingId}`);
    } catch {
      toast.error('Failed to book hotel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 shrink-0 flex items-start justify-between"
          style={{ background: 'linear-gradient(135deg,#000269 0%,#001a99 100%)' }}>
          <div>
            <p className="text-yellow-400 text-xs font-semibold uppercase tracking-wider mb-1">Book Your Stay</p>
            <h2 className="text-white font-bold text-xl leading-snug">{hotel.hotelName}</h2>
          </div>
          <button onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 shrink-0 ml-3">
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="p-10 flex-1 overflow-y-auto flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
              style={{ backgroundColor: '#d1fae5' }}>
              <CheckCircle size={40} className="text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--brand-navy)' }}>Booking Confirmed!</h3>
            <p className="text-slate-500 mb-8 max-w-sm">
              Your rooms at <strong>{hotel.hotelName}</strong> have been reserved successfully.
              You will receive an email confirmation shortly.
            </p>
            <button onClick={onClose} className="btn-brand px-10 py-3.5 rounded-xl text-base font-bold">
              Done
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row min-h-0">
            {/* Form Left Side */}
            <div className="p-6 flex-1 space-y-6 lg:border-r border-slate-100">
              {!token && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  You must <a href="/login" className="font-bold underline">sign in</a> to book.
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
                    Check In *
                  </label>
                  <input
                    type="date" required min={today} value={checkIn}
                    onChange={e => setCheckIn(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-yellow-400"
                    style={{ color: 'var(--brand-navy)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
                    Check Out *
                  </label>
                  <input
                    type="date" required min={checkIn || today} value={checkOut}
                    onChange={e => setCheckOut(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-yellow-400"
                    style={{ color: 'var(--brand-navy)' }}
                  />
                </div>
              </div>

              {/* Room Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">
                  Select Rooms *
                </label>
                <div className="space-y-3">
                  {splitRooms.length === 0 && (
                    <p className="text-sm text-red-500 italic">No rooms available currently.</p>
                  )}
                  {splitRooms.map((room, idx) => {
                    const roomKey = `${room.roomId}_${room.virtualRoomView || 'Standard'}`;
                    let availableUnits = room.totalUnits || 1;
                    if (!room.isAvailable) {
                      availableUnits = 0;
                    } else if (checkIn && checkOut) {
                      const inDate = new Date(checkIn).getTime();
                      const outDate = new Date(checkOut).getTime();
                      if (room.bookedDates && room.bookedDates.length > 0) {
                        let bookedCount = 0;
                        for (const b of room.bookedDates) {
                          const bookedView = b.roomView || 'Standard';
                          const currentView = room.virtualRoomView || 'Standard';
                          if (bookedView === currentView) {
                            const bIn = new Date(b.checkIn).getTime();
                            const bOut = new Date(b.checkOut).getTime();
                            if (inDate < bOut && outDate > bIn) {
                              bookedCount += b.quantity || 1;
                            }
                          }
                        }
                        availableUnits = Math.max(0, availableUnits - bookedCount);
                      }
                    }

                    const q = roomQuantities[roomKey] || 0;
                    const isAvailableForDates = availableUnits > 0;
                    
                    return (
                      <div key={idx} className={`flex items-center justify-between p-4 border-2 rounded-2xl transition-all ${isAvailableForDates ? 'border-slate-100 bg-slate-50/70 hover:border-blue-200' : 'border-red-100 bg-red-50/40 opacity-75'}`}>
                        <div className="flex-1 pr-3">
                          <span className="font-bold text-base line-clamp-1 flex flex-wrap items-center gap-2" style={{ color: 'var(--brand-navy)' }}>
                            {room.roomTypeName || 'Standard Room'}
                            {room.virtualRoomView && (
                              <span className="inline-flex items-center text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                                {room.virtualRoomView} View
                              </span>
                            )}
                          </span>
                          <p className="text-xs text-slate-500 mt-1 mb-1.5 flex items-center gap-2">
                            <span className="font-semibold text-slate-700">৳{room.pricePerNight.toLocaleString()}</span> / night • Max {room.maxGuest} guests
                          </p>
                          {isAvailableForDates ? (
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full inline-block mt-0.5">
                              {availableUnits} {availableUnits === 1 ? 'room' : 'rooms'} available
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-red-500 bg-red-100 px-2.5 py-0.5 rounded-full inline-block mt-0.5">
                              {!room.isAvailable ? 'Not Available' : 'Sold out for these dates'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0 bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm">
                          <button type="button" onClick={() => handleQuantityChange(roomKey, -1)} disabled={q === 0 || !isAvailableForDates}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 font-bold text-lg disabled:opacity-30 transition-colors">
                            −
                          </button>
                          <span className="w-6 text-center font-bold text-base" style={{ color: 'var(--brand-navy)' }}>{q}</span>
                          <button type="button" onClick={() => handleQuantityChange(roomKey, 1)} disabled={q >= availableUnits || !isAvailableForDates}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 font-bold text-lg disabled:opacity-30 transition-colors">
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Summary Right Side */}
            <div className="p-6 lg:w-72 bg-slate-50 flex flex-col shrink-0">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-4">Summary</h3>
              
              <div className="space-y-3 text-sm flex-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nights</span>
                  <span className="font-semibold" style={{ color: 'var(--brand-navy)' }}>{totalNights || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rooms</span>
                  <span className="font-semibold" style={{ color: 'var(--brand-navy)' }}>{totalRooms || '-'}</span>
                </div>
                
                <div className="border-t border-slate-200 pt-3 mt-2">
                  {splitRooms.map(r => {
                    const roomKey = `${r.roomId}_${r.virtualRoomView || 'Standard'}`;
                    const q = roomQuantities[roomKey] || 0;
                    if (q === 0) return null;
                    const displayName = r.roomTypeName || 'Standard Room';
                    const viewSuffix = r.virtualRoomView ? ` (${r.virtualRoomView} View)` : '';
                    return (
                      <div key={roomKey} className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500 line-clamp-1 pr-2">{q}x {displayName}{viewSuffix}</span>
                        <span className="font-medium whitespace-nowrap" style={{ color: 'var(--brand-navy)' }}>
                          ৳{(q * r.pricePerNight * Math.max(1, totalNights)).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t-2 border-slate-200 pt-4 mt-4">
                <div className="flex justify-between items-end mb-5">
                  <span className="font-bold" style={{ color: 'var(--brand-navy)' }}>Total</span>
                  <span className="text-2xl font-bold" style={{ color: 'var(--brand-navy)' }}>
                    ৳{fareTotal.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading || !token || totalRooms === 0 || !checkIn || !checkOut}
                  className="btn-brand w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? <Loader size={16} className="animate-spin" /> : <Hotel size={16} />}
                  {loading ? 'Processing...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookHotelModal;
