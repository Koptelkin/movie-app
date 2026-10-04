import { getFilmById, getFilmFragmentsById } from "./api.js";
import { createFilmMeta, renderFilms } from "./render-films.js";

const back = document.querySelector('#back');
back.addEventListener('click', (event) => {
    event.preventDefault();
    window.history.back();
})

function renderFilmDescription(film) {
    const name = film.name || film.alternativeName || 'Без названия';
    document.title = name;

    const card = document.createElement('article');
    card.classList.add('search-item', 'search-film');

    // Создаём левую колонку с постером.
    const banner = document.createElement('div');
    banner.classList.add('search-film_banner');

    const poster = document.createElement('img');
    poster.classList.add('search-item_img');
    const posterUrl = film.poster?.url || film.poster?.previewUrl;

    if (posterUrl) {
        poster.src = posterUrl;
        poster.alt = `Постер: ${name}`;
    } else {
        poster.alt = `Нет постера: ${name}`;
    }
    banner.append(poster);

    // Создаём правую колонку с названием, кнопкой и рейтингами.
    const info = document.createElement('div');
    info.classList.add('search-item_info');

    const infoHeader = document.createElement('div');
    infoHeader.classList.add('search-item_info-div');

    const titleBlock = document.createElement('div');
    titleBlock.classList.add('search-item_info-title');

    const title = document.createElement('h1');
    title.textContent = name;

    const favoriteBtn = document.createElement('button');
    favoriteBtn.type = 'button';
    favoriteBtn.id = 'primary-btn';
    favoriteBtn.classList.add('btn');
    favoriteBtn.textContent = 'В избранное';

    const rating = document.createElement('div');
    rating.classList.add('movie-rating');

    const kp = document.createElement('span');
    kp.textContent = `Кинопоиск: ${film.rating?.kp ?? 'Нет оценки'}`;

    const imdb = document.createElement('span');
    imdb.textContent = `IMDb: ${film.rating?.imdb ?? 'Нет оценки'}`;

    rating.append(kp, document.createElement('br'), imdb);
    titleBlock.append(title, favoriteBtn, rating);
    infoHeader.append(titleBlock);

    // Создаём описание и список характеристик фильма.
    const description = document.createElement('p');
    description.classList.add('search-item_info_p');
    description.textContent = film.description || film.shortDescription || 'Описание отсутствует';

    const metaTitle = document.createElement('h2');
    metaTitle.textContent = 'О фильме';

    info.append(infoHeader, description, metaTitle, createFilmMeta(film, true));
    card.append(banner, info);

    return card;
}

// рендерим список кадров для фильма
function renderFilmFragments(fragments) {
    const fragmentsGrid = document.querySelector('.fragments-grid');
    fragmentsGrid.replaceChildren();

    if (fragments.length === 0) {
        fragmentsGrid.textContent = 'Кадры к этому фильму пока отсутствуют';
        return;
    }

    fragments.forEach(fragment => {
        const fragmentElement = document.createElement('article');
        fragmentElement.classList.add('movie-card');

        const fragmentImage = document.createElement('img');
        fragmentImage.src = fragment.url || fragment.previewUrl;
        fragmentImage.alt = 'Фрагмент фильма';
        if (!fragmentImage.src) {
            fragmentImage.alt = 'Фрагмент фильма отсутствует';
        }
        fragmentElement.append(fragmentImage);

        fragmentsGrid.append(fragmentElement);
    })
    
}

//рендерим похожие кино 
function renderSimilarMovies(similarMovies = []) {
    const section = document.querySelector('#search-preference');
    const track = section.querySelector('.slider-track');
    const dotsContainer = section.querySelector('.pagination-dots');
    const prevButton = section.querySelector('.slider-arrow--prev');
    const nextButton = section.querySelector('.slider-arrow--next');

    const movies = similarMovies ?? [];
    const pageSize = 4;
    const totalPages = Math.ceil(movies.length / pageSize);
    let currentPage = 0;

    track.replaceChildren();
    dotsContainer.replaceChildren();

    //Если страниц меньше 2, переключатели не нужны
    prevButton.hidden = totalPages <= 1;
    nextButton.hidden = totalPages <= 1;
    dotsContainer.hidden = totalPages <= 1;

    if (movies.length === 0) {
        track.textContent = 'Похожие фильмы пока не найдены';
        return;
    }

    function showPage(page) {
        if (page < 0 || page >= totalPages) return;

        currentPage = page;

        const start = currentPage * pageSize;
        const pageMovies = movies.slice(start, start + pageSize);

        renderFilms(pageMovies, track);

        prevButton.disabled = currentPage === 0;
        nextButton.disabled = currentPage === totalPages - 1;

        [...dotsContainer.children].forEach((dot, index) => {
            const isActive = index === currentPage;

            dot.classList.toggle('pagination-dot--active', isActive);

            if (isActive) {
                dot.setAttribute('aria-current', 'page');
            } else {
                dot.removeAttribute('aria-current');
            }
        });
    }

    for (let page = 0; page < totalPages; page++) {
        const dot = document.createElement('button');

        dot.type = 'button';
        dot.classList.add('pagination-dot');
        dot.setAttribute('aria-label', `Страница ${page + 1}`);

        dot.addEventListener('click', () => {
            showPage(page);
        });

        dotsContainer.append(dot);
    }

    prevButton.onclick = () => showPage(currentPage - 1);
    nextButton.onclick = () => showPage(currentPage + 1);

    showPage(0);
}

