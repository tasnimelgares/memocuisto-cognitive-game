let timerInterval
let seconds = 0
let timerVisible = false

let aides = []

function startGameTimer(aidesConfig = []){

    aides = aidesConfig

    const timerBox = document.createElement("div")
    timerBox.id = "game-timer"
    timerBox.innerText = "⏱ 00:00"

    const toggleBtn = document.createElement("button")
    toggleBtn.id = "toggle-timer"
    toggleBtn.innerText = "⏱ afficher le temps"

    document.body.appendChild(timerBox)
    document.body.appendChild(toggleBtn)

    timerBox.style.display = "none"

    toggleBtn.addEventListener("click", () => {
        if(timerBox.style.display === "none"){
            timerBox.style.display = "block"
        } else {
            timerBox.style.display = "none"
        }
    })

    timerInterval = setInterval(() => {

        seconds++

        const min = Math.floor(seconds/60)
        const sec = seconds % 60

        timerBox.innerText =
        "⏱ " +
        String(min).padStart(2,'0') +
        ":" +
        String(sec).padStart(2,'0')

        aides.forEach(aide=>{
            if(seconds === aide.time){
                aide.action()
            }
        })

    },1000)
}