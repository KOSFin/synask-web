import React, { useState, useRef, useEffect } from 'react';
import SimplePeer from 'simple-peer';

const VoiceChat = ({ signalingServerUrl }) => {
  const [peer, setPeer] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const signalingSocketRef = useRef(null);

  useEffect(() => {
    // Получаем доступ к микрофону
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current.srcObject = stream;

        // Настраиваем сокет для сигнального сервера
        const socket = new WebSocket(signalingServerUrl);
        signalingSocketRef.current = socket;

        socket.onmessage = (message) => {
          const data = JSON.parse(message.data);
          if (data.signal && peer) {
            peer.signal(data.signal);
          }
        };

        // Создаем WebRTC соединение при звонке
        const p = new SimplePeer({
          initiator: isCalling,
          trickle: false,
          stream: stream
        });

        p.on('signal', signal => {
          socket.send(JSON.stringify({ signal }));
        });

        p.on('stream', remoteStream => {
          remoteStreamRef.current.srcObject = remoteStream;
        });

        p.on('connect', () => {
          setIsConnected(true);
        });

        p.on('close', () => {
          setIsConnected(false);
          cleanupPeer();
        });

        setPeer(p);
      } catch (err) {
        console.error("Error accessing media devices.", err);
      }
    };

    initMedia();

    return () => {
      cleanupPeer();
      if (signalingSocketRef.current) signalingSocketRef.current.close();
    };
  }, [isCalling]);

  const cleanupPeer = () => {
    if (peer) {
      peer.destroy();
      setPeer(null);
    }
  };

  const startCall = () => {
    setIsCalling(true);
  };

  const stopCall = () => {
    cleanupPeer();
    setIsCalling(false);
    setIsConnected(false);
  };

  return (
    <div>
      <h2>Voice Chat</h2>
      <div>
        <audio ref={localStreamRef} autoPlay muted />
        <audio ref={remoteStreamRef} autoPlay />
      </div>
      {!isConnected ? (
        <button onClick={startCall}>Start Call</button>
      ) : (
        <button onClick={stopCall}>End Call</button>
      )}
    </div>
  );
};

export default VoiceChat;
