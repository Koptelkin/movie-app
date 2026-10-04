import { searchFilm, getFilmById } from "./api.js";
import { renderSearchFilms } from "./render-films.js";

const input = document.querySelector('.header-input');
const searchGrid = document.querySelector('.search-grid');

async function loadSearchResults() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('query')?.trim();

    if (!query) {
        searchGrid.textContent = 'Введите название фильма';
        return;
    }

    input.value = query;
    searchGrid.textContent = 'Загрузка...';

    try {
        const films = await searchFilm(query);

        if (films.length === 0) {
            searchGrid.textContent = 'Ничего не найдено';
            return;
        }

        const filmsWithPersons = await Promise.all(
            films.map(async film => {
                if (film.persons?.length || film.id == null) return film;

                try {
                    const details = await getFilmById(film.id);

                    return {
                        ...film,
                        persons: details.persons ?? []
                    }
                    
                } catch(error) {

                    console.error(`Не удалось загрузить участников фильма ${film.name || film.alternativeName}: `, error);
                    return film;
                }
            })
        )

        renderSearchFilms(filmsWithPersons);
        
    } catch (error) {
        searchGrid.textContent = 'Не удалось загрузить фильмы';
        console.error(error);
    }
}
    
loadSearchResults();
