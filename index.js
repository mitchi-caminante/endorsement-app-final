import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

// Firebase database init
const appSettings = {
    databaseURL:"https://we-are-the-champions-cb865-default-rtdb.europe-west1.firebasedatabase.app/"
}
const app = initializeApp(appSettings)
const database = getDatabase(app)
const endorsementInDB = ref(database, "endorsements")

const formEl = document.getElementById("form")
const inputEndorseEl = document.getElementById("endorsement-input")
const inputFromEl = document.getElementById("from-input")
const inputToEl = document.getElementById("to-input")
const outputEndorseEl = document.getElementById("endorsement-output")

// Localstorage Init
let likedIDsByApp = []
if (JSON.parse(localStorage.getItem("likedIDs"))) {
    likedIDsByApp = JSON.parse(localStorage.getItem("likedIDs"))
}

function isLikedEndorsement(endorsementId) {
    return likedIDsByApp.includes(endorsementId);
}

//event listener for publish//

formEl.addEventListener("submit", function(event) {
    event.preventDefault();
    
    let inputEndorse = inputEndorseEl.value
    let inputTo = inputToEl.value
    let inputFrom = inputFromEl.value
    
    push(endorsementInDB, {
        endorseTo: inputTo,
        endorseFrom: inputFrom,
        message: inputEndorse,
        totalLikes: 0
    });
    
    inputEndorseEl.value = ""
    inputFromEl.value = ""
    inputToEl.value = ""
})

//publish new endorsements//

onValue(endorsementInDB, function(snapshot) {
    if(snapshot.exists()){
        let endorsementsArray = Object.entries(snapshot.val()).reverse()
                
        outputEndorseEl.innerHTML = ""
            
        for (let i = 0; i < endorsementsArray.length; i++) {
            let newestEndorsement = endorsementsArray[i]
            publishNewEndorsement(newestEndorsement)
        }
    } else {
        outputEndorseEl.innerHTML = "No endorsements yet 😞"
    }
    
})

//function to publish endorsement

function publishNewEndorsement(endorsement) {
    const endorsementID = endorsement[0]
    const endorsementValue = endorsement[1]
    
    let {message, endorseTo, endorseFrom, totalLikes} = endorsementValue
        
    const endorsementElement = document.createElement('div');
    endorsementElement.innerHTML += `
        <li class="endorsement-list-items">
            <span class="to-output-el">To: ${endorseTo}</span>
            <span class="message-el">${message}</span>
            <div class="footer">
                <span class="from-output-el">From: ${endorseFrom}</span>
                <span class="likes">
                    <button class="like-btn" id="like-btn" aria-label="Like this endorsement">
                        <i class="${isLikedEndorsement(endorsementID) ? 'fa-solid' : 'fa-regular'} fa-heart liked" id="empty-heart-icon"></i>
                        </button><span id="likes-number">${totalLikes}</span>
                </span>
            </div>
        </li>`
    outputEndorseEl.appendChild(endorsementElement);
    
    //event listener to increase like number on each click of element
    
    endorsementElement.addEventListener("click", function() {
        if (!isLikedEndorsement(endorsementID)) {
            let exactLocationOfEndorsementInDB = ref(database, `endorsements/${endorsementID}`)
            let updates = { ...endorsementValue, totalLikes: totalLikes + 1 }
            likedIDsByApp.push(endorsementID);
            
            localStorage.setItem("likedIDs", JSON.stringify(likedIDsByApp))
            update(exactLocationOfEndorsementInDB, updates)   
        }
    })
}