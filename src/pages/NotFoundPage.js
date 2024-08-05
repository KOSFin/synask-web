import React from 'react';
import { Link } from 'react-router-dom';
//import notFoundImage from 'error_search-image.png'; // Убедитесь, что путь к изображению корректен
import styles from './NotFound.module.css';

const NotFoundPage = () => {
    return (
        <div className={styles.notFoundContainer}>
            <h1 className={styles.title}>Страница или пользователь не найдены</h1>
            <img src='404NotFound.png' alt="404 Not Found" className={styles.image} />
            <p className={styles.text}>
                Мы прошерстили каждый уголок, но так и не смогли найти то, что вы искали.
                Возможно, страница была перемещена или удалена, или пользователь не существует.
            </p>
            <Link to="/" className={styles.homeLink}>Вернуться на главную</Link>
        </div>
    );
};

export default NotFoundPage;
