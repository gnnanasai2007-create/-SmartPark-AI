import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { SlotGrid } from '../components/parking/SlotGrid';
import { NearestSlotFinder } from '../components/parking/NearestSlotFinder';
import { PredictiveAvailability } from '../components/ai/PredictiveAvailability';
import { ReservationModal } from '../components/booking/ReservationModal';

export const LiveSlots = ({ onBookingCreated }) => {
  const { lastSlotUpdate } = useSocket();
  const [slots, setSlots] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState('Floor 1');
  const [selectedSlotForReservation, setSelectedSlotForReservation] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSlots = async () => {
    try {
      const res = await api.getSlots();
      if (res.success) {
        setSlots(res.slots);
      }
    } catch (e) {
      console.error('Failed to load slots:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  // Update specific slot in local state when WebSocket notification arrives
  useEffect(() => {
    if (lastSlotUpdate) {
      setSlots(prev => prev.map(s => {
        if (s._id === lastSlotUpdate._id || s.slotNumber === lastSlotUpdate.slotNumber) {
          return { ...s, ...lastSlotUpdate };
        }
        return s;
      }));
    }
  }, [lastSlotUpdate]);

  const handleToggleStatus = async (slot) => {
    try {
      await api.toggleSlot(slot._id || slot.slotNumber);
      fetchSlots();
    } catch (e) {
      console.error('Toggle error:', e);
    }
  };

  return (
    <div className="space-y-8 py-4 animate-fadeIn">
      {/* AI Smart Slot Finder Bar */}
      <NearestSlotFinder
        currentFloor={selectedFloor}
        onSelectSlot={(slot) => setSelectedSlotForReservation(slot)}
      />

      {/* AI Predictive Hourly Forecast */}
      <PredictiveAvailability />

      {/* Main Interactive Slot Grid */}
      <SlotGrid
        slots={slots}
        selectedFloor={selectedFloor}
        setSelectedFloor={setSelectedFloor}
        onReserve={(slot) => setSelectedSlotForReservation(slot)}
        onToggleStatus={handleToggleStatus}
      />

      {/* Reservation Modal */}
      {selectedSlotForReservation && (
        <ReservationModal
          isOpen={!!selectedSlotForReservation}
          slot={selectedSlotForReservation}
          onClose={() => setSelectedSlotForReservation(null)}
          onBookingSuccess={(booking) => {
            fetchSlots();
            if (onBookingCreated) onBookingCreated(booking);
          }}
        />
      )}
    </div>
  );
};
