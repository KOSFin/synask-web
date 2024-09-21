import React, { useState, useRef, useContext, useEffect } from 'react';
import styles from '../styles/InputArea.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faSmile, faPaperPlane, faReply } from '@fortawesome/free-solid-svg-icons';
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

  return (
  <>
      {replyTo && replyMessage && (
        <div className={styles.replyBlock}>
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
    <div className={styles.inputArea}>
      <div className={styles.icon} onClick={handleLinkPopupToggle}>
        <FontAwesomeIcon style={{ color: lighterColor }}icon={faPaperclip} />
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
          <FontAwesomeIcon style={{ color: lighterColor }} icon={faSmile} />
        </div>
        {showEmojiPicker && (
          <div className={styles.fullEmojiPicker}>
            <Picker onEmojiClick={handleEmojiClick} theme="dark" />
          </div>
        )}
      </div>
      {inputValue.trim()!== '' && (
      <div className={styles.icon} onClick={handleSend}>
        <FontAwesomeIcon style={{ color: lighterColor }} icon={faPaperPlane} />
      </div>
      )}
    </div>
  </>
  );
};

export default InputArea;
