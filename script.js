class MovieApp {
    constructor() {
        const savedState = JSON.parse(localStorage.getItem('cinekids_prefs')) || {};
        const savedTheme = localStorage.getItem('cinekids_theme') || 'dark';
        const savedFavorites = JSON.parse(localStorage.getItem('cinekids_favorites')) || [];
        // قراءة حالة ظهور قسم الترحيب (هل تم رؤيته من قبل؟)
        const hasSeenHero = localStorage.getItem('cinekids_hero_seen') === 'true';

        this.state = {
            movies: [],
            favorites: savedFavorites,
            filter: savedState.filter || 'all',
            sort: savedState.sort || 'newest',
            search: '',
            theme: savedTheme,
            heroSeen: hasSeenHero // حالة جديدة
        };

        this.dom = {
            grid: document.getElementById('moviesGrid'),
            countBadge: document.getElementById('countBadge'),
            searchInput: document.getElementById('searchInput'),
            sortSelect: document.getElementById('sortSelect'),
            filterBtns: document.querySelectorAll('.filter-btn'),
            logoBtn: document.getElementById('logoBtn'), 
            resetBtn: document.getElementById('resetBtn'),
            themeToggle: document.getElementById('themeToggle'),
            
            // عنصر قسم الترحيب
            heroSection: document.querySelector('.hero-section'),
            exploreBtn: document.getElementById('exploreBtn'),
            backToTopBtn: document.getElementById('backToTop'),
            
            // عناصر لوحة التحكم السرية
            adminModal: document.getElementById('adminModal'),
            closeAdmin: document.getElementById('closeAdmin'),
            adminForm: document.getElementById('addMovieForm'),
            jsonOutput: document.getElementById('jsonOutput'),
            resultArea: document.getElementById('resultArea'),
            imgNameSuggestion: document.getElementById('imgNameSuggestion'),
            copyBtn: document.getElementById('copyBtn')
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
        this.checkHeroVisibility(); // التحقق من ظهور الترحيب عند البدء
        this.state.movies = await this.generateDB();
        this.applySavedPreferences();
        this.bindEvents();
        this.render();
    }

    // دالة جديدة للتحكم في ظهور قسم الترحيب
    checkHeroVisibility() {
        if (this.state.heroSeen && this.dom.heroSection) {
            this.dom.heroSection.style.display = 'none';
        }
    }

    // دالة لإخفاء الترحيب وحفظ الحالة
    dismissHero() {
        if (this.dom.heroSection) {
            // تأثير حركي بسيط للاختفاء
            this.dom.heroSection.style.transition = 'opacity 0.5s ease, margin-top 0.5s ease';
            this.dom.heroSection.style.opacity = '0';
            this.dom.heroSection.style.marginTop = '-200px'; // سحب المحتوى للأعلى
            
            setTimeout(() => {
                this.dom.heroSection.style.display = 'none';
                this.dom.grid.scrollIntoView({ behavior: 'smooth' });
            }, 500);

            // حفظ الحالة في المتصفح
            this.state.heroSeen = true;
            localStorage.setItem('cinekids_hero_seen', 'true');
        }
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

    async generateDB() {
        const response = await fetch('movies.json');
        const rawData = await response.json();
        
        const baseUrl = "https://res.cloudinary.com/dk44bz8gn/image/fetch/f_auto,q_auto/https://raw.githubusercontent.com/BudyFaham/Cinekides/main/images/";

        return rawData.map((movieData) => {
            const { id, t, s, y, rating, score, duration } = movieData;

            let badgeColor = "#f97316"; 

            const ageNum = parseInt(rating.replace(/\D/g, '')) || 0;

            if (rating === "Banned" || rating === "+18") {
                badgeColor = "#ef4444"; 
            } else if (["ALL", "G"].includes(rating) || (ageNum > 0 && ageNum <= 5)) {
                badgeColor = "#22c55e"; 
            } else if (["PG"].includes(rating) || (ageNum >= 6 && ageNum <= 10)) {
                badgeColor = "#eab308"; 
            } 

            return {
                id: id,
                title: t,
                studio: s,
                year: y,
                image: `${baseUrl}${id}.jpg`,
                rating: rating,
                badgeColor: badgeColor,
                score: score,
                duration: duration
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
            const val = e.target.value;
            
            if (val === '5352009') {
                this.openAdminPanel();
                e.target.value = '';
            } else {
                this.state.search = val.toLowerCase();
                this.render();
            }
        }, 300));

        this.dom.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.dom.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.state.filter = btn.dataset.filter;
                
                this.state.search = '';
                this.dom.searchInput.value = '';

                this.saveState();
                this.render();
            });
        });

        this.dom.sortSelect.addEventListener('change', (e) => {
            this.state.sort = e.target.value;
            this.saveState();
            this.render();
        });

        if (this.dom.logoBtn) {
            this.dom.logoBtn.addEventListener('click', () => this.reset());
        }

        if (this.dom.resetBtn) {
            this.dom.resetBtn.addEventListener('click', () => {
                // ...
            });
        }
        
        this.dom.themeToggle.addEventListener('click', () => this.toggleTheme());

        // --- تعديل وظيفة زر Explore ---
        if (this.dom.exploreBtn) {
            this.dom.exploreBtn.addEventListener('click', () => {
                this.dismissHero(); // استدعاء دالة الإخفاء بدلاً من التمرير فقط
            });
        }
        // -----------------------------

        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                this.dom.backToTopBtn.classList.add('show');
            } else {
                this.dom.backToTopBtn.classList.remove('show');
            }
        });

        if (this.dom.backToTopBtn) {
            this.dom.backToTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        if (this.dom.closeAdmin) {
            this.dom.closeAdmin.addEventListener('click', () => {
                this.dom.adminModal.classList.remove('active');
            });
        }

        if (this.dom.adminForm) {
            this.dom.adminForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.generateMovieJSON();
            });
        }

        if (this.dom.copyBtn) {
            this.dom.copyBtn.addEventListener('click', () => {
                this.dom.jsonOutput.select();
                document.execCommand('copy');
                this.dom.copyBtn.textContent = "Copied! 👍";
                setTimeout(() => this.dom.copyBtn.textContent = "Copy JSON", 2000);
            });
        }
    }

    openAdminPanel() {
        this.dom.adminModal.classList.add('active');
        const nextImgNumber = this.state.movies.length + 1;
        this.dom.imgNameSuggestion.innerText = `${nextImgNumber}.jpg`;
    }

    generateMovieJSON() {
        const title = document.getElementById('mTitle').value;
        const studio = document.getElementById('mStudio').value;
        const year = parseInt(document.getElementById('mYear').value);
        const rating = document.getElementById('mRating').value;
        const score = parseFloat(document.getElementById('mScore').value);
        
        const hours = document.getElementById('mDurHours').value || '0';
        const minutes = document.getElementById('mDurMinutes').value || '0';
        
        let durationStr = "";
        if (parseInt(hours) > 0) {
            durationStr += `${hours}h `;
        }
        durationStr += `${minutes}m`;
        durationStr = durationStr.trim();

        const newMovieObj = {
            t: title,
            s: studio,
            y: year,
            rating: rating,
            score: score,
            duration: durationStr
        };

        const jsonString = ",\n" + JSON.stringify(newMovieObj, null, 4); 
        
        this.dom.resultArea.style.display = 'block';
        this.dom.jsonOutput.value = jsonString;
    }

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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    toggleFavorite(movie) {
        const index = this.state.favorites.indexOf(movie.id);
        if (index === -1) {
            this.state.favorites.push(movie.id);
        } else {
            this.state.favorites.splice(index, 1);
        }
        this.saveState();
        if (this.state.filter === 'favorites') {
            this.render();
        } else {
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
        
        const favBtn = document.createElement('button');
        favBtn.className = 'fav-btn';
        favBtn.id = `fav-btn-${movie.id}`;
        favBtn.setAttribute('aria-label', `Add ${movie.title} to favorites`);
        favBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" /></svg>`;
        
        if (this.state.favorites.includes(movie.id)) {
            favBtn.classList.add('active');
        }
        
        favBtn.addEventListener('click', (e) => {
            e.stopPropagation();
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
