//создаем и заполняем карточку фильма
function createMovieCard(film) {

    const movieCard = document.createElement('a');
    movieCard.href = `/pages/film-description.html?id=${encodeURIComponent(film.id)}`;
    movieCard.classList.add('movie-card');
    const movieCardImage = document.createElement('img');
    movieCard.append(movieCardImage);
    const movieCardTitle = document.createElement('h4');
    movieCard.append(movieCardTitle);
    const movieCardMeta = document.createElement('div');
    movieCardMeta.classList.add('movie-meta');
    movieCard.append(movieCardMeta);
    const movieCardYear = document.createElement('span');
    movieCardMeta.append(movieCardYear);
    const movieCardRating = document.createElement('span');
    movieCardMeta.append(movieCardRating);
    
    const { name, names, year, rating } = film;

    // проверяем на наличие название фильма. проверяем 2 ключа и выводим первое, если нет ключей - отдаем заглушку 
    const movieName = name?.trim()
        || film.alternativeName?.trim()
        || names?.find(item => item?.name?.trim())?.name.trim()
        || 'Без названия';

    // проверяем наличие рейтинга у фильма. выводим если есть, если нет отдаем заглушку
    const movieRating = rating?.kp || rating?.imdb || rating?.tmdb || 'Нет оценки';

    const previewUrl = film.poster?.previewUrl || film.poster?.url

    // если нет постера у фильма обрабатываем ошибку и отдаем заглушку 
    if (previewUrl) {
        movieCardImage.setAttribute('src', previewUrl);
        movieCardImage.setAttribute('alt', `Постер: ${movieName}`);
    } else {
        movieCardImage.setAttribute('alt', 'No image')
    }

    movieCardTitle.textContent = movieName;
    movieCardYear.textContent = year ?? 'Год не указан';
    movieCardRating.textContent = movieRating;

    return movieCard;
}

// рендерим список карточек фильмов
export function renderFilms(films, moviesGrid) {

    const cards = films.map(film => createMovieCard(film))
    moviesGrid.replaceChildren(...cards);
}

//рендерим список характеристик фильма
export function createFilmMeta(film, showDetails = false) {
    // превращаем массив объектов с именами в строку
    const joinNames = (items) => {
        return (items ?? [])
            .map(item => item.name || item.enName)
            .filter(Boolean)
            .join(', ');
    };
    
    // проверяем и достаем значение поля persons в новом склееном объекте полученном за 2 разных апи запроса
    const persons = film.persons ?? [];

    const directors = persons.filter(person => 
        person.enProfession === 'director'
    );

    const actors = persons.filter(
        person => person.enProfession === 'actor'
    )

    // массив для создания будущих dt и dd
    const fields = [
        ['Жанр:', joinNames(film.genres)],
        ['Страна:', joinNames(film.countries)],
        ['Год:', film.year ?? 'Нет данных'],
        ['Режиссёр:', joinNames(directors)],
        ['Актёры:', joinNames(actors)],
    ];

    if (showDetails) {
        const movieLength = film.movieLength > 0
            ? `${film.movieLength} мин.`
            : 'Нет данных';

        const ticketsOnSale = film.ticketsOnSale === true 
            ? 'Да'
            : film.ticketsOnSale === false
                ? 'Нет'
                : 'Нет данных';

        fields.push(
            ['Длительность:', movieLength],
            ['Есть билеты:', ticketsOnSale]
        );
    }

    const list = document.createElement('dl');
    list.classList.add('search-item_meta');

    fields.forEach(([label, value]) => {
        const row = document.createElement('div');
        row.classList.add('search-item_meta-row');

        const term = document.createElement('dt');
        term.textContent = label;

        const detail = document.createElement('dd');
        detail.textContent = value === '' ? 'Нет данных' : value;

        row.append(term, detail);
        list.append(row);
    });

    return list;
}

// рендерим список фильмов найденных по вхождению введенного в форму значения с названием фильма
export function renderSearchFilms(films) {
    const searchGrid = document.querySelector('.search-grid');

    searchGrid.replaceChildren();

    films.forEach(film => {
        
        const searchItem = document.createElement('article');
        searchItem.classList.add('search-item');

        const searchItemImage = document.createElement('img');
        searchItemImage.classList.add('search-item_img');
        const posterUrl = film.poster?.url || film.poster?.previewUrl;
        if (posterUrl) {
            searchItemImage.src = posterUrl;
        }
        const movieName = film.name || film.alternativeName || 'Без названия';
        searchItemImage.alt = posterUrl ? `Постер: ${movieName}` : `Нет постера: ${movieName}`;
        searchItem.append(searchItemImage);

        const searchItemInfo = document.createElement('div');
        searchItemInfo.classList.add('search-item_info');
        searchItem.append(searchItemInfo);
        
        //блок с оценками и заголовком фильма
        const searchItemRating = document.createElement('div');
        searchItemRating.classList.add('search-item_info-rating');
        searchItemInfo.append(searchItemRating);

        const searchItemHeader = document.createElement('h1');
        searchItemHeader.textContent = movieName;
        searchItemRating.append(searchItemHeader);
        
        const RatingDiv = document.createElement('div');
        searchItemRating.append(RatingDiv);

        const RatingKP = document.createElement('span');
        RatingKP.textContent = 'Кинопоиск ';
        RatingDiv.append(RatingKP);
        const RatingKPvalue = document.createElement('span');
        RatingKPvalue.textContent = `${film.rating?.kp ?? 'Нет оценки'}`;
        RatingKP.append(RatingKPvalue);

        const BreakTag = document.createElement('br');
        RatingDiv.append(BreakTag);

        const RatingIMDb = document.createElement('span');
        RatingIMDb.textContent = 'IMDb ';
        RatingDiv.append(RatingIMDb);
        const RatingIMDbvalue = document.createElement('span');
        RatingIMDbvalue.textContent = `${film.rating?.imdb ?? 'Нет оценки'}`;
        RatingIMDb.append(RatingIMDbvalue);

        //блок с основной информацией по фильму
        const searchItemDescription = document.createElement('p');
        searchItemDescription.textContent = film.description || film.shortDescription || 'Описание отсутствует'
        searchItemInfo.append(searchItemDescription);

        //блок с основными характеристиками фильма
        searchItemInfo.append(createFilmMeta(film));

        //кнопки для взаимодействия с фильмом
        const searchItemButtons = document.createElement('div');
        searchItemButtons.classList.add('search-item_meta-buttons');
        const primaryBtn = document.createElement('a');
        primaryBtn.href = `/pages/film-description.html?id=${encodeURIComponent(film.id)}`;
        primaryBtn.classList.add('btn');
        primaryBtn.id = 'primary-btn';
        primaryBtn.textContent = 'Смотреть';
        const Btn = document.createElement('button');
        Btn.classList.add('btn');
        Btn.textContent = 'В избранное'
        searchItemButtons.append(primaryBtn, Btn);
        searchItemInfo.append(searchItemButtons);
        
        searchGrid.append(searchItem);

    })
}