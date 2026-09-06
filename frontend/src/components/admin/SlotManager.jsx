import React, { useState } from 'react';
import { api } from '../../services/api';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Sliders,
  Car,
  Zap,
  Shield,
  AlertOctagon
} from 'lucide-react';

export const SlotManager = ({ slots, onRefresh }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSlot, setNewSlot] = useState({
    slotNumber: '',
    floor: 'Floor 1',
    type: 'regular',
    hourlyRate: 40,
    distanceToEntrance: 20,
    distanceToElevator: 15
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddSlot = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.createSlot(newSlot);
      if (res.success) {
        setShowAddModal(false);
        setNewSlot({
          slotNumber: '',
          floor: 'Floor 1',
          type: 'regular',
          hourlyRate: 40,
          distanceToEntrance: 20,
          distanceToElevator: 15
        });
        if (onRefresh) onRefresh();
      } else {
        setError(res.message || 'Failed to add slot.');
      }
    } catch (err) {
      setError(err.message || 'Error creating slot.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId, slotNumber) => {
    if (!window.confirm(`Are you sure you want to delete slot ${slotNumber}?`)) return;
    try {
      const res = await api.deleteSlot(slotId);
      if (res.success && onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to delete slot: ' + err.message);
    }
  };

  return (
    <div className="rounded-3xl glass-panel p-6 space-y-5 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-500" />
            <span>Facility Bay Management</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Provision, modify, or decommission smart parking bays and configure dynamic rates
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Parking Bay</span>
        </button>
      </div>

      {/* Slots Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 uppercase font-bold tracking-wider">
            <tr>
              <th className="p-3.5">Bay Code</th>
              <th className="p-3.5">Floor Level</th>
              <th className="p-3.5">Designated Type</th>
              <th className="p-3.5">Live Status</th>
              <th className="p-3.5">Hourly Rate</th>
              <th className="p-3.5">Current Occupant</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {slots.map((s) => (
              <tr key={s._id || s.slotNumber} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="p-3.5 font-mono font-extrabold text-slate-900 dark:text-white">
                  {s.slotNumber}
                </td>
                <td className="p-3.5 text-slate-600 dark:text-slate-300 font-medium">
                  {s.floor}
                </td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {s.type}
                  </span>
                </td>
                <td className="p-3.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      s.status === 'available'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : s.status === 'occupied'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        s.status === 'available'
                          ? 'bg-emerald-500'
                          : s.status === 'occupied'
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                      }`}
                    />
                    {s.status}
                  </span>
                </td>
                <td className="p-3.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                  ₹{s.hourlyRate}/hr
                </td>
                <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">
                  {s.currentVehicle || '—'}
                </td>
                <td className="p-3.5 text-right">
                  <button
                    onClick={() => handleDeleteSlot(s._id || s.slotNumber, s.slotNumber)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    title="Delete Slot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Create New Parking Slot
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSlot} className="p-6 space-y-4 text-xs">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-600 font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Slot Identifier (Code)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. D-01 or EV-05"
                  value={newSlot.slotNumber}
                  onChange={(e) => setNewSlot({ ...newSlot, slotNumber: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold uppercase text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Floor Level
                  </label>
                  <select
                    value={newSlot.floor}
                    onChange={(e) => setNewSlot({ ...newSlot, floor: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="Floor 1">Floor 1</option>
                    <option value="Floor 2">Floor 2</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Designated Type
                  </label>
                  <select
                    value={newSlot.type}
                    onChange={(e) => setNewSlot({ ...newSlot, type: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="regular">Standard Car</option>
                    <option value="ev">EV Fast Charging</option>
                    <option value="women_safety">Women's Safety</option>
                    <option value="emergency">Emergency Services</option>
                    <option value="handicap">Accessible / PwD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Hourly Rate (INR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newSlot.hourlyRate}
                  onChange={(e) => setNewSlot({ ...newSlot, hourlyRate: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Distance to Entrance (m)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newSlot.distanceToEntrance}
                    onChange={(e) => setNewSlot({ ...newSlot, distanceToEntrance: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Distance to Elevator (m)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newSlot.distanceToElevator}
                    onChange={(e) => setNewSlot({ ...newSlot, distanceToElevator: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all"
              >
                {loading ? 'Creating Slot...' : 'Save & Register Slot'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
