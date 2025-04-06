const daysContainer = document.getElementById('days');
const currentMonth = document.getElementById('current-month');
const prevMonth = document.getElementById('prev-month');
const nextMonth = document.getElementById('next-month');
const addEventBtn = document.getElementById('add-event');
const eventList = document.getElementById('event-list');
const searchEvent = document.getElementById('search-event');
const searchResults = document.getElementById('search-results');
const themeToggle = document.getElementById('theme-toggle');
const newEventBtn = document.getElementById('new-event');
const eventForm = document.getElementById('event-form');
const categoryContainer = document.getElementById('event-categories');
const emojiInput = document.getElementById('event-emoji');
const emojiOptions = document.getElementById('emoji-options');
const yearSelect = document.getElementById('year-select');
const monthSelect = document.getElementById('month-select');
const colorInput = document.getElementById('event-color');

let date = new Date(2025, 2, 24); // Março 2025
let events = JSON.parse(localStorage.getItem('events')) || {};
let currentCategory = 'all';

// Preencher seletor de anos
for (let year = 2020; year <= 2040; year++) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
}
yearSelect.value = date.getFullYear();
monthSelect.value = date.getMonth();

// Função pra calcular luminância e escolher cor do texto
function getTextColor(bgColor) {
    const r = parseInt(bgColor.slice(1, 3), 16);
    const g = parseInt(bgColor.slice(3, 5), 16);
    const b = parseInt(bgColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff'; // Claro -> preto, Escuro -> branco
}

function renderCalendar() {
    daysContainer.innerHTML = '';
    const month = date.getMonth();
    const year = date.getFullYear();
    const today = new Date();
    currentMonth.textContent = `${date.toLocaleString('pt-br', { month: 'long' })} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const key = `${year}-${month}-${day}`;
        const hasEvent = events[key] && events[key].length > 0;
        const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        const emoji = hasEvent && events[key][0].emoji ? `<span class="emoji">${events[key][0].emoji}</span>` : '';
        daysContainer.innerHTML += `<div class="day ${hasEvent ? 'has-event' : ''} ${isToday ? 'today' : ''}" data-day="${day}">${day}${emoji}</div>`;
    }

    document.querySelectorAll('.day').forEach(day => {
        day.addEventListener('click', () => {
            document.querySelectorAll('.day').forEach(d => d.classList.remove('active'));
            day.classList.add('active');
            showEvents(day.dataset.day, month, year);
            document.getElementById('event-date').value = `${year}-${String(month + 1).padStart(2, '0')}-${String(day.dataset.day).padStart(2, '0')}`;
        });
    });
}

function showEvents(day, month, year) {
    eventList.innerHTML = '';
    const key = `${year}-${month}-${day}`;
    if (events[key]) {
        events[key].forEach((event, index) => {
            if (currentCategory === 'all' || event.category === currentCategory) {
                const textColor = getTextColor(event.color);
                eventList.innerHTML += `<li style="background-color: ${event.color}; color: ${textColor}">${event.time} - ${event.desc} ${event.emoji || ''}<button class="delete-btn" data-key="${key}" data-index="${index}">X</button></li>`;
            }
        });
    }
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.key;
            const index = btn.dataset.index;
            events[key].splice(index, 1);
            if (events[key].length === 0) delete events[key];
            localStorage.setItem('events', JSON.stringify(events));
            renderCalendar();
            showEvents(day, month, year);
        });
    });
}

function saveEvent() {
    const dateInput = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value;
    const desc = document.getElementById('event-desc').value;
    const category = document.getElementById('event-category').value;
    const color = document.getElementById('event-color').value;
    const emoji = document.getElementById('event-emoji').value;

    if (dateInput && desc && category) {
        const [year, month, day] = dateInput.split('-');
        const key = `${year}-${parseInt(month) - 1}-${day}`;
        if (!events[key]) events[key] = [];
        events[key].push({ time: time || 'Sem horário', desc, category, color, emoji });
        localStorage.setItem('events', JSON.stringify(events));
        renderCalendar();
        showEvents(day, parseInt(month) - 1, year);
        document.getElementById('event-desc').value = '';
        document.getElementById('event-time').value = '';
        document.getElementById('event-emoji').value = '';
        updateCategories();
    }
}

function updateCategories() {
    const categories = ['all', ...new Set(Object.values(events).flat().map(e => e.category))];
    categoryContainer.innerHTML = categories.map(cat => 
        `<button class="category-btn ${cat === currentCategory ? 'active' : ''}" data-category="${cat}">${cat === 'all' ? 'Todos' : cat}</button>`
    ).join('');
    
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            const activeDay = document.querySelector('.day.active');
            if (activeDay) showEvents(activeDay.dataset.day, date.getMonth(), date.getFullYear());
        });
    });
}

addEventBtn.addEventListener('click', saveEvent);

prevMonth.addEventListener('click', () => {
    date.setMonth(date.getMonth() - 1);
    yearSelect.value = date.getFullYear();
    monthSelect.value = date.getMonth();
    renderCalendar();
});

nextMonth.addEventListener('click', () => {
    date.setMonth(date.getMonth() + 1);
    yearSelect.value = date.getFullYear();
    monthSelect.value = date.getMonth();
    renderCalendar();
});

yearSelect.addEventListener('change', () => {
    date.setFullYear(parseInt(yearSelect.value));
    renderCalendar();
});

monthSelect.addEventListener('change', () => {
    date.setMonth(parseInt(monthSelect.value));
    renderCalendar();
});

searchEvent.addEventListener('input', (e) => {
    const search = e.target.value.toLowerCase();
    searchResults.innerHTML = '';
    if (search) {
        Object.keys(events).forEach(key => {
            events[key].forEach((event, index) => {
                if (event.desc.toLowerCase().includes(search) && (currentCategory === 'all' || event.category === currentCategory)) {
                    const textColor = getTextColor(event.color);
                    searchResults.innerHTML += `<li style="background-color: ${event.color}; color: ${textColor}" data-key="${key}" data-index="${index}">${day}/${parseInt(month) + 1}/${year} - ${event.time} - ${event.desc} ${event.emoji || ''}<button class="delete-btn">X</button></li>`;
                }
            });
        });
        searchResults.style.display = 'block';
    } else {
        searchResults.style.display = 'none';
    }

    document.querySelectorAll('.search-results .delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const li = btn.parentElement;
            const key = li.dataset.key;
            const index = li.dataset.index;
            events[key].splice(index, 1);
            if (events[key].length === 0) delete events[key];
            localStorage.setItem('events', JSON.stringify(events));
            renderCalendar();
            searchEvent.dispatchEvent(new Event('input'));
        });
    });

    document.querySelectorAll('.search-results li').forEach(li => {
        li.addEventListener('click', () => {
            const [year, month, day] = li.dataset.key.split('-');
            date = new Date(year, month, day);
            yearSelect.value = year;
            monthSelect.value = month;
            renderCalendar();
            document.querySelectorAll('.day').forEach(d => d.classList.remove('active'));
            document.querySelector(`.day[data-day="${day}"]`).classList.add('active');
            showEvents(day, month, year);
            searchResults.style.display = 'none';
        });
    });
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    themeToggle.textContent = document.body.classList.contains('dark') ? 'Modo Claro' : 'Modo Escuro';
});

newEventBtn.addEventListener('click', () => {
    eventForm.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('event-desc').focus();
});

emojiInput.addEventListener('click', () => {
    emojiOptions.style.display = emojiOptions.style.display === 'block' ? 'none' : 'block';
});

document.querySelectorAll('.emoji-option').forEach(option => {
    option.addEventListener('click', () => {
        emojiInput.value = option.textContent;
        emojiOptions.style.display = 'none';
    });
});

colorInput.addEventListener('input', () => {
    colorInput.style.borderColor = colorInput.value;
});

renderCalendar();
updateCategories();