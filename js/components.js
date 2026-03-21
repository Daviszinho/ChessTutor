// ChessTutor - Reusable Components
// This file contains functions to load reusable HTML components

// Navigation bar component
function loadNavbar(activePage = '') {
    const navbarHTML = `
        <header>
            <nav class="navbar navbar-expand-sm navbar-toggleable-sm navbar-light bg-white border-bottom box-shadow mb-3">
                <div class="container-fluid">
                    <a class="navbar-brand" href="index.html">ChessTutor</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="navbar-collapse collapse d-sm-inline-flex justify-content-between" id="navbarNav">
                        <ul class="navbar-nav flex-grow-1">
                            <li class="nav-item"><a class="nav-link text-dark ${activePage === 'index' ? 'active' : ''}" href="index.html">Inicio</a></li>
                            <li class="nav-item"><a class="nav-link text-dark ${activePage === 'piezas' ? 'active' : ''}" href="inicio.html">Piezas</a></li>
                            <li class="nav-item"><a class="nav-link text-dark ${activePage === 'movimiento' ? 'active' : ''}" href="movimiento.html">Movimiento</a></li>
                            <li class="nav-item"><a class="nav-link text-dark ${activePage === 'capturar' ? 'active' : ''}" href="capturar.html">Capturar</a></li>
                            <li class="nav-item"><a class="nav-link text-dark ${activePage === 'extraordinarios' ? 'active' : ''}" href="extraordinarios.html">Extraordinarios</a></li>
                            <li class="nav-item"><a class="nav-link text-dark ${activePage === 'ritmo' ? 'active' : ''}" href="ritmo.html">Ritmo</a></li>
                            <li class="nav-item"><a class="nav-link text-dark ${activePage === 'nomenclatura' ? 'active' : ''}" href="nomenclatura.html">Nomenclatura</a></li>
                            <li class="nav-item"><a class="nav-link text-dark ${activePage === 'estrategia' ? 'active' : ''}" href="estrategia.html">Estrategia</a></li>
                            <li class="nav-item"><a class="nav-link text-dark ${activePage === 'historia' ? 'active' : ''}" href="historia.html">Historia</a></li>
                            <li class="nav-item"><a class="nav-link text-dark ${activePage === 'ejercicios' ? 'active' : ''}" href="ejercicios.html">Chess Enigma</a></li>
                            <li class="nav-item"><a class="nav-link text-dark ${activePage === 'ecoviewer' ? 'active' : ''}" href="ecoviewer.html">ECO Viewer</a></li>
                            <li class="nav-item"><a class="nav-link text-dark ${activePage === 'jugar' ? 'active' : ''}" href="jugar.html">Jugar contra IA</a></li>
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    `;
    return navbarHTML;
}

// Footer component
function loadFooter() {
    const currentYear = new Date().getFullYear();
    const footerHTML = `
        <footer class="border-top footer text-muted">
            <div class="container"><br>
                &copy; <span class="footer-year">${currentYear}</span> - ChessTutor - Desarrollado por Davis Penaranda Zarate - v2.0.0
            </div>
        </footer>
    `;
    return footerHTML;
}

// Card component
function loadCard(title, content, footer = '', cardClass = '') {
    const cardHTML = `
        <div class="card ${cardClass} shadow-soft">
            ${title ? `<div class="card-header"><h3 class="card-title mb-0">${title}</h3></div>` : ''}
            <div class="card-body">
                ${content}
            </div>
            ${footer ? `<div class="card-footer">${footer}</div>` : ''}
        </div>
    `;
    return cardHTML;
}

// Alert component
function loadAlert(message, type = 'info', dismissible = false) {
    const alertHTML = `
        <div class="alert alert-${type} ${dismissible ? 'alert-dismissible fade show' : ''}" role="alert">
            ${message}
            ${dismissible ? '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' : ''}
        </div>
    `;
    return alertHTML;
}

// Loading spinner component
function loadSpinner(message = 'Cargando...') {
    const spinnerHTML = `
        <div class="text-center my-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">${message}</p>
        </div>
    `;
    return spinnerHTML;
}

// Initialize components when DOM is ready
$(document).ready(function() {
    // Initialize tooltips
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    // Initialize popovers
    if (typeof bootstrap !== 'undefined' && bootstrap.Popover) {
        var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
        var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
            return new bootstrap.Popover(popoverTriggerEl);
        });
    }
});

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadNavbar,
        loadFooter,
        loadCard,
        loadAlert,
        loadSpinner
    };
}