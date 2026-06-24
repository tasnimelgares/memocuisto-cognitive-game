class IngredientItem extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        const response = await fetch(new URL('ingredient-item.html', import.meta.url));
        const text = await response.text();
        const htmlDoc = new DOMParser().parseFromString(text, 'text/html');
        
        const template = htmlDoc.getElementById('ingredient-item-template').content;

        this.shadowRoot.appendChild(template.cloneNode(true));
        this.render();
    }

    render() {
        const img = this.shadowRoot.querySelector('img');
        const p = this.shadowRoot.querySelector('p');

        // On récupère les attributs passés au composant
        const src = this.getAttribute('src') || '';
        const label = this.getAttribute('label') || '';

        img.src = src;
        img.alt = label;
        p.textContent = label;
    }
}

customElements.define('ingredient-item', IngredientItem);