
const progressText = document.getElementById("progressText");
const progressBarFull = document.getElementById("progressBarFull");
const prompt = document.getElementById("prompt");

window.onload=function(){
  document.getElementById("next").addEventListener("click", getNewPrompt);
  
  

  var path = updateActive();
  fetch(`${path}/lesson`)
  .then(
    function(response) {
      if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' +
          response.status);
        return;
      }

      // Examine the text in the response
      response.json().then(function(data) {
        //console.log(data);
        data.prompts.forEach(element => {
            prompts.push(element.text);
            prompt_ids.push(element.id);
           
           
       

        });
        
       
        startLesson();
      });
    }
  )
  .catch(function(err) {
    console.log('Fetch Error :-S', err);
  });
}


let currentPrompt = {};
let currentPromptID = {};
let acceptingAnswers = true;
let score = 0;
let promptCounter = 0;
let availablePrompts = [];
let availablePromptIDs = [];

let prompts = [];
let prompt_ids = [];

var MAX_PROMPTS =3;

function updateActive() {

  var pathArray = (window.location.pathname.split('/'));
 

  var category = document.getElementById(pathArray[2]);
  category.className="active";

  return pathArray[2];

} 




function get_action(form) {

  var pathArray = (window.location.pathname.split('/'));
  
  form.action = `/prompts/${pathArray[2]}/${currentPromptID}`
  
}




startLesson = () => {
    
    availablePrompts = [ ...prompts];
    availablePromptIDs = [ ...prompt_ids]
    promptCounter = 3-availablePrompts.length;

    
    getNewPrompt();
};

getNewPrompt = () => {

    if(availablePrompts.length === 0 || promptCounter >= MAX_PROMPTS) {
        //go to end page
        var pathArray = (window.location.pathname.split('/'));
  
        return window.location.assign(`/results/${pathArray[2]}`)
    }

   


    promptCounter++;

    progressText.innerText = `Prompt ${promptCounter}/${MAX_PROMPTS}`;
    //update progress bar
    //console.log(promptCounter/MAX_PROMPTS);
    progressBarFull.style.width = `${(promptCounter/MAX_PROMPTS) * 100}%`;


    const promptIndex = Math.floor(Math.random() * availablePrompts.length);
        currentPrompt = availablePrompts[promptIndex];
        prompt.innerText = currentPrompt;
        currentPromptID = availablePromptIDs[promptIndex];
       

    availablePrompts.splice(promptIndex, 1); //get rid of used prompt
}









