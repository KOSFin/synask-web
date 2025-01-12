import React, { useState, useRef, useContext, useEffect } from 'react';
import styles from '../styles/InputArea.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faSmile, faPaperPlane, faReply, faKeyboard, faQuestionCircle, faArrowCircleDown, faArrowCircleUp  } from '@fortawesome/free-solid-svg-icons';
import ChatContext from '../../../components/ChatContext';
import UserContext from '../../../components/UserContext';
import Picker from 'emoji-picker-react';
import MessengerSettingsContext from '../../../components/contexts/MessengerSettingsContext';
import chroma from 'chroma-js';

const InputArea = () => {
  const { messages, setMessages, messageStatus, setMessageStatus, selectedChat, pendingQueue, setPendingQueue, replyTo, setReplyTo } = useContext(ChatContext);
  const { colorMessage } = useContext(MessengerSettingsContext);
  const { userId } = useContext(UserContext);
  const [inputValue, setInputValue] = useState('');
  const [link, setLink] = useState('');
  const [linkType, setLinkType] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const textareaRef = useRef(null);
  const isMobile = window.innerWidth <= 768;
  const [emojiPickerHeight, setEmojiPickerHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isOpenFullEmoji, setIsOpenFullEmoji] = useState(false);
  const [initialWindowHeight, setInitialWindowHeight] = useState(window.innerHeight);

  const lighterColor = chroma(colorMessage).luminance() < 0.05 ? '#a0a0a0' : chroma(colorMessage).brighten(1).hex();

  const handleLinkSubmit = () => {
    setLinkType('image'); // Example type
    setShowLinkPopup(false);
  };

  const handleEmojiClick = (emoji) => {
    setInputValue((prev) => prev + emoji.emoji);
    setCharacterCount((prev) => prev + emoji.emoji.length);
  };

  const handleTextChange = (e) => {
    setInputValue(e.target.value);
    setCharacterCount(e.target.value.length);
  };

  const handleTextAreaExpand = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '20px';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 6 * 24); // Max 8 rows
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  const handleLinkPopupToggle = () => {
    setShowLinkPopup((prev) => !prev);
  };

  const handleSend = async () => {
    if (!selectedChat?.id || !userId || inputValue.trim() === '') {
      console.error('Error: Chat ID, User ID, or empty message');
      return;
    }

    const date = new Date();
    if (isNaN(date.getTime())) {
      console.error('Error: Invalid date');
      return;
    }

    const newMessage = {
      id: Date.now().toString(),
      chat_id: selectedChat.id,
      content: inputValue.trim(),
      user_id: userId,
      status: 'pending',
      created_at: date.toISOString(),
      reply_to: replyTo || null
    };

    setPendingQueue((prevQueue) => [...prevQueue, newMessage]);

    setMessageStatus((prevStatus) => ({
      ...prevStatus,
      [newMessage.id]: 'pending',
    }));

    setInputValue('');
    setCharacterCount(0);
    setReplyTo(null); // Clear reply state after sending message
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        e.preventDefault();
        setInputValue((prev) => prev + '\n');
      } else {
        e.preventDefault();
        handleSend();
      }
    }
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  const replyMessage = messages.find(msg => msg.id === replyTo);
  const userInfo = replyMessage ? selectedChat.membersInfo.find(member => member.auth_id === replyMessage.user_id) : null;
  const replyUserName = userInfo ? `${userInfo.first_name} ${userInfo.last_name}` : 'Удалённый пользователь'; // Replace with actual username if possible
  const replyText = replyMessage ? replyMessage.content : '';

  const handleKeyboardToggle = () => {
    setIsKeyboardOpen(true);
    setEmojiPickerHeight(keyboardHeight);
    setShowEmojiPicker(true);
  };

  const handleEmojiPickerToggle = () => {
    setIsKeyboardOpen(false);
    setShowEmojiPicker(true);
    setEmojiPickerHeight(keyboardHeight);
  };

  const handleEmojiPickerFull = () => {
    if (showEmojiPicker && isOpenFullEmoji) {
      setIsOpenFullEmoji(false);
      setEmojiPickerHeight(keyboardHeight);
    } else {
      setIsOpenFullEmoji(true);
      setEmojiPickerHeight(window.innerHeight * 0.8);
    }
  };

  const handleOutsideClick = (e) => {
    const emojiPickerElement = document.querySelector(`.${styles.fullEmojiPicker}`);
    const emojiInputAreaElement = document.querySelector(`.${styles.inputArea}`);
    if (
      textareaRef.current &&
      !textareaRef.current.contains(e.target) &&
      emojiPickerElement &&
      !emojiPickerElement.contains(e.target) &&
      emojiInputAreaElement &&
      !emojiInputAreaElement.contains(e.target)
    ) {
      setIsKeyboardOpen(false);
      setShowEmojiPicker(false);
      setEmojiPickerHeight(0);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    // Обновляем первоначальную высоту окна
    const updateInitialHeight = () => {
      setInitialWindowHeight(window.innerHeight);
    };

    // Округление до десятков в большую сторону
    const roundToNextTen = (value) => Math.ceil(value / 10) * 10;

    // Android: обработка через событие resize
    const handleResize = () => {
      const currentHeight = window.innerHeight;
      if (currentHeight < initialWindowHeight) {
        const keyboardHeightCt = initialWindowHeight - currentHeight;
        if (keyboardHeightCt >= 150) { // Если высота клавиатуры больше 150px
          //setKeyboardHeight(roundToNextTen(keyboardHeightCt));
          setKeyboardHeight(keyboardHeightCt);
        }
      } else {
        // Клавиатура скрыта, не обновляем состояние
      }
    };

    // iOS: обработка через VisualViewport
    const handleVisualViewport = () => {
      if (window.visualViewport) {
        const onViewportResize = () => {
          const viewportHeight = window.visualViewport.height;
          const keyboardHeightCt = initialWindowHeight - viewportHeight;
          if (keyboardHeightCt > 150) { // Если высота клавиатуры больше 150px
            //setKeyboardHeight(roundToNextTen(keyboardHeightCt));
            setKeyboardHeight(keyboardHeightCt);
          } else {
            // Клавиатура скрыта, не обновляем состояние
          }
        };

        window.visualViewport.addEventListener('resize', onViewportResize);

        return () => {
          window.visualViewport.removeEventListener('resize', onViewportResize);
        };
      }
    };

    // Инициализация обработчиков
    const init = () => {
      const textarea = textareaRef.current;

      const onFocus = () => {
        if (window.visualViewport) {
          handleVisualViewport();
        } else {
          window.addEventListener('resize', handleResize);
        }
      };

      textarea?.addEventListener('focus', onFocus);

      // Обновляем начальную высоту окна
      updateInitialHeight();
      window.addEventListener('resize', updateInitialHeight);

      // Очистка обработчиков при размонтировании
      return () => {
        textarea?.removeEventListener('focus', onFocus);
        window.removeEventListener('resize', updateInitialHeight);
      };
    };

    // Запуск
    init();
  }, []);


  return (
  <>
    {replyTo && replyMessage && (
      <div className={styles.replyBlock} style={{ marginBottom: isMobile ? emojiPickerHeight : '0' }}>
        <FontAwesomeIcon style={{ color:'white', marginRight: '10px', height: '30px'}}icon={faReply} />
        <div className={styles.replyInfo}>
          <div className={styles.replyUserName} style={{ color: colorMessage }}>В ответ {replyUserName}</div>
          <div className={styles.replyText}>{replyText}</div>
        </div>
        <div className={styles.cancelReply} onClick={handleCancelReply}>
          &times;
        </div>
      </div>
    )}
    <div className={styles.inputArea} style={{ marginBottom: isMobile ? emojiPickerHeight : 0 }}>
      <div className={styles.icon} onClick={handleLinkPopupToggle}>
        <FontAwesomeIcon style={{ color: lighterColor }}icon={faPaperclip} />
      </div>
      {showLinkPopup && (
        <div className={styles.linkPopup}>
          <div>{keyboardHeight}</div>
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Enter link (max 100 chars)"
            maxLength="100"
          />
          <button onClick={handleLinkSubmit}>Attach Link</button>
          {linkType && (
            <div className={styles.linkPreview}>
              <div className={styles.previewIcon}>{/* Placeholder for preview */}</div>
              <div className={styles.previewLink}>{link}</div>
              <div className={styles.previewType}>{linkType}</div>
              <button className={styles.removeLink} onClick={() => setLink('')}>Remove</button>
            </div>
          )}
        </div>
      )}
      <textarea
        ref={textareaRef}
        className={styles.messageArea}
        placeholder="Написать сообщение..."
        value={inputValue}
        onChange={handleTextChange}
        onInput={handleTextAreaExpand}
        onKeyDown={handleKeyDown}
        maxLength="200"
        onFocus={() => handleKeyboardToggle()}
      />
      <div className={styles.characterCount}>{characterCount}/200</div>
      <div className={styles.emojiWrapper}>
        <div
          className={styles.icon}
        >
          {keyboardHeight ? (
            <FontAwesomeIcon
              style={{ color: lighterColor }}
              icon={!isKeyboardOpen && showEmojiPicker ? (isOpenFullEmoji ? faArrowCircleDown : faArrowCircleUp) : faSmile}
              onClick={!isKeyboardOpen && showEmojiPicker ? handleEmojiPickerFull : handleEmojiPickerToggle}
            />
          ) : (
            <FontAwesomeIcon
              style={{ color: lighterColor }}
              icon={faQuestionCircle}
              onClick={() => alert('Откройте клавиатуру, чтобы начать пользование смайлами в любое время.')}
            />
          )}
        </div>
        {showEmojiPicker && !isMobile && (
          <div className={styles.fullEmojiPicker}>
            <Picker autoFocusSearch={false} onEmojiClick={handleEmojiClick} theme="dark" native />
          </div>
        )}
      </div>
      {inputValue.trim()!== '' && (
      <div className={styles.icon} onClick={handleSend}>
        <FontAwesomeIcon style={{ color: lighterColor }} icon={faPaperPlane} />
      </div>
      )}
    </div>
    {showEmojiPicker && isMobile && (
      <div className={`${styles.fullEmojiPicker} ${styles.mobile}`} style={{ position: 'initial', display: 'block', height: emojiPickerHeight}}>
        <Picker autoFocusSearch={false} width="100%" height="100%" onEmojiClick={handleEmojiClick} theme="dark" previewConfig={{ showPreview: false }} native className={styles.emojiPickerComponent} />
      </div>
    )}
  </>
  );
};

export default InputArea;
