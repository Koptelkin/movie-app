import { getFilms, getLatestFilm } from './api.js';
import { renderFilms } from './render-films.js';

const sections = {
    movies: {
        type: 'movie',
        notNullFields: 'poster.url',
        'rating.imdb': '1-10',
        limit: '8'
    },
    series: {
        type: 'tv-series',
        notNullFields: 'poster.url',
        'rating.imdb': '1-10',
        limit: '8'
    },
    collection: {
        type: 'movie',
        sortField: 'votes.imdb',
        sortType: '-1',
        notNullFields: 'poster.url',
        limit: '8'
    }
}

// навешиваем обработчики на кнопки и делаем запрос для отображения карточек в блоке с кнопками-пресетами на странице

const sectionButtons = document.querySelectorAll('.movies-nav [data-section]');
sectionButtons.forEach(button => {
    button.addEventListener('click', () => {
            loadSection(button.dataset.section);
        })
})

async function loadSection(section) {
    //пока идет запрос блокируем нажатия по кнопке
    sectionButtons.forEach(button => {
        button.disabled = true;
    })

    try {
        const result = await getFilms(sections[section]);
        renderFilms(result, document.querySelector('.movies .movies-grid'));

        sectionButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.section === section)
        })
    } catch (error) {
        console.error('Не удалось загрузить раздел: ', error);
    } finally {
        sectionButtons.forEach(button => {
            button.disabled = false;
        })
    }
}

// 

const filtersContainer = document.querySelector('.filters');
const categoryGrid = document.querySelector('.movies-category .movies-grid');

let latestFilterRequest = 0;
let filteredFilms = [];
let yearSortDirection = -1;

async function loadFilteredFilms() {
    const reuqestId = ++latestFilterRequest;

    const filters = {
        notNullFields: 'poster.url',
        limit: '4'
    };

    filtersContainer.querySelectorAll('select[name]').forEach(select => {
        if (select.value !== '') {
            filters[select.name] = select.value;
        }
    })

    try {
        const films = await getFilms(filters);

        //пользователь мог изменить фильтры, пока шел запрос
        if (reuqestId !== latestFilterRequest) return;

        filteredFilms = films;
        
        renderSortedFilms();

        if (films.length === 0) {
            categoryGrid.textContent = 'По выбранным условиям ничего не найдено'
        }
    } catch (error) {
        if (reuqestId !== latestFilterRequest) return;

        filteredFilms = [];

        categoryGrid.textContent = 'Не удалось загрузить фильмы';
        console.error('Ошибка фильтрации: ', error);
    }
}

filtersContainer?.addEventListener('change', (event) => {
    if (event.target.matches('select[name]')) {
        loadFilteredFilms();
    }
})

//сортируем и отрисовываем копию результата запроса

function renderSortedFilms() {
    const sortedFilms = [...filteredFilms].sort((a,b) => {
        if (a.year == null && b.year == null) return 0;
        if (a.year == null) return 1;
        if (b.year == null) return -1;

        return (a.year - b.year) * yearSortDirection;
    });

    renderFilms(sortedFilms, categoryGrid);

    if (sortedFilms.length === 0) {
        categoryGrid.textContent = 'По выбранным условиям ничего не найдено';
    }
}

//добавляем обработчики стрелок в разделе фильтрации фильмов

document.querySelector('.filters-sort .arrow.up')?.addEventListener('click', () => {
    yearSortDirection = 1;

    if (filteredFilms.length > 0) {
        renderSortedFilms();
    }
})

document.querySelector('.filters-sort .arrow.down')?.addEventListener('click', () => {
    yearSortDirection = -1;

    if (filteredFilms.length > 0) {
        renderSortedFilms();
    }
})

//добавляем обработчики кликов по ссылкам в футере чтобы делать запрос за фильмами одновременно с прокруткой

const footerLinks = document.querySelectorAll('footer a[data-section]');

footerLinks.forEach(link => {
    link.addEventListener('click', () => {
        loadSection(link.dataset.section);
    })
})

//рендерим фильм на промо баннере 

function renderPromoFilm(film) {
    const filmInfo = document.querySelector('.promo-info').children[0];
    const filmPoster = document.querySelector('.promo-banner');

    //добавляем название и описание фильма
    const filmHeader = document.createElement('h1');
    filmHeader.textContent = film.name || film.names[0]?.name;

    const filmDescription = document.createElement('p');
    filmDescription.textContent = film.description || 'Без описания' 
    
    filmInfo.after(filmHeader);
    filmHeader.after(filmDescription);

    const promoLink = document.querySelector('.promo-button');
    promoLink.href = `/pages/film-description.html?id=${encodeURIComponent(film.id)}`;

    //добавляем постер фильма
    const filmImage = document.createElement('img');
    if (film.poster.url) {
        filmImage.src = film.poster.url
        filmImage.alt = `Фильм: ${film.name || film.names[0].name}`
    } else {
        filmImage.alt = 'Нет постера'
    }
    filmPoster.append(filmImage);
}

async function init() {
    // Якорь из ссылки в футере определяет раздел после перехода на главную.
    const initialSection = window.location.hash === '#popular-series'
        ? 'series'
        : 'movies';

    await loadSection(initialSection);
    await loadFilteredFilms();
    
    try {
        const latestFilm = await getLatestFilm();
        renderPromoFilm(latestFilm);
    } catch (error) {
        console.error('Ошибка загрузки фильмов:', error);
    }
}

init();

