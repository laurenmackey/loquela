const progressText = document.getElementById("progressText");
const progressBarFull = document.getElementById("progressBarFull");
const prompt = document.getElementById("prompt");
const artPB = document.getElementById("artPB");
const weatherPB = document.getElementById("weatherPB");
const sportsPB = document.getElementById("sportsPB");
const moviesPB = document.getElementById("moviesPB");
const electronicsPB = document.getElementById("electronicsPB");
const foodPB = document.getElementById("foodPB");
const hobbiesPB = document.getElementById("hobbiesPB");
const travelPB = document.getElementById("travelPB");

const game = document.getElementById("game");
const game_completed = document.getElementById("game-completed");


window.onload=function(){
  document.getElementById("next").addEventListener("click", getNewPrompt);
  document.getElementById("next-topic").addEventListener("click", nextTopic);
  document.getElementById("view-results").addEventListener("click", viewResults);  

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

        data.other.forEach(element => {
          counts.push(element.count);
        });
       
        startLesson();
      });
    }
  )
  .catch(function(err) {
    console.log('Fetch Error :-S', err);
  });
};


let currentPrompt = {};
let currentPromptID = {};
let acceptingAnswers = true;
let score = 0;
let promptCounter = 0;
let availablePrompts = [];
let availablePromptIDs = [];

let prompts = [];
let prompt_ids = [];
let counts = [];

var MAX_PROMPTS = 3;

function updateActive() {
  var pathArray = (window.location.pathname.split('/')); 

  var category = document.getElementById(pathArray[2]);
  category.className="active";

  return pathArray[2];
}

function get_action(form) {
  var pathArray = (window.location.pathname.split('/'));
  form.action = `/prompts/${pathArray[2]}/${currentPromptID}`;
}

startLesson = () => {
  availablePrompts = [ ...prompts];
  availablePromptIDs = [ ...prompt_ids]
  promptCounter = 3-availablePrompts.length;
  countPrompts = [ ...counts];

  //update other progress bars
  artPB.style.width = `${((3-countPrompts[0])/MAX_PROMPTS) *100}%`;
  artPB.innerText = `${Math.round(((3-countPrompts[0])/MAX_PROMPTS) *100)}%`;

  weatherPB.style.width = `${((3-countPrompts[1])/MAX_PROMPTS) *100}%`;
  weatherPB.innerText = `${Math.round(((3-countPrompts[1])/MAX_PROMPTS) *100)}%`;

  sportsPB.style.width = `${((3-countPrompts[2])/MAX_PROMPTS) *100}%`;
  sportsPB.innerText = `${Math.round(((3-countPrompts[2])/MAX_PROMPTS) *100)}%`;

  moviesPB.style.width = `${((3-countPrompts[3])/MAX_PROMPTS) *100}%`;
  moviesPB.innerText = `${Math.round(((3-countPrompts[3])/MAX_PROMPTS) *100)}%`;

  electronicsPB.style.width = `${((3-countPrompts[4])/MAX_PROMPTS) *100}%`;
  electronicsPB.innerText = `${Math.round(((3-countPrompts[4])/MAX_PROMPTS) *100)}%`;

  foodPB.style.width = `${((3-countPrompts[5])/MAX_PROMPTS) *100}%`;
  foodPB.innerText = `${Math.round(((3-countPrompts[5])/MAX_PROMPTS) *100)}%`;

  hobbiesPB.style.width = `${((3-countPrompts[6])/MAX_PROMPTS) *100}%`;
  hobbiesPB.innerText = `${Math.round(((3-countPrompts[6])/MAX_PROMPTS) *100)}%`;

  travelPB.style.width = `${((3-countPrompts[7])/MAX_PROMPTS) *100}%`;
  travelPB.innerText = `${Math.round(((3-countPrompts[7])/MAX_PROMPTS) *100)}%`;
    
  getNewPrompt();
};

getNewPrompt = () => {
  if(availablePrompts.length === 0 || promptCounter >= MAX_PROMPTS) {
    game_completed.classList.remove('hidden');
    game_completed.classList.add('visible');

    game.classList.remove('visible');
    game.classList.add('hidden');
  }
  promptCounter++;

  progressText.innerText = `Prompt ${promptCounter}/${MAX_PROMPTS}`;
  //update progress bar
  //console.log(promptCounter/MAX_PROMPTS);
  //progressBarFull.style.width = `${(promptCounter/MAX_PROMPTS) * 100}%`;

  //update current progress bar on fly
  // PB.style.width = `${(promptCounter/MAX_PROMPTS) *100}%`;

  const promptIndex = Math.floor(Math.random() * availablePrompts.length);
    currentPrompt = availablePrompts[promptIndex];
    prompt.innerText = currentPrompt;
    currentPromptID = availablePromptIDs[promptIndex];

    availablePrompts.splice(promptIndex, 1); //get rid of used prompt
};

nextTopic = () => {
  var pathArray = (window.location.pathname.split('/'));

  switch(pathArray[2]){
    case "art": 
      return window.location.assign(`/prompts/weather`);
    case "weather":
      return window.location.assign(`/prompts/sports`);
    case "sports": 
      return window.location.assign(`/prompts/movies`);
    case "movies":
      return window.location.assign(`/prompts/electronics`);
    case "electronics": 
      return window.location.assign(`/prompts/food_and_drink`);
    case "food_and_drink":
      return window.location.assign(`/prompts/hobbies_and_leisure`);
    case "hobbies_and_leisure": 
      return window.location.assign(`/prompts/travel`);
    case "travel":
      return window.location.assign(`/results`);  
  }
};

viewResults = () => {
  var pathArray = (window.location.pathname.split('/'));
  return window.location.assign(`/results/${pathArray[2]}`);
};
