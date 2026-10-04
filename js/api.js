export async function getFilms(filters) {
    const urlParams = new URLSearchParams({
        ...filters
    })

    const response = await fetch(`https://api.poiskkino.dev/v1.5/movie?${urlParams}`, {
        headers: {
            'X-API-KEY': '6Y1XBM0-33PM08Y-NA466TZ-308MYHW'
        }
    });

    if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`)
    }

    const data = await response.json();
    
    return data.docs;
}

// делаем апи запрос за данными для отображения фильма на промо баннере

export async function getLatestFilm() {
    const urlParams = new URLSearchParams({
        type: 'movie',
        limit: '1',
        sortField: 'premiere.world',
        sortType: '-1'
    })

    const response = await fetch(`https://api.poiskkino.dev/v1.5/movie?${urlParams}`, {
        headers: {
            'X-API-KEY': '6Y1XBM0-33PM08Y-NA466TZ-308MYHW'
        }
    })

    if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`)
    }

    const data = await response.json();
    return data.docs[0];
}

// апи запрос на поиск фильма по названию

export async function searchFilm(query) {
    const urlParams = new URLSearchParams({
        page: '1',
        limit: '10',
        query: query,
    })

    const response = await fetch(`https://api.poiskkino.dev/v1.5/movie/search?${urlParams}`, {
        headers: {
            'X-API-KEY': '6Y1XBM0-33PM08Y-NA466TZ-308MYHW'
        }
    })

    if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`)
    }

    const data = await response.json();
    
    return data.docs;
}

export async function getFilmById(id) {
    const response = await fetch(`https://api.poiskkino.dev/v1.5/movie/${encodeURIComponent(id)}`, {
        headers: {
            'X-API-KEY': '6Y1XBM0-33PM08Y-NA466TZ-308MYHW'
        }
    });

    if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`)
    }

    const data = await response.json();
    return data;
}

export async function getFilmFragmentsById(id) {
    const response = await fetch(`https://api.poiskkino.dev/v1.5/image?movieId=${id}&type=frame&limit=6`, {
        headers: {
            'X-API-KEY': '6Y1XBM0-33PM08Y-NA466TZ-308MYHW'
        }
    });

    if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`)
    }

    const data = await response.json();
    return data.docs;
}