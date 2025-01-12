import React, { useState, useEffect, useRef } from 'react';
import { IconButton, TextField, Button, Collapse } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { styled } from '@mui/material/styles';

// Styled components
const Container = styled('div')(({ theme }) => ({
  width: '350px',
  backgroundColor: '#333',
  color: '#fff',
  borderRadius: '8px',
  padding: '15px',
  position: 'relative',
  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
  transition: 'all 0.3s ease',
}));

const Header = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const MicButton = styled(IconButton)(({ theme, active }) => ({
  color: active ? 'green' : '#fff',
}));

const TextContainer = styled('div')({
  flexGrow: 1,
  marginLeft: '10px',
  fontSize: '16px',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  textOverflow: 'ellipsis',
});

const CollapseContent = styled('div')({
  marginTop: '10px',
  padding: '10px',
  borderTop: '1px solid #444',

});

const SendButton = styled(Button)({
  marginTop: '10px',
});

const CustomTextField = styled(TextField)({
  overflowY: 'auto',
});

const SpeechComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [recognizer, setRecognizer] = useState(null);
  const commandDetected = useRef(false);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'ru-RU';
      recognition.interimResults = true;
      recognition.continuous = true;
      setRecognizer(recognition);

      recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            setFinalTranscript(prev => prev + event.results[i][0].transcript);
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        setTranscript(interimTranscript);

        if (interimTranscript.toLowerCase().includes('привет')) {
          commandDetected.current = true;
        }

        if (commandDetected.current) {
          setFinalTranscript(prev => prev + interimTranscript);
        }
      };

      recognition.onend = () => {
        if (commandDetected.current) {
          alert(finalTranscript.trim());
        }
        setTranscript('');
        setFinalTranscript('');
        commandDetected.current = false;
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };
    } else {
      console.warn('Speech recognition not supported');
    }
  }, []);

  const handleMicClick = () => {
    if (recognizer) {
      if (isListening) {
        recognizer.stop();
      } else {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(() => {
            recognizer.start();
            setIsListening(true);
          })
          .catch((err) => {
            console.error('Microphone access denied', err);
          });
      }
    }
  };

  const handleArrowClick = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (event) => {
    setTranscript(event.target.value);
  };

  const handleSendClick = () => {
    alert(transcript.trim());
    setTranscript('');
  };

  const getDisplayedText = () => {
    if (finalTranscript.length > 50) {
      return `...${finalTranscript.slice(-50)}`;
    }
    return finalTranscript || 'ИИ Синкин\nспросите меня о чём угодно!';
  };

  return (
    <Container>
      <Header>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <MicButton onClick={handleMicClick} active={isListening}>
            <FontAwesomeIcon icon={faMicrophone} />
          </MicButton>
          <TextContainer title={finalTranscript || 'ИИ Синкин'}>
            {finalTranscript ? (finalTranscript.length > 50 ? `...${finalTranscript.slice(-50)}` : finalTranscript) : 'ИИ Синкин\nспросите меня о чём угодно!'}
          </TextContainer>
        </div>
        <IconButton onClick={handleArrowClick}>
          <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
        </IconButton>
      </Header>
      <Collapse in={isOpen}>
        <CollapseContent>
          <CustomTextField
            variant="outlined"
            fullWidth
            value={transcript}
            onChange={handleInputChange}
            placeholder="Введите текст..."
            multiline
          />
          <SendButton
            variant="contained"
            color="primary"
            onClick={handleSendClick}
          >
            Отправить
          </SendButton>
        </CollapseContent>
      </Collapse>
    </Container>
  );
};

export default SpeechComponent;