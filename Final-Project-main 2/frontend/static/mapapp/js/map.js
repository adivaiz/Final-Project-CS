document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    if (darkModeToggle) {
        // Check for saved dark mode preference
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
            darkModeToggle.textContent = '☀️'; // Set to sun if dark mode is enabled
        } else {
            darkModeToggle.textContent = '🌙'; // Set to moon if dark mode is disabled
        }

        darkModeToggle.addEventListener('click', function() {
            if (document.body.classList.contains('dark-mode')) {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'disabled');
                darkModeToggle.textContent = '🌙'; // Change to moon
            } else {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'enabled');
                darkModeToggle.textContent = '☀️'; // Change to sun
            }
        });
    }
}); 