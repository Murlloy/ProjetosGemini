document.addEventListener('DOMContentLoaded', () => {
    const screens = document.querySelectorAll('.screen');
    const navigationElements = document.querySelectorAll('[data-navigate-to]');

    function showScreen(screenId) {
        screens.forEach(screen => {
            screen.classList.remove('active');
        });
        const activeScreen = document.getElementById(screenId);
        if (activeScreen) {
            activeScreen.classList.add('active');
            // Scroll to top of new screen
            activeScreen.scrollTop = 0; 
            if (activeScreen.querySelector('main')) {
                activeScreen.querySelector('main').scrollTop = 0;
            }
        } else {
            console.warn(`Screen with ID "${screenId}" not found.`);
        }
    }

    navigationElements.forEach(element => {
        element.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default if it's a link
            const targetScreenId = element.getAttribute('data-navigate-to');
            if (targetScreenId) {
                showScreen(targetScreenId);
            }
        });
    });

    // Special handling for footer nav items to update active state
    const mainNavItems = document.querySelectorAll('.main-nav .nav-item');
    mainNavItems.forEach(item => {
        item.addEventListener('click', () => {
            // If it's a navigation item (has data-navigate-to), it's handled above
            // This is just to set active class for the footer
            if (!item.hasAttribute('data-navigate-to')) { // Only for non-navigating items like Home
                 mainNavItems.forEach(i => i.classList.remove('active-nav'));
                 item.classList.add('active-nav');
            } else { // For items that do navigate, ensure "Home" is not active unless it is Home
                const target = item.getAttribute('data-navigate-to');
                if (target === 'screen-topics') { // if navigating to home
                    mainNavItems.forEach(i => i.classList.remove('active-nav'));
                    item.classList.add('active-nav');
                } else { // if navigating away from home
                    document.querySelector('.main-nav .nav-item.active-nav')?.classList.remove('active-nav');
                    // Potentially highlight the "Talk" icon if that's the one clicked
                    // For simplicity, just removing active from Home here
                }
            }
        });
    });
    
    // Initial screen
    showScreen('screen-topics');
});