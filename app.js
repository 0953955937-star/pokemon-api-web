// Almacenamiento global de datos para filtrar localmente de forma rápida
let allPokemon = [];

// Límites de ID según la generación seleccionada
const genLimits = {
    all: { offset: 0, limit: 151 }, // Por defecto cargamos la primera generación para no saturar
    "1": { offset: 0, limit: 151 },
    "2": { offset: 151, limit: 100 },
    "3": { offset: 251, limit: 135 },
    "4": { offset: 386, limit: 107 },
    "5": { offset: 493, limit: 156 }
};

// Obtener datos iniciales de la API
const fetchPokemons = async (gen = "all") => {
    const { offset, limit } = genLimits[gen];
    const URL = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;
    
    try {
        const response = await fetch(URL);
        const data = await response.json();
        
        // Mapeamos para obtener el detalle de cada pokemon individualmente
        const promises = data.results.map(async (pokemon) => {
            const res = await fetch(pokemon.url);
            return await res.json();
        });
        
        allPokemon = await Promise.all(promises);
        applyFilters(); // Renderiza aplicando filtros activos
    } catch (error) {
        console.error("Error cargando los Pokémon:", error);
    }
};

// Lógica de filtrado combinada (Buscador por texto + Selector de Tipo)
const applyFilters = () => {
    const searchWord = document.getElementById('search-input').value.toLowerCase();
    const selectedType = document.getElementById('type-select').value;

    // Filtramos el arreglo usando filter
    const filtered = allPokemon.filter(pokemon => {
        const matchesName = pokemon.name.toLowerCase().includes(searchWord);
        const matchesType = selectedType === 'all' || pokemon.types.some(t => t.type.name === selectedType);
        return matchesName && matchesType;
    });

    renderCards(filtered);
};

// Renderizado en el DOM mediante plantillas dinámicas
const renderCards = (pokemonList) => {
    const container = document.getElementById('pokemon-container');
    container.innerHTML = ''; 

    if(pokemonList.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align:center;">No se encontraron Pokémon con esos criterios.</p>`;
        return;
    }

    pokemonList.forEach(pokemon => {
        // Desestructuración obligatoria
        const { name, sprites, types, id } = pokemon;
        const img = sprites.front_default || sprites.other['official-artwork'].front_default;
        
        const card = document.createElement('div');
        card.classList.add('card');

        const badges = types.map(t => `<span class="type-badge ${t.type.name}">${t.type.name}</span>`).join('');

        card.innerHTML = `
            <p style="color: #aaa; margin:0;">#${id.toString().padStart(3, '0')}</p>
            <img src="${img}" alt="${name}">
            <h3>${name}</h3>
            <div class="types">${badges}</div>
        `;
        container.appendChild(card);
    });
};

// Listeners para interactividad en tiempo real
document.getElementById('search-input').addEventListener('input', applyFilters);
document.getElementById('type-select').addEventListener('change', applyFilters);

// El cambio de generación requiere hacer una nueva petición a la API
document.getElementById('generation-select').addEventListener('change', (e) => {
    fetchPokemons(e.target.value);
});

// Inicialización de la app
document.addEventListener('DOMContentLoaded', () => fetchPokemons('all'));