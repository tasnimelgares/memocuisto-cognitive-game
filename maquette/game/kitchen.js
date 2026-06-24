document.addEventListener("DOMContentLoaded", () => {
    
    const draggables = document.querySelectorAll('.draggable');
    const dropzones = document.querySelectorAll('.dropzone');
    const kitchenImage = document.getElementById('kitchen-image');
    
    // 1. Suivi de ce qui a été rangé
    const etatRangement = {
        oeuf: false,
        farine: false,
        chocolat: false
    };

    // 2. Dictionnaire des images 
    const imagesCuisine = {
        "rien": "../images/vide.jpeg",
        "oeuf": "../images/oeufs.jpeg", 
        "farine": "../images/farine.jpeg",
        "chocolat": "../images/choco.jpeg", 
        "oeuf_farine": "../images/oeufs-farine.jpeg",
        "oeuf_chocolat": "../images/oeufs-choco.jpeg", 
        "farine_chocolat": "../images/choco-farine.jpeg",
        "oeuf_farine_chocolat": "../images/tout.jpeg"
    };

    // Fonction pour mettre à jour l'image en fonction de l'état
    function actualiserImageCuisine() {
        let cles = [];
        // L'ordre est important pour correspondre au dictionnaire (oeuf, puis farine, puis chocolat)
        if (etatRangement.oeuf) cles.push("oeuf");
        if (etatRangement.farine) cles.push("farine");
        if (etatRangement.chocolat) cles.push("chocolat");

        let nomCle = cles.length === 0 ? "rien" : cles.join("_");
        
        if (imagesCuisine[nomCle]) {
            kitchenImage.src = imagesCuisine[nomCle];
        }
    }

    // Initialisation du timer 
    if (typeof startGameTimer === "function") {
        startGameTimer([
            {time:30, action: aideSimpleCuisine},
            {time:45, action: aideMoyenneCuisine},
            {time:55, action: aideForteCuisine},
            {time:65, action: aideCompleteCuisine}
        ]);
    }

    // GESTION DU DRAG & DROP 
    draggables.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            // .closest('.draggable') garantit qu'on récupère l'ID de la DIV, 
            // même si on a cliqué sur l'IMG à l'intérieur.
            const targetId = e.target.closest('.draggable').id;
            e.dataTransfer.setData('text/plain', targetId);
        });
    });

    dropzones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault(); 
            zone.classList.add('hover');
        });

        zone.addEventListener('dragleave', () => zone.classList.remove('hover'));

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('hover');
            
            const draggedId = e.dataTransfer.getData('text/plain');
            const draggedElement = document.getElementById(draggedId);
            
            const itemType = draggedElement.getAttribute('data-type');
            const zoneType = zone.getAttribute('data-type');

            if (itemType === zoneType) {
                // Au lieu de l'ajouter dans la zone, on le cache
                draggedElement.style.display = 'none';
                
                // On met à jour l'état et l'image
                etatRangement[draggedId] = true;
                actualiserImageCuisine();

                document.getElementById('feedback').innerText = "Parfait !";
                document.getElementById('feedback').style.color = "#28a745";
                
                // Vérification de fin
                if(etatRangement.oeuf && etatRangement.farine && etatRangement.chocolat) {
                    document.getElementById('feedback').innerText = "Tout est bien rangé !";
                    document.getElementById('next-btn').style.display = 'inline-block';
                }
            } else {
                document.getElementById('feedback').innerText = "Oups, ce n'est pas sa place.";
                document.getElementById('feedback').style.color = "#dc3545";
            }
        });
    });

    // SYSTÈME D'AIDES PROGRESSIVES
    // Les aides doivent maintenant mettre à jour l'état et l'image directement, et cacher l'objet

    function validerObjetAutomatiquement(id) {
        const obj = document.getElementById(id);
        if(obj && obj.style.display !== 'none') {
            obj.style.display = 'none';
            etatRangement[id] = true;
            actualiserImageCuisine();
        }
    }

    function aideSimpleCuisine(){
        const chocolat = document.getElementById("chocolat");
        const placard = document.getElementById("placard");
        if(chocolat && chocolat.style.display !== 'none') {
            chocolat.style.backgroundColor = "#94ec9b";
            placard.style.boxShadow = "inset 0 0 20px #28a745"; 
        }
    }

    function aideMoyenneCuisine(){
        const placard = document.getElementById("placard");
        if(placard) placard.style.boxShadow = "";
        validerObjetAutomatiquement("chocolat");
    }

    function aideForteCuisine(){
        validerObjetAutomatiquement("oeuf");
    }

    function aideCompleteCuisine(){
        validerObjetAutomatiquement("farine");
        // Forcer l'affichage du bouton de fin si l'aide complète termine le niveau
        if(etatRangement.oeuf && etatRangement.farine && etatRangement.chocolat) {
            document.getElementById('feedback').innerText = "Nous vous avons aidé à tout ranger.";
            document.getElementById('next-btn').style.display = 'inline-block';
        }
    }
});