// init.js

const $sevenStar = {};
$sevenStar.basics = {};
$sevenStar.beltRanks = [
    'White Belt',
    'Orange Belt',
    'Purple Belt',
    'Blue Belt',
    'Green Belt',
    'Brown Belt'
];
$sevenStar.beltIcons = {
    'White Belt': '⚪',
    'Orange Belt': '🟠',
    'Purple Belt': '🟣',
    'Blue Belt': '🔵',
    'Green Belt': '🟢',
    'Brown Belt': '🟤'
};

document.addEventListener('DOMContentLoaded', () => {
    const loadingIndicator = document.getElementById('loading-indicator');
    loadingIndicator.style.display = 'block';

    fetch('basics.json')
        .then(response => response.json())
        .then(data => {
            $sevenStar.basics = data;
            loadingIndicator.style.display = 'none';
            loadSettings();
            enableBeltRanks();
        })
        .catch(error => {
            loadingIndicator.style.display = 'none';
            displayError('Error loading basics data');
            console.error('Error loading basics:', error);
        });

    document.getElementById('generate-btn').addEventListener('click', generateCombo);
    
});

function generateCombo() {
    const comboLength = parseInt(document.getElementById('combo-length').value);
    const selectedBeltRanks = Array.from(document.querySelectorAll('.belt-rank-check:checked')).map(cb => cb.value);

    const techniqueLimits = {
        stances: { min: parseInt(document.getElementById('min-stances').value), max: parseInt(document.getElementById('max-stances').value) },
        handStrikes: { min: parseInt(document.getElementById('min-hand-strikes').value), max: parseInt(document.getElementById('max-hand-strikes').value) },
        blocks: { min: parseInt(document.getElementById('min-blocks').value), max: parseInt(document.getElementById('max-blocks').value) },
        kicks: { min: parseInt(document.getElementById('min-kicks').value), max: parseInt(document.getElementById('max-kicks').value) }
    };

    const totalMin = getTotalMinTechniques();
    const totalMax = getTotalMaxTechinques();

    if (totalMin > comboLength) {
      displayError(`Minimum technique requirements (${totalMin}) are ABOVE current combo length of ${comboLength}.`);
    return;
    } else if (totalMax < comboLength) {
      displayError(`Maximum technique requirements (${totalMax}) are BELOW current combo length of ${comboLength}.`);
    return;
    }

    const comboOptions = new ComboOptions(comboLength, selectedBeltRanks, techniqueLimits);
    const combo = new Combo(comboOptions);

    combo.generateCombo();

    displayCombo(combo);
}

function displayCombo(combo) {
    const comboDisplay = document.getElementById('combo-display');
    comboDisplay.innerHTML = '';

    combo.getHtmlElements().forEach(el => comboDisplay.appendChild(el));

    clearError();
}

function displayError(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function clearError() {
    const errorMessage = document.getElementById('error-message');
    errorMessage.style.display = 'none';
}