async function loadFilmDescription() {
    const grid = document.querySelector('#search-film .search-grid');
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id')?.trim();

    // условие - если айди пустой или состоит не только из цифр
    if (!id || !/^\d+$/.test(id)) {
        grid.textContent = 'Не указан корректный ID фильма';
        return;
    }

    grid.textContent = 'Загрузка...';

    try {
        const film = await getFilmById(id);
        const card = renderFilmDescription(film);
        
        grid.replaceChildren(card);
        renderSimilarMovies(film.similarMovies);

        const filmFragments = await getFilmFragmentsById(id);
        renderFilmFragments(filmFragments);
        initFilmGallery(filmFragments);
    } catch (error) {
        grid.textContent = 'Не удалось загрузить фильм';
        console.error(error);
    }
}

loadFilmDescription();

// const checkFragmentsBtn = document.querySelector('.movies-all button');

// const dialog = document.querySelector('.gallery');

// checkFragmentsBtn.addEventListener('click', () => {
//     dialog.showModal();
// })

// const dialogCloseBtn = document.querySelector('.gallery__close');

// dialogCloseBtn.addEventListener('click', () => {
//     dialog.close();
// })

function initFilmGallery(fragments) {
    const dialog = document.querySelector('.gallery');
    const openButton = document.querySelector('.movies-all button');
    const closeButton = dialog.querySelector('.gallery__close');
    const mainImage = dialog.querySelector('.gallery__image');
    const counter = dialog.querySelector('.gallery__counter');
    const thumbs = dialog.querySelector('.gallery__thumbs');
    const prevButton = dialog.querySelector('.gallery__arrow--prev');
    const nextButton = dialog.querySelector('.gallery__arrow--next');

    //оставляем кадры, у которых есть адрес компании
    const images = fragments.filter(frame => frame.url || frame.previewUrl);

    let currentIndex = 0;

    thumbs.replaceChildren();
    openButton.disabled = images.length === 0;

    if (images.length === 0) return;

    const thumbButtons = images.map((frame, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.classList.add('gallery__thumb');
        button.setAttribute('aria-label', `Показать кадр ${index + 1}`);

        const image = document.createElement('img');
        image.src = frame.previewUrl || frame.url;
        image.alt = '';
        image.loading = 'lazy';

        button.append(image);

        button.addEventListener('click', () => {
            showFrame(index);
        });

        thumbs.append(button);

        return button;
    });

    function showFrame(index, smooth = true) {
        if (index < 0 || index >= images.length) return;

        currentIndex = index;

        const frame = images[currentIndex];

        mainImage.src = frame.url || frame.previewUrl;
        mainImage.alt = `Кадр ${currentIndex + 1} из фильма`;
        counter.textContent = `${currentIndex + 1} из ${images.length}`;

        prevButton.disabled = currentIndex === 0;
        nextButton.disabled = currentIndex === images.length - 1;

        thumbButtons.forEach((button, buttonIndex) => {
            const isActive = buttonIndex === currentIndex;

            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        // Прокручиваем только ленту миниатюр.
        const activeThumb = thumbButtons[currentIndex];
        const stripRect = thumbs.getBoundingClientRect();
        const thumbRect = activeThumb.getBoundingClientRect();

        const isOutside =
            thumbRect.left < stripRect.left ||
            thumbRect.right > stripRect.right;

        if (isOutside) {
            const offset =
                thumbRect.left - stripRect.left
                - (thumbs.clientWidth - thumbRect.width) / 2;

            thumbs.scrollTo({
                left: thumbs.scrollLeft + offset,
                behavior: smooth && !reducedMotion.matches
                    ? 'smooth'
                    : 'instant',
            });
        }
    }

    openButton.onclick = () => {
        if (dialog.open) return;

        dialog.showModal();

        // Размеры ленты можно измерять после открытия.
        showFrame(currentIndex, false);
    };

    closeButton.onclick = () => dialog.close();

    prevButton.onclick = () => showFrame(currentIndex - 1);
    nextButton.onclick = () => showFrame(currentIndex + 1);

    dialog.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            showFrame(currentIndex - 1);
        }

        if (event.key === 'ArrowRight') {
            event.preventDefault();
            showFrame(currentIndex + 1);
        }
    });
}