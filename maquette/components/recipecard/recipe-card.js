class RecipeCard extends HTMLElement{
    constructor(){
        super();
        this.attachShadow({ mode: 'open' });
    }
    static get observedAttributes() {
        return ['src', 'alt', 'category', 'difficulty'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        // Si la valeur change, on relance le rendu
        if (oldValue !== newValue) {
            this.render();
        }
    }
    async connectedCallback() {
        // Charger le fichier HTML externe
        const response = await fetch(new URL('recipe-card.html', import.meta.url));
        const text = await response.text();

        // Transformer le texte en nœuds DOM
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(text, 'text/html');
        const template = htmlDoc.getElementById('recipe-card-template').content;

        // Cloner le template dans le Shadow DOM
        this.shadowRoot.appendChild(template.cloneNode(true));
        const img = this.shadowRoot.querySelector('img');
        
        img.addEventListener('click', () => {
            // On crée un événement personnalisé nommé "recipe-selected"
            const event = new CustomEvent('recipe-selected', {
                detail: { 
                    src: this.getAttribute('src'),
                    alt: this.getAttribute('alt'),
                    difficulty: this.getAttribute('difficulty'),
                    category: this.getAttribute('category')
                },
                bubbles: true,      // Permet à l'événement de remonter dans le DOM
                composed: true      // Permet à l'événement de traverser la frontière du Shadow DOM
            });

            this.dispatchEvent(event);
        });

        // Une fois le DOM injecté, on remplit les données
        this.render();
    }

    render() {
        const img = this.shadowRoot.querySelector('img');
        const pDifficulty = this.shadowRoot.getElementById('dish-difficulty');
        const pCategory = this.shadowRoot.getElementById('dish-category');

        if (img) {
            img.src = this.getAttribute('src') || '';
            img.alt = this.getAttribute('alt') || 'Recette';
            img.dataset.category = this.getAttribute('category') || '';
            img.dataset.difficulty = this.getAttribute('difficulty') || '';
        }
        if (pDifficulty) {
            pDifficulty.textContent = `${this.getAttribute('difficulty') || ''} ingrédients`;
        }
        if (pCategory) {
            pCategory.textContent = `${this.getAttribute('category') || ''}`;
        }
    }
}

// Saving the new HTML tag
customElements.define('recipe-card',RecipeCard);
