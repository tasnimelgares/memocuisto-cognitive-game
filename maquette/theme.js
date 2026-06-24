function applyTheme(couleur){

    document.body.style.background = couleur;

    const r = parseInt(couleur.slice(1,3),16);
    const g = parseInt(couleur.slice(3,5),16);
    const b = parseInt(couleur.slice(5,7),16);

    const luminance = (0.299*r + 0.587*g + 0.114*b) / 255;

    if(luminance < 0.5){
        document.body.classList.add("theme-dark");
    } else {
        document.body.classList.remove("theme-dark");
    }
}

function changeColor(couleur){

    // sauvegarde la couleur
    localStorage.setItem("memocuisto_theme", couleur);

    // applique immédiatement
    document.documentElement.style.setProperty("--main-bg", couleur);

}

document.addEventListener("DOMContentLoaded", () => {

    const savedTheme = localStorage.getItem("memocuisto_theme");

    if(savedTheme){
        document.documentElement.style.setProperty("--main-bg", savedTheme);
    }

});