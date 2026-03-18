import { useEffect, useRef } from 'react';
import { connectSocket, getSocket } from './socket';

const useSocket = (token) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    socketRef.current = connectSocket(token);
  }, [token]);

  return socketRef.current || getSocket();
};

export default useSocket;
