import React, { useState, useRef, useContext } from 'react';
import styles from '../styles/InputArea.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faSmile, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import ChatContext from '../../../components/ChatContext';
import UserContext from '../../../components/UserContext';
import Picker from 'emoji-picker-react'; // Updated import

const InputArea = () => {
  const { messages, setMessages, messageStatus, setMessageStatus, selectedChat, pendingQueue, setPendingQueue } = useContext(ChatContext);
  const { userId } = useContext(UserContext);
  const [inputValue, setInputValue] = useState('');
  const [link, setLink] = useState('');
  const [linkType, setLinkType] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const textareaRef = useRef(null);

  const handleLinkSubmit = () => {
    setLinkType('image'); // Example type
    setShowLinkPopup(false);
  };

  const handleEmojiClick = (emoji) => {
    setInputValue((prev) => prev + emoji.emoji); // Insert emoji
    setCharacterCount((prev) => prev + emoji.emoji.length);
  };

  const handleTextChange = (e) => {
    setInputValue(e.target.value);
    setCharacterCount(e.target.value.length);
  };

  const handleTextAreaExpand = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 8 * 24); // Max 8 rows
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  const handleEmojiPickerToggle = () => {
    setShowEmojiPicker((prev) => !prev);
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

    console.log('Sending message');

    const newMessage = {
      id: Date.now().toString(),
      chat_id: selectedChat.id,
      content: inputValue.trim(),
      user_id: userId,
      status: 'pending',
      created_at: date.toISOString(),
    };

    // Добавляем сообщение в очередь на отправку
    setPendingQueue((prevQueue) => [...prevQueue, newMessage]);

    setMessageStatus((prevStatus) => ({
      ...prevStatus,
      [newMessage.id]: 'pending',
    }));

    setInputValue('');
    setCharacterCount(0);
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

  return (
    <div className={styles.inputArea}>
      <div className={styles.icon} onClick={handleLinkPopupToggle}>
        <FontAwesomeIcon icon={faPaperclip} />
      </div>
      {showLinkPopup && (
        <div className={styles.linkPopup}>
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
        placeholder="Написать сообщение..."
        value={inputValue}
        onChange={handleTextChange}
        onInput={handleTextAreaExpand}
        onKeyDown={handleKeyDown}
        maxLength="200"
      />
      <div className={styles.characterCount}>{characterCount}/200</div>
      <div className={styles.emojiWrapper}>
        <div
          className={styles.icon}
          onClick={handleEmojiPickerToggle}
        >
          <FontAwesomeIcon icon={faSmile} />
        </div>
        {showEmojiPicker && (
          <div className={styles.fullEmojiPicker}>
            <Picker onEmojiClick={handleEmojiClick} theme="dark" />
          </div>
        )}
      </div>
      <div className={styles.icon} onClick={handleSend}>
        <FontAwesomeIcon icon={faPaperPlane} />
      </div>
    </div>
  );
};

export default InputArea;
