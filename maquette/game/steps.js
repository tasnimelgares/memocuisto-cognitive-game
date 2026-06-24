document.addEventListener("DOMContentLoaded", () => {
    
    // On récupère les deux colonnes
    const availableSteps = document.getElementById('available-steps');
    const playerRecipe = document.getElementById('player-recipe');
    
    const checkBtn = document.getElementById('check-btn');
    const resetBtn = document.getElementById('reset-btn');
    const feedback = document.getElementById('feedback');
    const retourContainer = document.getElementById('retour-container');

    let compteurClic = 1;

    if (typeof startGameTimer === "function") {
        startGameTimer([
            {time: 30, action: aideSimpleRecette},
            {time: 45, action: aideMoyenneRecette},
            {time: 55, action: aideForteRecette},
            {time: 65, action: aideCompleteRecette}
        ]);
    }

    // --- GESTION DU CLIC (DÉPLACEMENT) ---
    availableSteps.addEventListener('click', (e) => {
        const item = e.target.closest('.step-item');
        if (!item || item.classList.contains('selected')) return;

        // On marque comme sélectionné
        item.classList.add('selected');
        
        // Mise à jour du badge et de l'ordre utilisateur
        const badge = item.querySelector('.badge');
        badge.innerText = compteurClic;
        item.setAttribute('data-user-order', compteurClic);
        
        // On déplace l'élément dans la colonne de droite
        playerRecipe.appendChild(item);
        
        compteurClic++;
    });

    // --- BOUTON RECOMMENCER ---
    resetBtn.addEventListener('click', () => {
        compteurClic = 1;
        feedback.innerText = "";
        
        // On récupère toutes les étapes peu importe où elles sont
        const allItems = document.querySelectorAll('.step-item');
        allItems.forEach(item => {
            item.classList.remove('selected');
            item.removeAttribute('data-user-order');
            item.querySelector('.badge').innerText = "";
            item.style.boxShadow = "none";
            
            // On les remet toutes dans la colonne de gauche
            availableSteps.appendChild(item);
        });
    });

    // --- VÉRIFICATION ---
    checkBtn.addEventListener('click', () => {
        const itemsInRecipe = playerRecipe.querySelectorAll('.step-item');
        
        if (itemsInRecipe.length < 4) {
            feedback.innerText = "Il faut placer toutes les étapes dans la recette !";
            feedback.style.color = "#ff9800";
            return;
        }

        let isCorrect = true;
        itemsInRecipe.forEach((item) => {
            const expected = item.getAttribute('data-order');
            const userChoice = item.getAttribute('data-user-order');
            
            if (expected !== userChoice) {
                isCorrect = false;
            }
        });

        if (isCorrect) {
            feedback.innerText = "Félicitations ! Le gâteau est prêt ! 🎂";
            feedback.style.color = "#28a745";
            retourContainer.style.display = "block";
            checkBtn.style.display = "none";
            resetBtn.style.display = "none";
        } else {
            feedback.innerText = "L'ordre n'est pas bon. Cliquez sur 'Recommencer'.";
            feedback.style.color = "#dc3545";
        }
    });

    // --- AIDES PROGRESSIVES ---
    
    function aideSimpleRecette() {
        if(compteurClic === 1) {
            const step1 = document.querySelector('.step-item[data-order="1"]');
            if (step1) step1.style.boxShadow = "0 0 10px 3px #ffc107";
        }
    }

    function simulerClicSurEtape(numEtape) {
        const step = document.querySelector(`.step-item[data-order="${numEtape}"]`);
        // On vérifie qu'elle est encore dans la liste de gauche (pas encore sélectionnée)
        if (step && !step.classList.contains('selected')) {
            step.click(); 
        }
    }

    function aideMoyenneRecette() {
        resetBtn.click(); 
        simulerClicSurEtape(1);
    }

    function aideForteRecette() {
        resetBtn.click();
        simulerClicSurEtape(1);
        setTimeout(() => simulerClicSurEtape(2), 300);
    }

    function aideCompleteRecette() {
        resetBtn.click();
        setTimeout(() => simulerClicSurEtape(1), 200);
        setTimeout(() => simulerClicSurEtape(2), 400);
        setTimeout(() => simulerClicSurEtape(3), 600);
        setTimeout(() => simulerClicSurEtape(4), 800);
        
        setTimeout(() => {
            feedback.innerText = "Voici la recette complète !";
            feedback.style.color = "#007bff";
        }, 1000);
    }
});