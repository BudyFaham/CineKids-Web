class MovieApp {
    constructor() {
        const savedState = JSON.parse(localStorage.getItem('cinekids_prefs')) || {};
        const savedTheme = localStorage.getItem('cinekids_theme') || 'dark';
        const savedFavorites = JSON.parse(localStorage.getItem('cinekids_favorites')) || [];

        this.state = {
            movies: [],
            favorites: savedFavorites,
            filter: savedState.filter || 'all',
            sort: savedState.sort || 'newest',
            search: '',
            theme: savedTheme
        };

        this.dom = {
            grid: document.getElementById('moviesGrid'),
            countBadge: document.getElementById('countBadge'),
            searchInput: document.getElementById('searchInput'),
            sortSelect: document.getElementById('sortSelect'),
            filterBtns: document.querySelectorAll('.filter-btn'),
            resetBtn: document.getElementById('resetBtn'),
            themeToggle: document.getElementById('themeToggle')
        };

        this.studioColors = {
            'Disney': 'var(--disney)',
            'Pixar': 'var(--pixar)',
            'DreamWorks': 'var(--dreamworks)',
            'Netflix': 'var(--netflix)',
            'Sony': 'var(--sony)',
            'Ghibli': 'var(--ghibli)',
            'Illumination': 'var(--illumination)',
            'Fox': 'var(--fox)',
            'WB': 'var(--wb)',
            'Blue Sky': 'var(--bluesky)',
            'Laika': 'var(--laika)',
            'Universal': 'var(--universal)'
        };

        this.init();
    }

    async init() {
        this.applyTheme();
        this.state.movies = await this.generateDB();
        this.applySavedPreferences();
        this.bindEvents();
        this.render();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.state.theme);
        this.dom.themeToggle.textContent = this.state.theme === 'dark' ? '🌙' : '☀️';
    }

    toggleTheme() {
        this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('cinekids_theme', this.state.theme);
        this.applyTheme();
    }

    getFirst157Data() {
        return {
            "The Lion King": { r: "8+", s: 8.5, d: "1h 28m" },
            "Frozen": { r: "5+", s: 7.4, d: "1h 42m" },
            "Moana": { r: "6+", s: 7.6, d: "1h 47m" },
            "Aladdin": { r: "6+", s: 8.0, d: "1h 30m" },
            "Beauty and the Beast": { r: "6+", s: 8.0, d: "1h 24m" },
            "Zootopia": { r: "8+", s: 8.0, d: "1h 48m" },
            "Encanto": { r: "6+", s: 7.2, d: "1h 42m" },
            "Mulan": { r: "5+", s: 7.7, d: "1h 27m" },
            "Wreck-It Ralph": { r: "7+", s: 7.7, d: "1h 41m" },
            "Big Hero 6": { r: "7+", s: 7.8, d: "1h 42m" },
            "Tangled": { r: "5+", s: 7.7, d: "1h 40m" },
            "Hercules": { r: "7+", s: 7.3, d: "1h 33m" },
            "Tarzan": { r: "6+", s: 7.3, d: "1h 28m" },
            "Pocahontas": { r: "6+", s: 6.7, d: "1h 21m" },
            "The Princess and the Frog": { r: "6+", s: 7.2, d: "1h 37m" },
            "Lilo & Stitch": { r: "6+", s: 7.4, d: "1h 25m" },
            "Treasure Planet": { r: "8+", s: 7.2, d: "1h 35m" },
            "Atlantis: The Lost Empire": { r: "8+", s: 6.9, d: "1h 35m" },
            "Raya and the Last Dragon": { r: "8+", s: 7.3, d: "1h 47m" },
            "Strange World": { r: "Banned", s: 5.7, d: "1h 42m" },
            "Brother Bear": { r: "5+", s: 6.9, d: "1h 25m" },
            "The Emperor's New Groove": { r: "6+", s: 7.4, d: "1h 18m" },
            "Pinocchio": { r: "6+", s: 7.5, d: "1h 28m" },
            "Peter Pan": { r: "7+", s: 7.3, d: "1h 17m" },
            "Alice in Wonderland": { r: "4+", s: 7.3, d: "1h 15m" },
            "Cinderella": { r: "4+", s: 7.3, d: "1h 14m" },
            "Bambi": { r: "5+", s: 7.3, d: "1h 9m" },
            "Dumbo": { r: "5+", s: 7.2, d: "1h 4m" },
            "Snow White": { r: "6+", s: 7.6, d: "1h 23m" },
            "The Jungle Book": { r: "5+", s: 7.6, d: "1h 18m" },
            "Toy Story": { r: "5+", s: 8.3, d: "1h 21m" },
            "Finding Nemo": { r: "5+", s: 8.2, d: "1h 40m" },
            "Monsters, Inc.": { r: "5+", s: 8.1, d: "1h 32m" },
            "The Incredibles": { r: "7+", s: 8.0, d: "1h 55m" },
            "Cars": { r: "5+", s: 7.3, d: "1h 56m" },
            "Ratatouille": { r: "6+", s: 8.1, d: "1h 51m" },
            "WALL-E": { r: "5+", s: 8.4, d: "1h 38m" },
            "Up": { r: "6+", s: 8.3, d: "1h 36m" },
            "Coco": { r: "7+", s: 8.4, d: "1h 45m" },
            "Inside Out": { r: "6+", s: 8.1, d: "1h 35m" },
            "Toy Story 2": { r: "5+", s: 7.9, d: "1h 32m" },
            "Toy Story 3": { r: "6+", s: 8.3, d: "1h 43m" },
            "Monsters University": { r: "5+", s: 7.2, d: "1h 44m" },
            "Finding Dory": { r: "6+", s: 7.2, d: "1h 37m" },
            "Cars 3": { r: "6+", s: 6.7, d: "1h 42m" },
            "Incredibles 2": { r: "8+", s: 7.5, d: "1h 58m" },
            "Onward": { r: "Banned", s: 7.4, d: "1h 42m" },
            "Soul": { r: "8+", s: 8.0, d: "1h 40m" },
            "Luca": { r: "6+", s: 7.4, d: "1h 35m" },
            "Turning Red": { r: "10+", s: 6.9, d: "1h 40m" },
            "Lightyear": { r: "Banned", s: 6.1, d: "1h 45m" },
            "Elemental": { r: "6+", s: 7.0, d: "1h 41m" },
            "The Good Dinosaur": { r: "7+", s: 6.7, d: "1h 33m" },
            "Brave": { r: "8+", s: 7.1, d: "1h 33m" },
            "Inside Out 2": { r: "6+", s: 7.5, d: "1h 36m" },
            "Shrek": { r: "6+", s: 7.9, d: "1h 30m" },
            "How to Train Your Dragon": { r: "6+", s: 8.1, d: "1h 38m" },
            "Kung Fu Panda": { r: "6+", s: 7.6, d: "1h 32m" },
            "Madagascar": { r: "7+", s: 6.9, d: "1h 26m" },
            "Shrek 2": { r: "6+", s: 7.4, d: "1h 33m" },
            "Puss in Boots": { r: "6+", s: 6.6, d: "1h 30m" },
            "Puss in Boots: The Last Wish": { r: "8+", s: 7.8, d: "1h 42m" },
            "The Bad Guys": { r: "6+", s: 6.9, d: "1h 40m" },
            "Megamind": { r: "6+", s: 7.3, d: "1h 35m" },
            "Rise of the Guardians": { r: "7+", s: 7.2, d: "1h 37m" },
            "The Croods": { r: "8+", s: 7.1, d: "1h 38m" },
            "Trolls": { r: "6+", s: 6.4, d: "1h 32m" },
            "The Boss Baby": { r: "6+", s: 6.3, d: "1h 37m" },
            "Monsters vs. Aliens": { r: "7+", s: 6.4, d: "1h 34m" },
            "Shark Tale": { r: "8+", s: 6.0, d: "1h 30m" },
            "Antz": { r: "8+", s: 6.5, d: "1h 23m" },
            "The Prince of Egypt": { r: "8+", s: 7.2, d: "1h 39m" },
            "The Road to El Dorado": { r: "7+", s: 6.9, d: "1h 29m" },
            "Spirit: Stallion of the Cimarron": { r: "7+", s: 7.2, d: "1h 23m" },
            "Sinbad: Legend of the Seven Seas": { r: "8+", s: 6.8, d: "1h 28m" },
            "Over the Hedge": { r: "5+", s: 6.7, d: "1h 23m" },
            "Bee Movie": { r: "7+", s: 6.1, d: "1h 31m" },
            "Penguins of Madagascar": { r: "7+", s: 6.6, d: "1h 32m" },
            "Home": { r: "6+", s: 6.5, d: "1h 34m" },
            "Abominable": { r: "8+", s: 7.0, d: "1h 37m" },
            "Klaus": { r: "6+", s: 8.2, d: "1h 36m" },
            "The Sea Beast": { r: "8+", s: 7.0, d: "1h 55m" },
            "Over the Moon": { r: "6+", s: 6.3, d: "1h 35m" },
            "The Willoughbys": { r: "8+", s: 6.4, d: "1h 30m" },
            "Wish Dragon": { r: "8+", s: 7.2, d: "1h 38m" },
            "Back to the Outback": { r: "8+", s: 6.5, d: "1h 35m" },
            "Spider-Man: Into the Spider-Verse": { r: "9+", s: 8.4, d: "1h 57m" },
            "Spider-Man: Across the Spider-Verse": { r: "Banned", s: 8.5, d: "2h 20m" },
            "Hotel Transylvania": { r: "6+", s: 7.0, d: "1h 31m" },
            "Hotel Transylvania 2": { r: "7+", s: 6.6, d: "1h 29m" },
            "The Smurfs": { r: "6+", s: 5.4, d: "1h 43m" },
            "Cloudy with a Chance of Meatballs": { r: "6+", s: 6.9, d: "1h 30m" },
            "Open Season": { r: "6+", s: 6.1, d: "1h 26m" },
            "Surf's Up": { r: "5+", s: 6.7, d: "1h 25m" },
            "Peter Rabbit": { r: "7+", s: 6.6, d: "1h 35m" },
            "The Angry Birds Movie": { r: "7+", s: 6.3, d: "1h 37m" },
            "The Emoji Movie": { r: "6+", s: 3.5, d: "1h 26m" },
            "Stuart Little": { r: "7+", s: 6.0, d: "1h 24m" },
            "Arthur Christmas": { r: "6+", s: 7.1, d: "1h 37m" },
            "The Pirates! Band of Misfits": { r: "6+", s: 6.7, d: "1h 28m" },
            "The Mitchells vs. the Machines": { r: "8+", s: 7.6, d: "1h 54m" },
            "Vivo": { r: "6+", s: 6.7, d: "1h 35m" },
            "Arlo the Alligator Boy": { r: "8+", s: 6.4, d: "1h 30m" },
            "Leo": { r: "8+", s: 7.0, d: "1h 42m" },
            "Nimona": { r: "11+", s: 7.5, d: "1h 41m" },
            "Guillermo del Toro's Pinocchio": { r: "11+", s: 7.6, d: "1h 57m" },
            "Wendell & Wild": { r: "11+", s: 6.4, d: "1h 45m" },
            "Apollo 10 1/2": { r: "10+", s: 7.2, d: "1h 37m" },
            "My Little Pony: A New Generation": { r: "5+", s: 6.8, d: "1h 30m" },
            "Despicable Me": { r: "6+", s: 7.6, d: "1h 35m" },
            "Minions": { r: "5+", s: 6.4, d: "1h 31m" },
            "The Secret Life of Pets": { r: "7+", s: 6.5, d: "1h 26m" },
            "Sing": { r: "7+", s: 7.1, d: "1h 48m" },
            "The Super Mario Bros. Movie": { r: "7+", s: 7.0, d: "1h 32m" },
            "The Lorax": { r: "5+", s: 6.4, d: "1h 26m" },
            "The Grinch": { r: "6+", s: 6.4, d: "1h 25m" },
            "Hop": { r: "5+", s: 5.4, d: "1h 35m" },
            "Ice Age": { r: "6+", s: 7.5, d: "1h 21m" },
            "Ice Age: The Meltdown": { r: "6+", s: 6.8, d: "1h 31m" },
            "Ice Age: Dawn of the Dinosaurs": { r: "6+", s: 6.9, d: "1h 34m" },
            "Rio": { r: "6+", s: 6.9, d: "1h 36m" },
            "Rio 2": { r: "6+", s: 6.3, d: "1h 41m" },
            "Robots": { r: "5+", s: 6.4, d: "1h 31m" },
            "Horton Hears a Who!": { r: "4+", s: 6.8, d: "1h 26m" },
            "Epic": { r: "6+", s: 6.6, d: "1h 42m" },
            "Ferdinand": { r: "6+", s: 6.7, d: "1h 48m" },
            "Spies in Disguise": { r: "8+", s: 6.8, d: "1h 42m" },
            "Anastasia": { r: "6+", s: 7.2, d: "1h 34m" },
            "Titan A.E.": { r: "11+", s: 6.6, d: "1h 34m" },
            "The Book of Life": { r: "7+", s: 7.2, d: "1h 35m" },
            "Despicable Me 2": { r: "6+", s: 7.3, d: "1h 38m" },
            "Despicable Me 3": { r: "7+", s: 6.3, d: "1h 29m" },
            "Minions: The Rise of Gru": { r: "6+", s: 6.5, d: "1h 27m" },
            "Sing 2": { r: "7+", s: 7.3, d: "1h 50m" },
            "The Secret Life of Pets 2": { r: "7+", s: 6.4, d: "1h 26m" },
            "Migration": { r: "6+", s: 6.6, d: "1h 23m" },
            "The Peanuts Movie": { r: "4+", s: 7.0, d: "1h 28m" },
            "Ice Age: Continental Drift": { r: "6+", s: 6.5, d: "1h 28m" },
            "Ice Age: Collision Course": { r: "6+", s: 5.7, d: "1h 34m" },
            "Spirited Away": { r: "9+", s: 8.6, d: "2h 4m" },
            "My Neighbor Totoro": { r: "5+", s: 8.1, d: "1h 26m" },
            "Ponyo": { r: "5+", s: 7.6, d: "1h 41m" },
            "Howl's Moving Castle": { r: "8+", s: 8.2, d: "1h 59m" },
            "Princess Mononoke": { r: "12+", s: 8.3, d: "2h 13m" },
            "Coraline": { r: "9+", s: 7.8, d: "1h 40m" },
            "Kubo and the Two Strings": { r: "9+", s: 7.7, d: "1h 41m" },
            "The Iron Giant": { r: "6+", s: 8.1, d: "1h 26m" },
            "The Lego Movie": { r: "6+", s: 7.7, d: "1h 40m" },
            "The Lego Batman Movie": { r: "7+", s: 7.3, d: "1h 44m" },
            "The Return of Jafar": { r: "5+", s: 5.8, d: "1h 9m" },
            "Beauty and the Beast: The Enchanted Christmas": { r: "8+", s: 5.9, d: "1h 12m" },
            "Belle's Magical World": { r: "5+", s: 4.8, d: "1h 32m" },
            "The Lion King II: Simba's Pride": { r: "5+", s: 6.4, d: "1h 22m" },
            "Pocahontas II: Journey to a New World": { r: "6+", s: 4.8, d: "1h 13m" },
            "Bartok the Magnificent": { r: "7+", s: 6.1, d: "1h 8m" },
            "How the Grinch Stole Christmas": { r: "8+", s: 6.4, d: "1h 44m" },
            "Cinderella II": { r: "4+", s: 5.0, d: "1h 13m" },
            "Return to Never Land": { r: "G", s: 5.7, d: 72 },
            "Tarzan & Jane": { r: "G", s: 5.5, d: 72 },
            "Stuart Little 2": { r: "PG", s: 5.9, d: 78 },
            "The Jungle Book 2": { r: "G", s: 5.7, d: 72 },
            "Atlantis: Milo's Return": { r: "PG", s: 5.4, d: 72 },
            "Stitch! The Movie": { r: "PG", s: 5.7, d: 60 },
            "The Lion King 1 1/2: Hakuna Matata": { r: "G", s: 6.7, d: 77 },
            "Mulan II": { r: "G", s: 5.2, d: 79 },
            "Stuart Little 3: Call of the Wild": { r: "G", s: 4.8, d: 75 },
            "Tarzan II": { r: "G", s: 5.5, d: 72 },
            "Kronk's New Groove": { r: "G", s: 6.0, d: 75 },
            "Lilo & Stitch 2: Stitch Has a Glitch": { r: "G", s: 5.8, d: 68 },
            "Bambi II": { r: "G", s: 6.7, d: 72 },
            "Brother Bear 2": { r: "G", s: 5.7, d: 73 },
            "Cinderella III": { r: "G", s: 6.7, d: 72 },
            "Shrek the Third": { r: "PG", s: 6.1, d: 92 },
            "Open Season 2": { r: "G", s: 5.1, d: 76 },
            "Madagascar: Escape 2 Africa": { r: "PG", s: 6.6, d: 89 },
            "Open Season 3": { r: "G", s: 4.9, d: 75 },
            "Shrek Forever After": { r: "PG", s: 6.3, d: 93 },
            "Cars 2": { r: "G", s: 6.2, d: 106 },
            "Kung Fu Panda 2": { r: "PG", s: 7.2, d: 91 },
            "Madagascar 3: Europe's Most Wanted": { r: "PG", s: 6.8, d: 93 },
            "Cloudy with a Chance of Meatballs 2": { r: "PG", s: 6.5, d: 94 },
            "The Smurfs 2": { r: "PG", s: 5.4, d: 105 },
            "How to Train Your Dragon 2": { r: "PG", s: 7.8, d: 102 },
            "Open Season: Scared Silly": { r: "G", s: 4.3, d: 85 },
            "Kung Fu Panda 3": { r: "PG", s: 7.1, d: 95 },
            "Smurfs: The Lost Village": { r: "PG", s: 6.0, d: 90 },
            "Surf's Up 2: WaveMania": { r: "PG", s: 4.8, d: 85 },
            "The Lego Movie 2: The Second Part": { r: "PG", s: 6.6, d: 107 },
            "Toy Story 4": { r: "G", s: 7.7, d: 100 },
            "Ralph Breaks the Internet": { r: "PG", s: 7.2, d: 112 },
            "Hotel Transylvania 3: Summer Vacation": { r: "PG", s: 6.3, d: 97 },
            "Frozen 2": { r: "PG", s: 7.4, d: 103 },
            "The Angry Birds Movie 2": { r: "PG", s: 6.5, d: 99 },
            "How to Train Your Dragon: The Hidden World": { r: "PG", s: 7.6, d: 104 },
            "Trolls World Tour": { r: "PG", s: 5.9, d: 90 },
            "The Croods: A New Age": { r: "PG", s: 7.4, d: 95 },
            "Spirit Untamed": { r: "PG", s: 5.7, d: 84 },
            "The Boss Baby: Family Business": { r: "PG", s: 5.9, d: 98 },
            "Peter Rabbit 2: The Runaway": { r: "PG", s: 6.7, d: 99 },
            "Hotel Transylvania: Transformania": { r: "PG", s: 5.9, d: 87 },
            "Trolls Band Together": { r: "PG", s: 6.1, d: 91 },
            "Kung Fu Panda 4": { r: "PG", s: 6.8, d: 94 },
            "Megamind vs. the Doom Syndicate": { r: "PG", s: 3.4, d: 92 },
            "Despicable Me 4": { r: "PG", s: 6.2, d: 95 },
            "Moana 2": { r: "PG", s: 7.5, d: 100 },
            "Zootopia 2": { r: "PG", s: 7.5, d: 108 },
            "The Bad Guys 2": { r: "PG", s: 6.5, d: 105 }
        };
    }

    async generateDB() {
        // 1. Fetch data from external JSON file
        const response = await fetch('movies.json');
        const rawData = await response.json();

        const customData = this.getFirst157Data();
        const officialData = this.getOfficialData();
        
        // Cloudinary URL (Updated)
        const baseUrl = "https://res.cloudinary.com/dk44bz8gn/image/fetch/f_auto,q_auto/https://raw.githubusercontent.com/BudyFaham/Cinekides/main/images/";

        return rawData.map((m, i) => {
            let r, s, d;
            if (customData[m.t]) {
                const data = customData[m.t];
                r = data.r; s = data.s; d = data.d;
            } else if (officialData[m.t]) {
                const data = officialData[m.t];
                r = data.r; s = data.s; d = data.d;
            } else {
                r = "G"; s = 7.0; d = 90;
            }

            let badgeColor;
            if (r === "Banned") {
                badgeColor = "#ef4444";
            } else if (r === "ALL" || r === "G" || r === "4+" || r === "5+") {
                badgeColor = "#22c55e";
            } else if (r === "PG" || r === "6+" || r === "7+" || r === "8+") {
                badgeColor = "#eab308";
            } else {
                badgeColor = "#f97316";
            }

            let durationDisplay = d;
            if (typeof d === 'number') {
                const hours = Math.floor(d / 60);
                const minutes = d % 60;
                durationDisplay = `${hours}h ${minutes}m`;
            }

            return {
                id: i + 1,
                title: m.t,
                studio: m.s,
                year: m.y,
                image: `${baseUrl}${i + 1}.jpg`,
                rating: r,
                badgeColor: badgeColor,
                score: s,
                duration: durationDisplay
            };
        });
    }

    applySavedPreferences() {
        if (this.dom.sortSelect) this.dom.sortSelect.value = this.state.sort;
        this.dom.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === this.state.filter);
        });
    }

    bindEvents() {
        this.dom.searchInput.addEventListener('input', this.debounce((e) => {
            this.state.search = e.target.value.toLowerCase();
            this.render();
        }, 300));

        this.dom.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.dom.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.state.filter = btn.dataset.filter;
                this.saveState();
                this.render();
            });
        });

        this.dom.sortSelect.addEventListener('change', (e) => {
            this.state.sort = e.target.value;
            this.saveState();
            this.render();
        });

        this.dom.resetBtn.addEventListener('click', () => this.reset());

        this.dom.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // إصلاح دالة debounce
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    saveState() {
        localStorage.setItem('cinekids_prefs', JSON.stringify({
            filter: this.state.filter,
            sort: this.state.sort
        }));
        // حفظ المفضلات
        localStorage.setItem('cinekids_favorites', JSON.stringify(this.state.favorites));
    }

    reset() {
        this.state.filter = 'all';
        this.state.sort = 'newest';
        this.state.search = '';
        this.dom.searchInput.value = '';
        this.applySavedPreferences();
        this.saveState();
        this.render();
    }

    // دالة التبديل للمفضلة
    toggleFavorite(movie) {
        const index = this.state.favorites.indexOf(movie.id);
        if (index === -1) {
            this.state.favorites.push(movie.id);
        } else {
            this.state.favorites.splice(index, 1);
        }
        this.saveState();
        // إذا كنا في وضع عرض المفضلة، يجب إعادة الرسم لإخفاء الفيلم المحذوف
        if (this.state.filter === 'favorites') {
            this.render();
        } else {
            // تحديث الزر فقط بدون إعادة تحميل كل شيء (أداء أفضل)
            const btn = document.getElementById(`fav-btn-${movie.id}`);
            if (btn) btn.classList.toggle('active');
        }
    }

    getFilteredAndSortedMovies() {
        let result = this.state.movies;
        if (this.state.search) {
            result = result.filter(m => m.title.toLowerCase().includes(this.state.search));
        }
        if (this.state.filter === 'favorites') {
            // فلتر المفضلات
            result = result.filter(m => this.state.favorites.includes(m.id));
        } else if (this.state.filter !== 'all') {
            result = result.filter(m => m.studio === this.state.filter);
        }
        const sortStrategies = {
            'newest': (a, b) => b.year - a.year,
            'oldest': (a, b) => a.year - b.year,
            'az': (a, b) => a.title.localeCompare(b.title),
            'rating': (a, b) => b.score - a.score
        };
        return [...result].sort(sortStrategies[this.state.sort]);
    }

    render() {
        const movies = this.getFilteredAndSortedMovies();
        this.dom.countBadge.innerText = `${movies.length} Movies`;
        this.dom.grid.innerHTML = '';
        const fragment = document.createDocumentFragment();
        if (movies.length === 0) {
            this.renderEmptyState(fragment);
        } else {
            movies.forEach((movie, index) => {
                const card = this.createMovieCard(movie, index);
                fragment.appendChild(card);
            });
        }
        this.dom.grid.appendChild(fragment);
    }

    renderEmptyState(fragment) {
        const div = document.createElement('div');
        div.className = 'empty-state';
        const msg = this.state.filter === 'favorites' ? "No favorites yet 💔" : "No movies found";
        const sub = this.state.filter === 'favorites' ? "Click the heart icon to add movies!" : "Try adjusting your search or filters";
        div.innerHTML = `
            <div class="empty-state-icon">${this.state.filter === 'favorites' ? '💔' : '🔍'}</div>
            <h3>${msg}</h3>
            <p>${sub}</p>
        `;
        fragment.appendChild(div);
    }

    createMovieCard(movie, index) {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.tabIndex = 0;
        card.style.transitionDelay = `${Math.min(index * 0.015, 0.5)}s`;
        const posterWrapper = document.createElement('div');
        posterWrapper.className = 'poster-wrapper';
        
        // 1. زر المفضلة
        const favBtn = document.createElement('button');
        favBtn.className = 'fav-btn';
        favBtn.id = `fav-btn-${movie.id}`;
        favBtn.setAttribute('aria-label', `Add ${movie.title} to favorites`);
        
        // SVG للقلب
        favBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" /></svg>`;
        
        if (this.state.favorites.includes(movie.id)) {
            favBtn.classList.add('active');
        }
        
        favBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // منع فتح تفاصيل الفيلم عند الضغط على الزر
            this.toggleFavorite(movie);
        });

        const badgesContainer = document.createElement('div');
        badgesContainer.className = 'badges-container';
        
        const ageBadge = document.createElement('span');
        ageBadge.className = 'age-badge';
        ageBadge.textContent = movie.rating;
        ageBadge.style.borderColor = movie.badgeColor;
        ageBadge.style.color = movie.badgeColor;
        
        const studioBadge = document.createElement('span');
        studioBadge.className = 'studio-badge';
        studioBadge.textContent = movie.studio;
        const studioColor = this.studioColors[movie.studio] || '#64748b';
        studioBadge.style.background = studioColor;
        
        if (['Illumination', 'Pixar', 'Laika'].includes(movie.studio)) {
            studioBadge.style.color = '#333';
        } else {
            studioBadge.style.color = '#fff';
        }
        
        badgesContainer.append(ageBadge, studioBadge);
        
        const img = document.createElement('img');
        img.src = movie.image;
        img.alt = movie.title;
        img.loading = 'lazy';
        
        // تحسين fallback image مع SVG inline
        img.onerror = function() {
            const bg = this.state.theme === 'dark' ? '%231e293b' : '%23ffffff';
            const text = this.state.theme === 'dark' ? '%23f8fafc' : '%230f172a';
            this.src = `data:image/svg+xml,${encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="400" height="600">
                    <rect fill="${bg}" width="400" height="600"/>
                    <text fill="${text}" font-family="Arial, sans-serif" font-size="24" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">${movie.title}</text>
                </svg>
            `)}`;
        }.bind(this);
        
        // إضافة الزر والبادجات للصورة
        posterWrapper.append(favBtn, badgesContainer, img);
        
        const content = document.createElement('div');
        content.className = 'card-content';
        
        const title = document.createElement('h3');
        title.className = 'movie-title';
        title.textContent = movie.title;
        title.title = movie.title;
        
        const year = document.createElement('span');
        year.className = 'movie-year';
        year.textContent = movie.year;
        
        const metaInfo = document.createElement('div');
        metaInfo.className = 'meta-info';
        
        const ratingBox = document.createElement('div');
        ratingBox.className = 'rating-box';
        ratingBox.innerHTML = `★ ${movie.score}`;
        
        const durationBox = document.createElement('div');
        durationBox.className = 'duration-box';
        
        durationBox.innerHTML = `
            <svg class="duration-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2A10,10 0 1,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 1,1 20,12A8,8 0 0,1 12,20M12.5,7H11V13L16.25,16.15L17,14.92L12.5,12.25V7Z" />
            </svg>
            ${movie.duration}
        `;
        
        metaInfo.append(ratingBox, durationBox);
        content.append(title, year, metaInfo);
        card.append(posterWrapper, content);
        
        requestAnimationFrame(() => {
            setTimeout(() => card.classList.add('visible'), 50);
        });
        
        return card;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MovieApp();
});
