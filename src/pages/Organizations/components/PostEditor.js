import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner, faArrowLeft, faPaperclip, faLink } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/PostEditor.module.css';
import getSupabaseClient from '../../config/SupabaseClient';
import '../styles/quill-editor.css';

const supabase = getSupabaseClient();

const PostEditor = ({ organizationId, onClose }) => {
  const quillRef = useRef(null);
  const [editorValue, setEditorValue] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [media, setMedia] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [authorInput, setAuthorInput] = useState('');
  const [authorList, setAuthorList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState([]);
  const [mediaUrls, setMediaUrls] = useState([]);
  const [mediaUploadMenuVisible, setMediaUploadMenuVisible] = useState(false);
  const [linkInputVisible, setLinkInputVisible] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalSteps, setModalSteps] = useState([]);
  const [postCreated, setPostCreated] = useState(false);
  const [mediaUploadModalVisible, setMediaUploadModalVisible] = useState(false);
  const [mediaUploadMethod, setMediaUploadMethod] = useState(null); // 'link' или 'device'
  const MAX_MEDIA_FROM_DEVICE = 2;
  const MAX_MEDIA_FROM_LINK = 2;
  const MAX_MEDIA_LINK_ONLY = 6;


  const handleTextChange = (value) => setEditorValue(value);

  useEffect(() => {
    const fetchAuthorData = async () => {
      const { data, error } = await supabase
        .from('users_public_information')
        .select('id, auth_id, first_name, last_name, avatar_url, username');
      if (data) setAuthorList(data);
      if (error) console.error(error.message);
    };
    fetchAuthorData();
  }, []);

  const handleTagKeyPress = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      if (tagInput) {
        setTags((prev) => [...prev, tagInput.trim()]);
        setTagInput('');
      }
    }
  };

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleAuthorKeyPress = async (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      const authorId = authorInput.trim();
      if (authorId) {
        const { data, error } = await supabase
          .from('users_public_information')
          .select('auth_id, first_name, last_name, avatar_url, username')
          .eq('id', authorId)
          .single();
        if (data) {
          setAuthors((prev) => [
            ...prev,
            {
              auth_id: data.auth_id,
              first_name: data.first_name,
              last_name: data.last_name,
              avatar_url: data.avatar_url,
              username: data.username,
            },
          ]);
          setAuthorInput('');
        } else if (error) {
          console.error('Ошибка получения данных автора:', error.message);
        }
      }
    }
  };

  const removeAuthor = (index) => {
    setAuthors(authors.filter((_, i) => i !== index));
  };

  const toggleMediaUploadMenu = () => {
    setMediaUploadModalVisible(true);
    setMediaUploadMethod(null);
  };

  const handleMediaUploadMethod = (method) => {
    setMediaUploadMethod(method);
  };

  const handleLinkUpload = () => {
    if (linkInput) {
        const mediaFromDeviceCount = media.filter(item => item.file).length;
        const mediaFromLinkCount = media.filter(item => item.url).length;

        if (mediaFromDeviceCount >= MAX_MEDIA_FROM_DEVICE) {
            if (mediaFromLinkCount >= MAX_MEDIA_FROM_LINK) {
                alert('Вы можете прикрепить не более 2 медиа по ссылке.');
                return;
            }
        } else {
            if (mediaFromLinkCount >= MAX_MEDIA_LINK_ONLY) {
                alert('Вы можете прикрепить не более 6 медиа по ссылке.');
                return;
            }
        }

        setMedia((prev) => [...prev, { url: linkInput, progress: 100 }]);
        setLinkInput(''); // Очищаем поле ввода после добавления
        setMediaUploadModalVisible(false); // Закрываем модальное окно после добавления
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        if (media.filter(item => item.file).length >= MAX_MEDIA_FROM_DEVICE) {
            alert('Вы можете прикрепить не более 2 медиа с устройства.');
            return;
        }
        setSelectedFile(file);
        setMedia((prev) => [...prev, { file, url: URL.createObjectURL(file), progress: 0 }]);
        setMediaUploadModalVisible(false); // Закрываем модальное окно после выбора файла
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
        setSelectedFile(file);
        setMedia((prev) => [...prev, { file, url: URL.createObjectURL(file), progress: 0 }]);
        setMediaUploadModalVisible(false); // Закрываем модальное окно после перетаскивания файла
    }
  };

  const submitPost = async () => {
    setModalVisible(true);
    setModalSteps([]);
    setPostCreated(false);
    setLoading(true);
  
    // Форматирование текста
    const formattedContent = editorValue
      .trim() // Удаляем пробелы в начале и конце
      .replace(/\s+/g, ' ') // Заменяем несколько пробелов на один
      .replace(/\n+/g, '\n'); // Заменяем несколько новых строк на одну

    // Проверка на пустой пост
    if (!formattedContent) {
        setLoading(false);
        console.error('Пост не может быть пустым');
        return;
    }

    const newPost = {
      organization_id: organizationId,
      content: formattedContent,
      tags,
      members: authors.map((author) => author.auth_id),
      media: { media: [] },
    };
  
    try {
      // Загрузка медиа
      const mediaUrls = await Promise.all(
        media.map(async (mediaItem, index) => {
          if (!mediaItem.url.startsWith('http')) {
            const formData = new FormData();
            formData.append('file', mediaItem.file);
            formData.append('upload_preset', 'oin3peby');
  
            const response = await fetch(`https://api.cloudinary.com/v1_1/dzwltrnir/upload`, {
              method: 'POST',
              body: formData,
            });
  
            if (!response.ok) {
              throw new Error(`Ошибка загрузки медиа ${index + 1}`);
            }
  
            const data = await response.json();
            setModalSteps((prev) => [...prev, { text: `Загрузка медиа ${index + 1}`, completed: true }]);
            return data.secure_url;
          } else {
            setModalSteps((prev) => [...prev, { text: `Загрузка медиа ${index + 1}`, completed: true }]);
            return mediaItem.url;
          }
        })
      );
  
      // Загрузка файла (если выбран)
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('upload_preset', 'oin3peby');
  
        const response = await fetch(`https://api.cloudinary.com/v1_1/dzwltrnir/upload`, {
          method: 'POST',
          body: formData,
        });
  
        if (!response.ok) {
          throw new Error('Ошибка загрузки файла');
        }
  
        const data = await response.json();
        setModalSteps((prev) => [...prev, { text: 'Загрузка файла', completed: true }]);
        mediaUrls.push(data.secure_url);
      }
  
      // Формируем пост с загруженными медиа
      newPost.media.media = mediaUrls;
  
      // Отправка поста
      const { error } = await supabase.from('posts').insert(newPost);
      setLoading(false);
  
      if (!error) {
        setModalSteps((prev) => [...prev, { text: 'Отправка поста', completed: true }]);
        setPostCreated(true);
        setTimeout(() => {
          onClose();
          setModalVisible(false);
        }, 2000);
      } else {
        console.error(error.message);
      }
    } catch (error) {
      setLoading(false);
      console.error(error.message);
    }
  };
  

  return (
    <div className={styles.editorContainer}>
      <div className={styles.overlayHeader}>
        <FontAwesomeIcon icon={faArrowLeft} className={styles.backIcon} onClick={onClose} />
        <h3 className={styles.headerTitle}>Новый пост</h3>
        <button onClick={submitPost} disabled={loading} className={styles.publishButton}>
          {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : "Опубликовать"}
        </button>
      </div>
      <ReactQuill
          ref={quillRef}
          value={editorValue}
          theme="snow"
          onChange={handleTextChange}
          modules={{
            toolbar: {
              container: [
                [{ 'header': '1' }, { 'header': '2' }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['bold', 'italic', 'underline', 'blockquote'],
                [{ 'color': [] }, { 'background': [] }],
                ['link'],
                [{ 'align': [] }],
                ['clean'],
              ],
            },
          }}
          placeholder="Напишите здесь что-то интересное..."
          className="ReactQuill"
          style={{ color: 'white', backgroundColor: 'transparent' }}
      />

      {/* Модальное окно для загрузки */}
      {modalVisible && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Создание поста</h2>
            <p>Не закрывайте сайт до завершения процесса.</p>
            {modalSteps.map((step, index) => (
              <div key={index} className={styles.modalStep}>
                <span>{step.completed ? '✔️' : '🔄'} {step.text}</span>
                {step.completed && <span className={styles.progress}>{uploadProgress.toFixed(0)}%</span>}
              </div>
            ))}
            {loading && <FontAwesomeIcon icon={faSpinner} spin />}
            {postCreated && <div className={styles.postCreated}>Пост создан!</div>}
            <button className={styles.closeModal} onClick={() => setModalVisible(false)}>✖️</button>
          </div>
        </div>
      )}

      {mediaUploadModalVisible && (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
                <h2>{mediaUploadMethod === 'link' ? 'Введите ссылку' : 'Как прикрепить?'}</h2>
                <button className={styles.closeModal} onClick={() => setMediaUploadModalVisible(false)} style={{ color: 'white' }}>✖️</button>
                {mediaUploadMethod === null ? (
                    <div>
                        <button onClick={() => handleMediaUploadMethod('link')} className={styles.mediaButton}>
                            <FontAwesomeIcon icon={faLink} /> Через ссылку
                        </button>
                        <button onClick={() => handleMediaUploadMethod('device')} className={styles.mediaButton}>
                            <FontAwesomeIcon icon={faPaperclip} /> С устройства
                        </button>
                    </div>
                ) : mediaUploadMethod === 'link' ? (
                    <div>
                        <input
                            type="text"
                            placeholder="Введите ссылку"
                            className={styles.linkInput}
                            value={linkInput}
                            onChange={(e) => setLinkInput(e.target.value)}
                        />
                        <button onClick={handleLinkUpload} className={styles.linkUploadButton}>
                            <FontAwesomeIcon icon={faPaperclip} /> Добавить
                        </button>
                    </div>
                ) : (
                    <div>
                        <input type="file" accept="image/*,video/*" onChange={handleFileUpload} style={{ display: 'none' }} id="fileInput" />
                        <label htmlFor="fileInput" className={styles.fileUploadLabel}>
                            <div className={styles.fileUploadArea}>
                                Перетащите файл сюда или нажмите для выбора
                            </div>
                        </label>
                    </div>
                )}
            </div>
        </div>
      )}

      <div className={styles.etcContainer}>
        <div className={styles.tagInputContainer}>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyPress}
            placeholder="Введите тег и нажмите Enter..."
          />
          <div className={styles.tagList}>
            {tags.map((tag, index) => (
              <span key={index} className={styles.tag}>
                {tag} <button onClick={() => removeTag(index)}>×</button>
              </span>
            ))}
          </div>
        </div>

        <div className={styles.authorInputContainer}>
          <input
            type="text"
            value={authorInput}
            onChange={(e) => setAuthorInput(e.target.value)}
            onKeyDown={handleAuthorKeyPress}
            placeholder="Введите ID автора и нажмите Enter..."
          />
          <div className={styles.authorList}>
            {authors.map((author, index) => (
              <div key={index} className={styles.author}>
                <img src={author.avatar_url} alt="Avatar" className={styles.avatar} />
                <span>{author.first_name} {author.last_name} (@{author.username})</span>
                <button onClick={() => removeAuthor(index)}>×</button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.mediaUpload}>
          <button onClick={toggleMediaUploadMenu} className={styles.attachButton}>
            <FontAwesomeIcon icon={faPaperclip} /> Прикрепить фото/видео
          </button>
          {mediaUploadMenuVisible && (
            <div className={styles.mediaUploadMenu}>
              <button onClick={() => setLinkInputVisible(true)}>Вставить по ссылке</button>
              <input type="file" accept="image/*,video/*" onChange={handleFileUpload} />
            </div>
          )}
          <div className={styles.mediaList}>
            {media.map((file, index) => (
              <div key={index} className={styles.mediaItem}>
                <img src={file.url} alt="preview" className={styles.thumbnail} />
                <div className={styles.deleteIcon} onClick={() => setMedia(media.filter((_, i) => i !== index))}>
                  ✖️
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.logStatus}>
          {uploadStatus.map((status, idx) => <p key={idx}>{status}</p>)}
        </div>
      </div>
    </div>
  );
};

export default PostEditor;


