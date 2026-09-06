import React, { createContext, useContext, useEffect, useState } from 'react';
import { socket } from '../services/socket';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastSlotUpdate, setLastSlotUpdate] = useState(null);
  const [lastOcrEvent, setLastOcrEvent] = useState(null);
  const [activeSosAlert, setActiveSosAlert] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const addNotification = (title, message, type = 'info') => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [{ id, title, message, type, time: new Date() }, ...prev.slice(0, 9)]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    const onSlotUpdated = (slot) => {
      setLastSlotUpdate(slot);
      if (slot.status === 'available') {
        addNotification(
          'Slot Available!',
          `Slot ${slot.slotNumber} (${slot.type.replace('_', ' ').toUpperCase()}) on ${slot.floor} is now free.`,
          'success'
        );
      }
    };

    const onOcrEvent = (log) => {
      setLastOcrEvent(log);
      addNotification(
        'Plate OCR Scan',
        `${log.plateNumber} detected at ${log.gate || 'Gate'} (${log.eventType.toUpperCase()})`,
        'info'
      );
    };

    const onSosAlert = (data) => {
      setActiveSosAlert(data.alert);
      addNotification(
        'EMERGENCY SOS ALERT!',
        `SOS triggered at Slot ${data.alert.slotNumber} (${data.alert.floor})! Security notified.`,
        'danger'
      );

      // Play emergency tone if audio allowed
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } catch (e) {
        // AudioContext restricted before gesture
      }
    };

    const onSosResolved = (alert) => {
      if (activeSosAlert && activeSosAlert.alertId === alert.alertId) {
        setActiveSosAlert(null);
      }
      addNotification('SOS Resolved', `Emergency alert at ${alert.slotNumber} marked resolved.`, 'success');
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('slot_updated', onSlotUpdated);
    socket.on('ocr_event', onOcrEvent);
    socket.on('sos_alert', onSosAlert);
    socket.on('sos_resolved', onSosResolved);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('slot_updated', onSlotUpdated);
      socket.off('ocr_event', onOcrEvent);
      socket.off('sos_alert', onSosAlert);
      socket.off('sos_resolved', onSosResolved);
    };
  }, [activeSosAlert]);

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        lastSlotUpdate,
        lastOcrEvent,
        activeSosAlert,
        setActiveSosAlert,
        notifications,
        addNotification,
        removeNotification
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
