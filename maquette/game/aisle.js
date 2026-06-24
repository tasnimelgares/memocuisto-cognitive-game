let correctPicks = 0;

setTimeout(() => {

    
    document.getElementById('supermarket-container').style.display = 'block';
    
    if (typeof startGameTimer === "function") {
        startGameTimer([
            {time:30, action: aideSimple},
            {time:45, action: aideMoyenne},
            {time:55, action: aideForte},
            {time:65, action: aideComplete}
        ]);
    }

}, 1);

// Gérer les clics sur les objets du supermarché
document.querySelectorAll('.item.hotspot').forEach(hotspot => {
    hotspot.addEventListener('click', function() {
        
        // Si ce n'est pas déjà sélectionné
        if (!this.classList.contains('selected')) {
            
            // Si on clique sur l'une des boîtes d'œufs, on sélectionne les deux !
            if (this.id.includes('eggs')) {
                document.getElementById('hotspot-eggs').classList.add('selected');
                document.getElementById('hotspot-eggs-top').classList.add('selected');
            } else {
                this.classList.add('selected');
            }
            
            correctPicks++;
            
            document.getElementById('feedback').innerText = "Très bien !";
            document.getElementById('feedback').style.color = "#28a745";
            
            // Victoire : Tous les produits trouvés
            if (correctPicks === 3) {
                document.getElementById('feedback').innerText = "Bravo, le caddie est plein !";
                document.getElementById('next-btn').style.display = 'block';
            }
        } 
    });
});

// SYSTÈME D'AIDES PROGRESSIVES

function aideSimple(){
    const farine = document.getElementById('hotspot-flour');
    if(farine && !farine.classList.contains("selected")){
        farine.style.border = "4px solid #ffc107";
        farine.style.boxShadow = "0 0 15px #ffc107";
    }
}

function aideMoyenne(){
    const farine = document.getElementById('hotspot-flour');
    if(farine && !farine.classList.contains("selected")){
        farine.click();
    }
}

function aideForte(){
    aideMoyenne();
    const chocolat = document.getElementById('hotspot-chocolate');
    if(chocolat && !chocolat.classList.contains("selected")){
        chocolat.click();
    }
}

function aideComplete(){
    // On simule un clic sur chaque élément non sélectionné
    document.querySelectorAll('.item.hotspot').forEach(el => {
        if(!el.classList.contains("selected")){
            el.click();
        }
    });

    document.getElementById('feedback').innerText = "Voici les ingrédients de la liste, bel effort !";
    document.getElementById('feedback').style.color = "#007bff";
} 