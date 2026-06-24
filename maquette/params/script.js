
const btnStats = document.getElementById('btnStats');
const btnConfig = document.getElementById('btnConfig');
const btnOuvrirModif = document.querySelector('.btn-profil'); 
const popupStats = document.getElementById('popupStats');
const popupConfig = document.getElementById('popupConfig');
const popupModifierInfo = document.getElementById('popupModifierInfo');

// GESTION DES POPUPS 
btnStats.onclick = function() { popupStats.style.display = "block";}
btnConfig.onclick = function() { popupConfig.style.display = "block"; }
btnOuvrirModif.onclick = function() { popupModifierInfo.style.display = "block";}
function fermer(id) { document.getElementById(id).style.display = "none";}


// GESTION DES NOTES (BULLES & SUPPRESSION)
// Message de sauvegarde
document.getElementById('btnEnregistrerNote').onclick = function() {
    const noteArea = document.getElementById('noteText');
    const texte = noteArea.value.trim();
    const container = document.getElementById('listeNotes');
    if (texte !== "") {
        // Création de la bulle de note
        const bulle = document.createElement('div');
        bulle.className = 'note-bulle';
        // Génération de la date et heure
        const maintenant = new Date();
        const dateString = maintenant.toLocaleDateString('fr-FR', { 
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
        });
        bulle.innerHTML = `
            <span class="date-note">Le ${dateString}</span>
            <p style="margin: 5px 0 0 0;">${texte}</p>
            <button class="btn-suppr-note" title="Supprimer la note">×</button>
        `;
        // Logique du bouton supprimer (avec confirmation)
        bulle.querySelector('.btn-suppr-note').onclick = function() {
            // On affiche une boîte de dialogue de confirmation
            const confirmation = confirm("Êtes-vous sûr de vouloir supprimer cette note ? Cette action est irréversible.");
            // Si l'utilisateur clique sur "OK"
            if (confirmation) {
                bulle.style.opacity = '0';
                bulle.style.transform = 'translateX(20px)'; // Petit effet de glissement
                setTimeout(() => bulle.remove(), 300); 
            }
            // Si l'utilisateur clique sur "Annuler", il ne se passe rien.
        };
        // Ajout en haut de la liste
        container.prepend(bulle);
        // On vide le champ mais il reste visible pour la note suivante
        noteArea.value = "";
    } else {
        alert("Le champ est vide !");
    }
};



// MODIFICATION DU PROFIL UTILISATEUR
function sauverProfil() {
    const nom = document.getElementById('editNom').value;
    const prenom = document.getElementById('editPrenom').value;
    const stade = document.getElementById('editStade').value;
    // met à jour les textes dans toute la page
    document.querySelectorAll('h3').forEach(h3 => {
        if(h3.innerText.includes("Profil de") || h3.innerText.includes("Utilisateur")) {
            h3.innerText = "Utilisateur : " + prenom + " " + nom;
        }
    });
    alert("Les informations de " + prenom + " (Stade " + stade + ") ont été enregistrées.");
    fermer('popupModifierInfo');
}





// graphes : 
document.addEventListener("DOMContentLoaded", function () {

const canvas = document.getElementById("graphDifficulte");
const filtre = document.getElementById("filtreDiff");

const ctx = canvas.getContext("2d");

/* Données des dernières parties */

const parties = [
{date:"1 mars", niveau:"facile", score:94},
{date:"2 mars", niveau:"facile", score:88},
{date:"5 mars", niveau:"intermediaire", score:82},
{date:"9 mars", niveau:"intermediaire", score:76},
{date:"12 mars", niveau:"intermediaire", score:81},
{date:"14 mars", niveau:"difficile", score:69},
{date:"15 mars", niveau:"difficile", score:63},
{date:"17 mars", niveau:"difficile", score:67},
{date:"20 mars", niveau:"intermediaire", score:74},
{date:"23 mars", niveau:"intermediaire", score:79}
];

/* fonction qui prépare les données */

function filtrerDonnees(niveau){

let labels = [];
let data = [];

parties.forEach(p=>{
if(niveau==="all" || p.niveau===niveau){
labels.push(p.date);
data.push(p.score);
}
});

return {labels,data};

}

/* données initiales */

let dataset = filtrerDonnees("all");

/* création du graphe */

let chart = new Chart(ctx,{

type:"line",

data:{
labels:dataset.labels,
datasets:[{
label:"Réussite (%)",
data:dataset.data,
borderColor:"#2ecc71",
backgroundColor:"rgba(46,204,113,0.2)",
fill:true,
tension:0.35,
pointRadius:4
}]
},

options:{
plugins:{legend:{display:false}},
scales:{
y:{beginAtZero:true,max:100}
}
}

});

/* filtre */

filtre.addEventListener("change",function(){

let niveau = filtre.value;

let dataset = filtrerDonnees(niveau);

chart.data.labels = dataset.labels;
chart.data.datasets[0].data = dataset.data;

chart.update();

});

});

/* ------------------ GRAPHE TEMPS AUTONOMIE ------------------ */

const canvasTemps = document.getElementById("graphTemps");
const filtreTemps = document.getElementById("filtreTemps");

if(canvasTemps){

const ctxTemps = canvasTemps.getContext("2d");

/* Données réalistes */

const partiesTemps = [
{date:"1 mars", niveau:"facile", temps:4.5},
{date:"2 mars", niveau:"facile", temps:4.2},
{date:"5 mars", niveau:"intermediaire", temps:5.8},
{date:"9 mars", niveau:"intermediaire", temps:6.2},
{date:"12 mars", niveau:"intermediaire", temps:5.6},
{date:"14 mars", niveau:"difficile", temps:7.4},
{date:"15 mars", niveau:"difficile", temps:8.1},
{date:"17 mars", niveau:"difficile", temps:7.7},
{date:"20 mars", niveau:"intermediaire", temps:6.0},
{date:"23 mars", niveau:"intermediaire", temps:5.4}
];

function filtrerTemps(niveau){

let labels=[];
let data=[];

partiesTemps.forEach(p=>{
if(niveau==="all" || p.niveau===niveau){
labels.push(p.date);
data.push(p.temps);
}
});

return {labels,data};
}

let datasetTemps = filtrerTemps("all");

let chartTemps = new Chart(ctxTemps,{
type:"line",

data:{
labels:datasetTemps.labels,
datasets:[{
label:"Temps moyen (min)",
data:datasetTemps.data,
borderColor:"#3498db",
backgroundColor:"rgba(52,152,219,0.2)",
fill:true,
tension:0.35,
pointRadius:4
}]
},

options:{
plugins:{legend:{display:false}},
scales:{
y:{
beginAtZero:true,
title:{display:true,text:"minutes"}
}
}
}
});

filtreTemps.addEventListener("change",function(){

let niveau = filtreTemps.value;

let datasetTemps = filtrerTemps(niveau);

chartTemps.data.labels = datasetTemps.labels;
chartTemps.data.datasets[0].data = datasetTemps.data;

chartTemps.update();

});

}