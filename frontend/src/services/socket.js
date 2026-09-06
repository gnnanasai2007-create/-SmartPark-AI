import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : '/'
);

export const socket = io(SOCKET_URL, {
  autoConnect: typeof window !== 'undefined' && window.location.hostname === 'localhost',
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
  timeout: 5000
});
