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

const $sevenStar = {};
$sevenStar.basics = {};

const TechniqueTypes = ['stances', 'handStrikes', 'blocks', 'kicks']

class ComboOptions {
    constructor(length, selectedBeltRanks, techniqueLimits) {
        this.length = length;
        this.ranks = selectedBeltRanks;
        this.limits = techniqueLimits;
    }
}

class Technique {
    constructor(name, rank, type) {
        this.name = name;
        this.rank = rank;
        this.type = type;
    }

    toString() {
        return `${beltIcons[this.rank]} ${this.name}`;
    }
}

class TechniqueLibrary {
    #techniques = [];

    constructor(ranks) {
        ranks.forEach(rank => {
            TechniqueTypes.forEach(type => {
                $sevenStar.basics[type][rank].forEach(tech => {
                    this.#techniques.push(new Technique(tech, rank, type));
                });
            });
        });
    }

    getRandomTechnique(filter, type, rank) {
        const typeFilter = type ? type.constructor === Set ? t => !type.has(t.type) : t => t.type === type : _ => true;
        const rankFilter = rank ? t => t.rank === rank : _ => true;
        const techniqueFilter = filter ? t => !filter.has(t) : _ => true;
        const availableTechniques = this.#techniques.filter(typeFilter).filter(rankFilter).filter(techniqueFilter);
        return availableTechniques.at(Math.random() * availableTechniques.length);
    }
}

class Combo {
    #techniques = new Set();
    #options;
    #maxedTypes = new Set();

    constructor(options) {
        this.library = new TechniqueLibrary(options.ranks);
        this.#options = options;
    }

    generateCombo() {
        this.#maxedTypes = new Set();

        TechniqueTypes.forEach(type => {
            for (let t = 0; t < this.#options.limits[type].min; t++) {
                this.#techniques.add(this.library.getRandomTechnique(this.#techniques, type));
            }

            if (this.#options.limits[type].min === this.#options.limits[type].max) {
                this.#maxedTypes.add(type);
            }
        });

        while (this.#techniques.size < this.#options.length) {
            const technique = this.library.getRandomTechnique(this.#techniques, this.#maxedTypes);
            this.#techniques.add(technique);

            const typeCount = this.#techniques.values().filter(t => t.type === technique.type).toArray().length;
            const typeMax = this.#options.limits[technique.type].max;
            if (typeCount >= typeMax) {
                this.#maxedTypes.add(technique.type);
            }
        }
    }

    getHtmlElements() {
        return this.#techniques.values().map(technique => {
            const techniqueEl = document.createElement('div');
            techniqueEl.textContent = technique;
            return techniqueEl
        });
    }
}

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

    const comboLengthSlider = document.getElementById('combo-length');
    const comboLengthDisplay = document.getElementById('combo-length-display');
    comboLengthSlider.addEventListener('input', () => {
        comboLengthDisplay.textContent = comboLengthSlider.value;
        saveSettings();
        validateMinMaxSettings();
    });

    document.getElementById('belt-rank').addEventListener('change', () => {
        enableBeltRanks();
        saveSettings();
    });

    document.getElementById('toggle-advanced-options').addEventListener('click', () => {
        const advancedOptions = document.getElementById('advanced-options');
        advancedOptions.style.display = advancedOptions.style.display === 'none' ? 'block' : 'none';
    });

    document.querySelectorAll('.range-inputs input[type="number"]').forEach(input => {
        input.addEventListener('input', () => {
            validateMinMaxSettings();
            saveSettings();
        });
    });

    document.querySelectorAll('.increase, .decrease').forEach(button => {
        button.addEventListener('click', event => {
            const type = event.target.getAttribute('data-type');
            const input = document.getElementById(type);
            let value = parseInt(input.value);

            const increasing = event.target.classList.contains('increase');
            increasing ? value++ : value--;

            const min = 0; //type.startsWith('min') ? 0 : parseInt(document.getElementById(type.replace('max', 'min')).value);
            const max = comboLengthSlider.value; // type.startsWith('max') ? comboLengthSlider.value : parseInt(document.getElementById(type.replace('min', 'max')).value);

            if (value >= min && value <= max) {
                input.value = value;
            } else if (value > max) {
                input.value = max;
            } else {
                input.value = min;
            }

            validateMinMaxSettings(type, increasing);
            saveSettings();
        });
    });

    document.querySelectorAll('.belt-rank-check').forEach(checkbox => {
        checkbox.addEventListener('change', saveSettings);
    });

    document.getElementById('generate-btn').addEventListener('click', generateCombo);
});

