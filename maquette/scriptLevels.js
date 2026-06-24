//LOGIQUE DE LA PAGE : CHOIX DU NIVEAU

document.addEventListener('DOMContentLoaded', () => {
    // 1. Déclaration des les variables nécessaires

    // Éléments de filtrage
    const radios = document.querySelectorAll('input[type="radio"]');
    const recipes = document.querySelectorAll('recipe-card');
    const resetBtn = document.getElementById('reset-filters');

    
    const modal = document.getElementById('recipe-modal');

    // 2. Fonction de filtrage
    function filterRecipes() {
        const activeDiff = document.querySelector('input[name="difficulty"]:checked')?.value;
        const activeCat = document.querySelector('input[name="category"]:checked')?.value;

        recipes.forEach(recipe => {
            const recipeDiff = recipe.getAttribute('difficulty');
            const recipeCat = recipe.getAttribute('category');

            const matchDiff = !activeDiff || recipeDiff == activeDiff;
            const matchCat = !activeCat || recipeCat == activeCat;

            recipe.style.display = (matchDiff && matchCat) ? "block" : "none";
        });
    }

    // 3. Écouteurs d'événements
    resetBtn.addEventListener('click', () => {
        radios.forEach(radio => radio.checked = false);
        filterRecipes();
    });

    //Déclenchement du filtre à chaque changement de radio
    radios.forEach(radio => {
        radio.addEventListener('change', filterRecipes);
    });

    // Gestion click sur la recette gâteau au chocolat
    document.addEventListener('recipe-selected', (event) => {
        const data = event.detail; // On récupère les infos envoyées (src, difficulty...)
        console.log("Recette choisie :", data.alt);
        
        if(data.alt == "gâteauAuChocolat"){
            modal.show();
        }
    });

});