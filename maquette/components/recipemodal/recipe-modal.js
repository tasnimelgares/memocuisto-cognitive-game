class RecipeModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        const response = await fetch(new URL('recipe-modal.html', import.meta.url));
        const text = await response.text();
        const htmlDoc = new DOMParser().parseFromString(text, 'text/html');
        const template = htmlDoc.getElementById('recipe-modal-template').content;

        this.shadowRoot.appendChild(template.cloneNode(true));
        this.initEventListeners();
    }

    initEventListeners() {
    const btnValider = this.shadowRoot.querySelector('.btn-valider');
    const step1 = this.shadowRoot.getElementById('step-ingredients');
    const step2 = this.shadowRoot.getElementById('step-ready');
    const timerDisplay = this.shadowRoot.querySelector('.timer-text');

    if (btnValider) {
        btnValider.onclick = () => { // On utilise .onclick pour être sûr qu'il n'y a qu'un seul écouteur
            console.log("CLIC DÉTECTÉ !");
            
            if (step1 && step2) {
                step1.style.setProperty('display', 'none', 'important');
                step2.style.setProperty('display', 'block', 'important');
            }

            let timeLeft = 3; // On met 3 secondes pour tester vite
            if (timerDisplay) {
                timerDisplay.textContent = timeLeft;
                const countdown = setInterval(() => {
                    timeLeft--;
                    if (timeLeft > 0) {
                        timerDisplay.textContent = timeLeft;
                    } else {
                        timerDisplay.textContent = "GO !";
                        clearInterval(countdown);
                        setTimeout(() => { 
                            window.location.href = "../game/aisle.html"; 
                        }, 800);
                    }
                }, 1000);
            }
        };
    }

    const btnRetour = this.shadowRoot.querySelector('.btn-retour');
    if (btnRetour) {
        btnRetour.onclick = () => { this.style.display = "none"; };
    }
}

    show() {
        // Récupérer les étapes pour réinitialiser la vue
        const step1 = this.shadowRoot.getElementById('step-ingredients');
        const step2 = this.shadowRoot.getElementById('step-ready');
        
        // On s'assure de revenir à l'étape 1 à chaque ouverture
        step1.style.display = 'block';
        step2.style.display = 'none';
        this.style.display = 'block';
    }
}

customElements.define('recipe-modal', RecipeModal);