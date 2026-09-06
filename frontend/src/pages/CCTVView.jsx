import React from 'react';
import { LiveCCTVMonitor } from '../components/ai/LiveCCTVMonitor';

export const CCTVView = () => {
  return (
    <div className="py-4 space-y-6">
      <LiveCCTVMonitor />
    </div>
  );
};
