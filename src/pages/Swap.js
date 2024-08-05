import React, { useState, useEffect } from 'react';

const NfcComponent = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if ('NDEFReader' in window) {
      const ndef = new window.NDEFReader();

      const scanNFC = async () => {
        try {
          await ndef.scan();
          addLog("NFC сканирование началось успешно.");

          ndef.addEventListener("reading", event => {
            const decoder = new TextDecoder();
            for (const record of event.message.records) {
              const logMessage = `Тип записи: ${record.recordType}, MIME тип: ${record.mediaType}, Данные: ${decoder.decode(record.data)}`;
              addLog(logMessage);
            }
          });
        } catch (error) {
          addLog(`Ошибка: ${error}`);
        }
      };

      scanNFC();
    } else {
      addLog("Web NFC не поддерживается.");
    }
  }, []);

  const addLog = (message) => {
    setLogs(prevLogs => [...prevLogs, message]);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Tap NFC Tag</h1>
      <div style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', color: 'white'}}>
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
    </div>
  );
};

export default NfcComponent;
