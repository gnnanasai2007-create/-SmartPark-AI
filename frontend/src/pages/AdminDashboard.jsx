import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AnalyticsDashboard } from '../components/admin/AnalyticsDashboard';
import { SlotManager } from '../components/admin/SlotManager';

export const AdminDashboard = () => {
  const [slots, setSlots] = useState([]);

  const fetchSlots = async () => {
    try {
      const res = await api.getSlots();
      if (res.success) setSlots(res.slots);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  return (
    <div className="py-4 space-y-8 animate-fadeIn">
      {/* Analytics telemetry */}
      <AnalyticsDashboard />

      {/* Slot Management CRUD */}
      <SlotManager slots={slots} onRefresh={fetchSlots} />
    </div>
  );
};
