// ChessTutor - User Progress Tracking System
// This file implements a simple progress tracking system using localStorage

class ChessProgress {
    constructor() {
        this.storageKey = 'chesstutor_progress';
        this.userData = this.loadUserData();
    }
    
    // Load user data from localStorage
    loadUserData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : this.getDefaultData();
        } catch (error) {
            console.error('Error loading user progress:', error);
            return this.getDefaultData();
        }
    }
    
    // Save user data to localStorage
    saveUserData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.userData));
            return true;
        } catch (error) {
            console.error('Error saving user progress:', error);
            return false;
        }
    }
    
    // Get default user data structure
    getDefaultData() {
        return {
            lastVisit: new Date().toISOString(),
            pagesVisited: [],
            puzzlesSolved: 0,
            totalScore: 0,
            lessonsCompleted: [],
            practiceTime: 0, // in minutes
            streak: 0,
            level: 1,
            achievements: [],
            preferences: {
                theme: 'light',
                soundEnabled: true,
                autoSave: true
            }
        };
    }
    
    // Track page visit
    trackPageVisit(pageName) {
        const now = new Date().toISOString();
        this.userData.lastVisit = now;
        
        if (!this.userData.pagesVisited.includes(pageName)) {
            this.userData.pagesVisited.push(pageName);
        }
        
        // Update streak
        this.updateStreak();
        
        // Award points for visiting new pages
        if (!this.userData.lessonsCompleted.includes(pageName)) {
            this.userData.totalScore += 5;
            this.userData.lessonsCompleted.push(pageName);
        }
        
        this.saveUserData();
    }
    
    // Update streak (consecutive days of activity)
    updateStreak() {
        const lastVisit = new Date(this.userData.lastVisit);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Check if last visit was yesterday or today
        if (this.isSameDay(lastVisit, yesterday) || this.isSameDay(lastVisit, today)) {
            if (!this.isSameDay(lastVisit, today)) {
                this.userData.streak += 1;
            }
        } else if (!this.isSameDay(lastVisit, today)) {
            this.userData.streak = 1;
        }
    }
    
    // Check if two dates are the same day
    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
    
    // Record puzzle completion
    recordPuzzleCompletion(difficulty = 'medium') {
        this.userData.puzzlesSolved += 1;
        
        // Award points based on difficulty
        const points = {
            'easy': 10,
            'medium': 20,
            'hard': 30
        };
        
        this.userData.totalScore += points[difficulty] || 10;
        
        // Check for level up
        this.checkLevelUp();
        
        // Award achievement for first puzzle
        if (this.userData.puzzlesSolved === 1) {
            this.awardAchievement('first_puzzle', 'Primer puzzle resuelto');
        }
        
        // Award achievement for 10 puzzles
        if (this.userData.puzzlesSolved === 10) {
            this.awardAchievement('puzzle_master', '10 puzzles resueltos');
        }
        
        this.saveUserData();
    }
    
    // Record practice time
    recordPracticeTime(minutes = 1) {
        this.userData.practiceTime += minutes;
        
        // Award achievement for 1 hour of practice
        if (this.userData.practiceTime >= 60 && this.userData.practiceTime - minutes < 60) {
            this.awardAchievement('dedicated_student', '1 hora de práctica');
        }
        
        this.saveUserData();
    }
    
    // Check if user should level up
    checkLevelUp() {
        const currentLevel = this.userData.level;
        const requiredScore = currentLevel * 100; // 100 points per level
        
        if (this.userData.totalScore >= requiredScore) {
            this.userData.level += 1;
            
            // Award achievement for leveling up
            this.awardAchievement(`level_${this.userData.level}`, `Nivel ${this.userData.level} alcanzado`);
            
            return true;
        }
        
        return false;
    }
    
    // Award achievement
    awardAchievement(id, name, description = '') {
        if (!this.userData.achievements.find(a => a.id === id)) {
            this.userData.achievements.push({
                id: id,
                name: name,
                description: description,
                date: new Date().toISOString()
            });
            
            // Award bonus points
            this.userData.totalScore += 25;
            
            // Show notification if available
            if (typeof showNotification === 'function') {
                showNotification(`¡Logro desbloqueado: ${name}!`, 'success');
            }
            
            return true;
        }
        
        return false;
    }
    
    // Get progress percentage for a category
    getProgressPercentage(category = 'all') {
        switch (category) {
            case 'pages':
                const totalPages = 12; // Total number of pages
                return Math.round((this.userData.pagesVisited.length / totalPages) * 100);
            
            case 'level':
                const currentLevel = this.userData.level;
                const requiredScore = currentLevel * 100;
                const progress = (this.userData.totalScore % 100) / 100;
                return Math.round(progress * 100);
            
            case 'achievements':
                const totalAchievements = 20; // Estimated total achievements
                return Math.round((this.userData.achievements.length / totalAchievements) * 100);
            
            default:
                return 0;
        }
    }
    
    // Get user statistics
    getStats() {
        return {
            level: this.userData.level,
            score: this.userData.totalScore,
            puzzlesSolved: this.userData.puzzlesSolved,
            pagesVisited: this.userData.pagesVisited.length,
            streak: this.userData.streak,
            practiceTime: this.userData.practiceTime,
            achievements: this.userData.achievements.length
        };
    }
    
    // Reset progress (with confirmation)
    resetProgress() {
        if (confirm('¿Estás seguro de que quieres reiniciar todo tu progreso? Esta acción no se puede deshacer.')) {
            this.userData = this.getDefaultData();
            this.saveUserData();
            return true;
        }
        return false;
    }
    
    // Export progress data
    exportProgress() {
        const dataStr = JSON.stringify(this.userData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `chesstutor_progress_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
    
    // Import progress data
    importProgress(jsonData) {
        try {
            const importedData = JSON.parse(jsonData);
            // Validate data structure
            if (importedData && importedData.storageKey === this.storageKey) {
                this.userData = importedData;
                this.saveUserData();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error importing progress:', error);
            return false;
        }
    }
}

// Initialize progress tracker
const progressTracker = new ChessProgress();

// Auto-track page visits
$(document).ready(function() {
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    progressTracker.trackPageVisit(currentPage);
    
    // Record practice time every minute
    setInterval(() => {
        progressTracker.recordPracticeTime(1);
    }, 60000); // Every minute
    
    // Add progress indicator to UI
    if (document.getElementById('progress-indicator')) {
        updateProgressIndicator();
    }
});

// Update progress indicator in UI
function updateProgressIndicator() {
    const indicator = document.getElementById('progress-indicator');
    if (!indicator) return;
    
    const stats = progressTracker.getStats();
    
    indicator.innerHTML = `
        <div class="progress-stats">
            <span class="badge bg-primary">Nivel ${stats.level}</span>
            <span class="badge bg-success">${stats.score} pts</span>
            <span class="badge bg-info">${stats.puzzlesSolved} puzzles</span>
            <span class="badge bg-warning">${stats.streak} días racha</span>
        </div>
    `;
}

// Progress dashboard function
function showProgressDashboard() {
    const stats = progressTracker.getStats();
    const progressPages = progressTracker.getProgressPercentage('pages');
    const progressLevel = progressTracker.getProgressPercentage('level');
    
    const dashboardHTML = `
        <div class="modal fade" id="progressModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Tu Progreso en ChessTutor</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6>Estadísticas Generales</h6>
                                <ul class="list-group">
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        Nivel
                                        <span class="badge bg-primary">${stats.level}</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        Puntuación Total
                                        <span class="badge bg-success">${stats.score}</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        Puzzles Resueltos
                                        <span class="badge bg-info">${stats.puzzlesSolved}</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        Páginas Visitadas
                                        <span class="badge bg-secondary">${stats.pagesVisited}</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        Racha Actual
                                        <span class="badge bg-warning">${stats.streak} días</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        Tiempo de Práctica
                                        <span class="badge bg-dark">${stats.practiceTime} min</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        Logros
                                        <span class="badge bg-primary">${stats.achievements}</span>
                                    </li>
                                </ul>
                            </div>
                            <div class="col-md-6">
                                <h6>Progreso</h6>
                                <div class="mb-3">
                                    <label class="form-label">Exploración del Sitio</label>
                                    <div class="progress">
                                        <div class="progress-bar" role="progressbar" style="width: ${progressPages}%" aria-valuenow="${progressPages}" aria-valuemin="0" aria-valuemax="100">${progressPages}%</div>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Progreso de Nivel</label>
                                    <div class="progress">
                                        <div class="progress-bar bg-success" role="progressbar" style="width: ${progressLevel}%" aria-valuenow="${progressLevel}" aria-valuemin="0" aria-valuemax="100">${progressLevel}%</div>
                                    </div>
                                </div>
                                
                                <h6 class="mt-4">Logros Recientes</h6>
                                <div id="recent-achievements">
                                    ${progressTracker.userData.achievements.slice(-3).map(a => `
                                        <div class="alert alert-success py-2">
                                            <strong>${a.name}</strong><br>
                                            <small>${new Date(a.date).toLocaleDateString()}</small>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" onclick="progressTracker.exportProgress()">Exportar Progreso</button>
                        <button type="button" class="btn btn-outline-danger" onclick="progressTracker.resetProgress()">Reiniciar Progreso</button>
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = dashboardHTML;
    document.body.appendChild(modalContainer);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('progressModal'));
    modal.show();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChessProgress;
}