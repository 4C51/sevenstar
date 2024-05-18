// script.js
const beltRanks = [
    'White Belt',
    'Orange Belt',
    'Purple Belt',
    'Blue Belt',
    'Green Belt',
    'Brown Belt'
];

let basics = {};

fetch('basics.json')
    .then(response => response.json())
    .then(data => {
        basics = data;
    })
    .catch(error => console.error('Error loading basics:', error));

document.getElementById('generate-btn').addEventListener('click', generateCombo);

function generateCombo() {
    const comboLength = parseInt(document.getElementById('combo-length').value);
    const selectedBeltRank = document.getElementById('belt-rank').value;
    const types = ['stances', 'handStrikes', 'blocks', 'kicks'];
    const combo = [];

    for (let i = 0; i < comboLength; i++) {
        const randomType = types[Math.floor(Math.random() * types.length)];
        const availableBeltRanks = beltRanks.slice(0, beltRanks.indexOf(selectedBeltRank) + 1);
        const randomBeltRank = availableBeltRanks[Math.floor(Math.random() * availableBeltRanks.length)];
        const techniques = basics[randomType][randomBeltRank];
        const randomTechnique = techniques[Math.floor(Math.random() * techniques.length)];
        combo.push(randomTechnique);
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
}
