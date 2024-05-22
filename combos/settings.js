// settings.js

document.addEventListener('DOMContentLoaded', () => {
  loadDarkModePreference();
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
          }

          validateMinMaxSettings(type, increasing);
          saveSettings();
      });
  });

  document.querySelectorAll('.belt-rank-check').forEach(checkbox => {
      checkbox.addEventListener('change', saveSettings);
  });

  const darkModeToggle = document.getElementById('toggle-dark-mode');
  darkModeToggle.checked = document.body.classList.contains('dark-mode');
  darkModeToggle.addEventListener('change', () => {
      document.body.classList.toggle('dark-mode');
      saveDarkModePreference();
  });
});

function saveDarkModePreference() {
  const isDarkMode = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
}

function loadDarkModePreference() {
  const darkMode = localStorage.getItem('darkMode');
  if (darkMode === 'enabled') {
      document.body.classList.add('dark-mode');
  }
}

function enableBeltRanks() {
  const selectedBeltRank = document.getElementById('belt-rank').value;
  const selectedBeltRankIndex = $sevenStar.beltRanks.indexOf(selectedBeltRank);

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
      if (minInput.value > maxInput.value) {
        minInput.value = maxInput.value;
      }
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
      cb.disabled = $sevenStar.beltRanks.indexOf(cb.value) > $sevenStar.beltRanks.indexOf(settings.beltRank);
  });
}
