// script.js
const beltRanks = [
    'White Belt',
    'Orange Belt',
    'Purple Belt',
    'Blue Belt',
    'Green Belt',
    'Brown Belt'
];

const beltIcons = {
    'White Belt': '⚪',
    'Orange Belt': '🟠',
    'Purple Belt': '🟣',
    'Blue Belt': '🔵',
    'Green Belt': '🟢',
    'Brown Belt': '🟤'
};

let basics = {};

document.addEventListener('DOMContentLoaded', () => {
    const loadingIndicator = document.getElementById('loading-indicator');
    loadingIndicator.style.display = 'block';

    fetch('basics.json')
        .then(response => response.json())
        .then(data => {
            basics = data;
            loadingIndicator.style.display = 'none';
        })
        .catch(error => {
            loadingIndicator.style.display = 'none';
            displayError('Error loading basics data');
            console.error('Error loading basics:', error);
        });

    const comboLengthSlider = document.getElementById('combo-length');
    const comboLengthDisplay = document.getElementById('combo-length-display');
    comboLengthSlider.addEventListener('input', () => {
        comboLengthDisplay.textContent = comboLengthSlider.value;
    });
});

document.getElementById('generate-btn').addEventListener('click', generateCombo);

function generateCombo() {
    const comboLength = parseInt(document.getElementById('combo-length').value);
    const selectedBeltRank = document.getElementById('belt-rank').value;

    if (comboLength < 1 || comboLength > 10) {
        displayError('Combo length must be between 1 and 10');
        return;
    }

    const types = ['stances', 'handStrikes', 'blocks', 'kicks'];
    const availableTechniques = {};

    // Build the map of available techniques
    types.forEach(type => {
        const availableBeltRanks = beltRanks.slice(0, beltRanks.indexOf(selectedBeltRank) + 1);
        availableBeltRanks.forEach(beltRank => {
            if (!availableTechniques[type]) {
                availableTechniques[type] = [];
            }
            basics[type][beltRank].forEach(technique => {
                availableTechniques[type].push({ beltRank, technique });
            });
        });
    });

    const combo = [];

    for (let i = 0; i < comboLength; i++) {
        const randomType = types[Math.floor(Math.random() * types.length)];
        const techniquesForType = availableTechniques[randomType];

        if (techniquesForType.length === 0) {
            displayError('No techniques available for the selected rank');
            return;
        }

        const randomIndex = Math.floor(Math.random() * techniquesForType.length);
        const selectedTechnique = techniquesForType.splice(randomIndex, 1)[0];
        combo.push(`${beltIcons[selectedTechnique.beltRank]} ${selectedTechnique.technique}`);
    }

    displayCombo(combo);
}

function displayCombo(combo) {
    const comboDisplay = document.getElementById('combo-display');
    comboDisplay.innerHTML = '';

    combo.forEach(move => {
        const moveElement = document.createElement('div');
        moveElement.textContent = move;
        comboDisplay.appendChild(moveElement);
    });

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