function enableBeltRanks() {
    const selectedBeltRank = document.getElementById('belt-rank').value;
    const selectedBeltRankIndex = beltRanks.indexOf(selectedBeltRank);

    document.querySelectorAll('.belt-rank-check').forEach((checkbox, index) => {
        checkbox.checked = index <= selectedBeltRankIndex;
        checkbox.disabled = index > selectedBeltRankIndex;
    });

    saveSettings();
}

function validateMinMaxSettings(type, increasing) {
    if (type && type.startsWith('max') && !increasing) {
        const minInput = document.getElementById(type.replace('max', 'min'));
        const maxInput = document.getElementById(type);
        minInput.value = maxInput.value;
    }

    const comboLength = parseInt(document.getElementById('combo-length').value);
    const minStances = parseInt(document.getElementById('min-stances').value);
    const minHandStrikes = parseInt(document.getElementById('min-hand-strikes').value);
    const minBlocks = parseInt(document.getElementById('min-blocks').value);
    const minKicks = parseInt(document.getElementById('min-kicks').value);
    const totalMin = minStances + minHandStrikes + minBlocks + minKicks;

    if (totalMin > comboLength) {
        displayError('Impossible to fulfill the minimum requirements with the selected combo length.');
    } else {
        clearError();
    }

    adjustMinMax('min-stances', 'max-stances', comboLength);
    adjustMinMax('min-hand-strikes', 'max-hand-strikes', comboLength);
    adjustMinMax('min-blocks', 'max-blocks', comboLength);
    adjustMinMax('min-kicks', 'max-kicks', comboLength);
}

function adjustMinMax(minId, maxId, comboLength) {
    const minInput = document.getElementById(minId);
    const maxInput = document.getElementById(maxId);

    if (parseInt(minInput.value) > parseInt(maxInput.value)) {
        maxInput.value = minInput.value;
    } else if (parseInt(maxInput.value) < parseInt(minInput.value)) {
        minInput.value = maxInput.value;
    }

    minInput.max = comboLength;
    maxInput.max = comboLength;
}

function generateCombo() {
    const comboLength = parseInt(document.getElementById('combo-length').value);
    const selectedBeltRanks = Array.from(document.querySelectorAll('.belt-rank-check:checked')).map(cb => cb.value);

    const techniqueLimits = {
        stances: { min: parseInt(document.getElementById('min-stances').value), max: parseInt(document.getElementById('max-stances').value) },
        handStrikes: { min: parseInt(document.getElementById('min-hand-strikes').value), max: parseInt(document.getElementById('max-hand-strikes').value) },
        blocks: { min: parseInt(document.getElementById('min-blocks').value), max: parseInt(document.getElementById('max-blocks').value) },
        kicks: { min: parseInt(document.getElementById('min-kicks').value), max: parseInt(document.getElementById('max-kicks').value) }
    };

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

function saveSettings() {
    const settings = {
        comboLength: document.getElementById('combo-length').value,
        beltRank: document.getElementById('belt-rank').value,
        minStances: document.getElementById('min-stances').value,
        maxStances: document.getElementById('max-stances').value,
        minHandStrikes: document.getElementById('min-hand-strikes').value,
        maxHandStrikes: document.getElementById('max-hand-strikes').value,
        minBlocks: document.getElementById('min-blocks').value,
        maxBlocks: document.getElementById('max-blocks').value,
        minKicks: document.getElementById('min-kicks').value,
        maxKicks: document.getElementById('max-kicks').value,
        beltRanks: Array.from(document.querySelectorAll('.belt-rank-check')).reduce((acc, cb) => {
            acc[cb.value] = cb.checked;
            return acc;
        }, {})
    };

    localStorage.setItem('kajukenboSettings', JSON.stringify(settings));
}

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('kajukenboSettings'));
    if (!settings) return;

    document.getElementById('combo-length').value = settings.comboLength;
    document.getElementById('combo-length-display').textContent = settings.comboLength;
    document.getElementById('belt-rank').value = settings.beltRank;

    document.getElementById('min-stances').value = settings.minStances;
    document.getElementById('max-stances').value = settings.maxStances;

    document.getElementById('min-hand-strikes').value = settings.minHandStrikes;
    document.getElementById('max-hand-strikes').value = settings.maxHandStrikes;

    document.getElementById('min-blocks').value = settings.minBlocks;
    document.getElementById('max-blocks').value = settings.maxBlocks;

    document.getElementById('min-kicks').value = settings.minKicks;
    document.getElementById('max-kicks').value = settings.maxKicks;

    document.querySelectorAll('.belt-rank-check').forEach(cb => {
        cb.checked = settings.beltRanks[cb.value];
        cb.disabled = beltRanks.indexOf(cb.value) > beltRanks.indexOf(settings.beltRank);
    });
}
