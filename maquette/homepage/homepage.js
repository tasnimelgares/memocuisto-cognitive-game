
//DÉCLARATION DES ÉLÉMENTS

const home = document.getElementById("home")
const profils = document.getElementById("profils")
const aidant = document.getElementById("aidant")
const patients = document.querySelectorAll(".patient-btn")

// Boutons principaux
const jouerBtn = document.getElementById("jouer-btn")
const aidantBtn = document.getElementById("aidant-btn")

// Boutons de navigation
const retourProfils = document.getElementById("retour-profils")
// const retourAidant = document.getElementById("retour-aidant")
const aidantNext = document.getElementById("aidant-next")
const jeanProfile = document.getElementById("jean-profile")


// GESTION DES REDIRECTIONS EXTERNES

aidantNext.addEventListener("click", () => {
    window.location.href = "../params/params.html"
})

jeanProfile.addEventListener("click", () => {
    window.location.href = "../levels.html"
})


// GESTION DE LA SÉLECTION DES PATIENTS (coté aidant)

patients.forEach(btn=>{
    btn.addEventListener("click",()=>{
        patients.forEach(p=>p.classList.remove("selected"))
        btn.classList.add("selected")

    })
})

// GESTION DE LA NAVIGATION INTERNE 

function showPage(page) {
    // Cacher toutes les pages
    home.classList.add("hidden");
    profils.classList.add("hidden");
    aidant.classList.add("hidden");

    // Afficher la page demandée
    page.classList.remove("hidden");
}



jouerBtn.addEventListener("click", () => { showPage(profils)})

aidantBtn.addEventListener("click", () => { showPage(aidant) })

retourProfils.addEventListener("click", () => { showPage(home) })
