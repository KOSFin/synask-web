import React, { useState, useEffect } from 'react';
import styles from './CacheManagement.module.css';
import { getIndexedDBSize, getLocalStorageSize, clearLocalStorage } from './cacheUtils'; // Функции для работы с кешем и локальным хранилищем
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

const CacheManagement = () => {
    const [dbSize, setDbSize] = useState(0);
    const [localStorageSize, setLocalStorageSize] = useState(0);
    const [showDialog, setShowDialog] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState({
        messages: true,
        media: { photos: true, videos: true, music: false },
        settings: true,
    });
    const [spaceToFree, setSpaceToFree] = useState(0);

    useEffect(() => {
        const fetchSizes = async () => {
            try {
                const dbSize = await getIndexedDBSize();
                const localStorageSize = await getLocalStorageSize();
                setDbSize(dbSize);
                setLocalStorageSize(localStorageSize);
            } catch (error) {
                console.error('Ошибка при получении размеров кеша:', error);
            }
        };
        fetchSizes();
    }, []);

    const handleCategoryChange = (category, subcategory = null) => {
        setSelectedCategories(prev => {
            const newState = { ...prev };
            if (subcategory) {
                newState[category][subcategory] = !newState[category][subcategory];
            } else {
                newState[category] = !newState[category];
            }
            return newState;
        });
    };

    const handleClear = () => {
        let itemsToClear = [];
        if (selectedCategories.messages) itemsToClear.push('messages');
        if (selectedCategories.media.photos) itemsToClear.push('photos');
        if (selectedCategories.media.videos) itemsToClear.push('videos');
        if (selectedCategories.media.music) itemsToClear.push('music');
        if (selectedCategories.settings) itemsToClear.push('settings');

        clearLocalStorage(itemsToClear).then(freedSpace => {
            setSpaceToFree(freedSpace);
            setShowDialog(true);
        }).catch(error => {
            console.error('Ошибка при очистке кеша:', error);
        });
    };

    const handleConfirmClear = () => {
        clearLocalStorage(['messages', 'photos', 'videos', 'music', 'settings']).then(() => {
            setShowDialog(false);
            // Обновите диаграмму и состояние
            window.location.reload();
        }).catch(error => {
            console.error('Ошибка при очистке кеша:', error);
        });
    };

    const handleCancelClear = () => {
        setShowDialog(false);
    };

    return (
        <div className={styles.container}>
            <h2>Управление данными</h2>
            <div className={styles.diagramContainer}>
                <CircularProgress
                    variant="determinate"
                    value={(dbSize / (dbSize + localStorageSize)) * 100}
                    className={styles.progress}
                />
                <div className={styles.info}>
                    <p><strong>IndexedDB:</strong> {dbSize} MB</p>
                    <p><strong>Локальное хранилище:</strong> {localStorageSize} MB</p>
                    <p><strong>Общее:</strong> {dbSize + localStorageSize} MB</p>
                </div>
            </div>

            <div className={styles.settings}>
                <div>
                    <input
                        type="checkbox"
                        checked={selectedCategories.messages}
                        onChange={() => handleCategoryChange('messages')}
                    />
                    <label>Сообщения</label>
                </div>
                <div>
                    <input
                        type="checkbox"
                        checked={selectedCategories.media.photos}
                        onChange={() => handleCategoryChange('media', 'photos')}
                    />
                    <label>Фотографии</label>
                </div>
                <div>
                    <input
                        type="checkbox"
                        checked={selectedCategories.media.videos}
                        onChange={() => handleCategoryChange('media', 'videos')}
                    />
                    <label>Видео</label>
                </div>
                <div>
                    <input
                        type="checkbox"
                        checked={selectedCategories.media.music}
                        onChange={() => handleCategoryChange('media', 'music')}
                    />
                    <label>Музыка</label>
                </div>
                <div>
                    <input
                        type="checkbox"
                        checked={selectedCategories.settings}
                        onChange={() => handleCategoryChange('settings')}
                    />
                    <label>Настройки персонализации</label>
                    {selectedCategories.settings && (
                        <p className={styles.warning}>Все настройки, связанные с персонализацией, будут удалены.</p>
                    )}
                </div>
                <p>Освободится {spaceToFree} MB при удалении выбранных категорий.</p>
                <button onClick={handleClear}>Очистить выбранные категории</button>
            </div>

            <Dialog open={showDialog} onClose={handleCancelClear}>
                <DialogTitle>Подтверждение удаления</DialogTitle>
                <DialogContent>
                    <p>Вы уверены, что хотите удалить выбранные категории?</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelClear}>Отмена</Button>
                    <Button onClick={handleConfirmClear}>Подтвердить</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default CacheManagement;
