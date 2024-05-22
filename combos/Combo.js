// Combo.js

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
        return `${$sevenStar.beltIcons[this.rank]} ${this.name}`;
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