// cacheUtils.js

// Функция для получения размера IndexedDB
export const getIndexedDBSize = async () => {
    const dbs = await window.indexedDB.databases();
    let totalSize = 0;

    for (const db of dbs) {
        const request = indexedDB.open(db.name);
        totalSize += await new Promise((resolve) => {
            request.onsuccess = (event) => {
                const dbInstance = event.target.result;
                const transaction = dbInstance.transaction(db.objectStoreNames, 'readonly');
                let size = 0;

                transaction.objectStore(db.objectStoreNames[0]).openCursor().onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        size += JSON.stringify(cursor.value).length;
                        cursor.continue();
                    } else {
                        resolve(size / (1024 * 1024)); // возвращаем размер в МБ
                    }
                };
            };
        });
    }
    return totalSize;
};

// Функция для получения размера Local Storage
export const getLocalStorageSize = () => {
    let totalSize = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            const value = localStorage.getItem(key);
            totalSize += key.length + value.length;
        }
    }
    return totalSize / (1024 * 1024); // возвращаем размер в МБ
};

// Функция для очистки Local Storage
export const clearLocalStorage = (categories) => {
    return new Promise((resolve, reject) => {
        try {
            // Логика для очистки данных
            categories.forEach(category => {
                // Очистить категории из локального хранилища
                localStorage.removeItem(category);
            });
            resolve(100); // Например, возвращаем 100 MB освободившегося места
        } catch (error) {
            reject(error);
        }
    });
};
