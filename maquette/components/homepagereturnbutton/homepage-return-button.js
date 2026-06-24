class HomepageReturnButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        const response = await fetch(new URL('homepage-return-button.html', import.meta.url));
        const text = await response.text();
        const htmlDoc = new DOMParser().parseFromString(text, 'text/html');
        const template = htmlDoc.getElementById('homepage-return-button').content;

        this.shadowRoot.appendChild(template.cloneNode(true));

        const btn = this.shadowRoot.querySelector('button');
        const destination = this.getAttribute('lien') || '../homepage/homepage.html';
        
        btn.addEventListener('click', () => {
            window.location.href = destination;
        });
    }
}

customElements.define('homepage-return-button', HomepageReturnButton);