import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from './PostEditor.module.css';
import getSupabaseClient from '../config/SupabaseClient';

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

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files).slice(0, 4 - media.length);
    const uploadedFiles = files.map((file) => ({ file, url: URL.createObjectURL(file), progress: 0 }));
    setMedia((prev) => [...prev, ...uploadedFiles]);
  };

  const handleLinkUpload = (link) => {
    if (link) {
      setMedia((prev) => [...prev, { url: link, progress: 100 }]);
    }
  };

  const submitPost = async () => {
      if (loading) return;
      setLoading(true);
      setUploadStatus([]);

      // Initialize newPost with "media" as an object containing an empty array
      const newPost = {
        organization_id: organizationId,
        content: editorValue,
        tags,
        members: authors.map((author) => author.auth_id),
        media: { media: [] },
      };

      for (const [index, mediaItem] of media.entries()) {
        if (!mediaItem.url.startsWith('http')) {
          const formData = new FormData();
          formData.append('file', mediaItem.file);
          formData.append('upload_preset', 'oin3peby');

          try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/dzwltrnir/upload`, {
              method: 'POST',
              body: formData,
            });

            const data = await response.json();
            if (data.secure_url) {
              // Push the URL into the array within the "media" object
              newPost.media.media.push(data.secure_url);
              setUploadStatus((prev) => [...prev, `Загрузка ${index + 1} завершена ✔️`]);
            }
          } catch (error) {
            console.error("Ошибка загрузки файла:", error);
          }
        } else {
          // If it's an external link, add it directly
          newPost.media.media.push(mediaItem.url);
        }
      }

      const { error } = await supabase.from('posts').insert(newPost);
      setLoading(false);

      if (!error) {
        setEditorValue('');
        setTags([]);
        setAuthors([]);
        setMedia([]);
        setMediaUrls([]);
        onClose();
      } else {
        console.error(error.message);
      }
  };

  return (
    <div className={styles.editorContainer}>
      <div className={styles.header}>
        <h2>Новый пост</h2>
        <FontAwesomeIcon icon={faTimes} className={styles.closeIcon} onClick={onClose} />
      </div>
      <ReactQuill
        ref={quillRef}
        value={editorValue}
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
        placeholder="Введите текст здесь..."
      />

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
        <input type="file" multiple accept="image/*,video/*" onChange={handleFileUpload} />
        <input
          type="text"
          placeholder="Вставьте ссылку на медиа"
          onKeyDown={(e) => e.key === 'Enter' && handleLinkUpload(e.target.value)}
        />
        <div className={styles.mediaList}>
          {media.map((file, index) => (
            <div key={index} className={styles.mediaItem}>
              <img src={file.url} alt="preview" className={styles.thumbnail} />
              <span>{file.progress}%</span>
              <button onClick={() => setMedia(media.filter((_, i) => i !== index))}>Удалить</button>
            </div>
          ))}
        </div>
      </div>

      <button onClick={submitPost} disabled={loading} className={styles.submitButton}>
        {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : "Опубликовать"}
      </button>

      <div className={styles.logStatus}>
        {uploadStatus.map((status, idx) => <p key={idx}>{status}</p>)}
      </div>
    </div>
  );
};

export default PostEditor;
