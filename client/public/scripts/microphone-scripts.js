// Sources: https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API,
// https://discourse.processing.org/t/uploading-recorded-audio-to-web-server-node-js-express/4569/4,
// https://codeburst.io/html5-speech-recognition-api-670846a50e92

// We're using two main API's here. Both are triggered when the user clicks the record/stop button
// MediaRecorder API:
//     - Listens for user speech via their microphone, facilitated by a call to getUserMedia()
//     - Creates an audio blob that we use to make a playback mechanism for the user
// SpeechRecognition API:
//     - Listens for all user speech events and returns their values
//     - We use this to build up the final speech-as-text output that's displayed to the user
function main() {
    // DOM manipulation variables
    var record = document.getElementById('microphone-start');
    var stop = document.getElementById('microphone-stop');
    var soundClip = document.getElementById('sound-clip');
    var submitButton = document.getElementById('submit-speech');
    var speechSubmission = document.getElementById('speech-input');
    var speechDisplay = document.getElementById('speech-as-text');
    
    // Speech-to-text variables
    var userLanguage = document.getElementById('user-language').value;
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    var recognition = new SpeechRecognition();
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.lang = userLanguage;
    var finalSpeech = '';
    
    // Request microphone access and enable it if granted
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia ({
            audio: true
        }).then(function(stream) {
            var mediaRecorder = new MediaRecorder(stream);
    
            /* *******************************
            ***** AUDIO PLAYBACK SECTION *****
            ******************************* */
            mediaRecorder.onstop = function(e) {    
                var clipContainer = document.createElement('article');
                var audio = document.createElement('audio');
                clipContainer.classList.add('clip');
                audio.setAttribute('controls', '');

                clipContainer.appendChild(audio);
                soundClip.appendChild(clipContainer);
    
                var blob = new Blob(chunks, { 'type': 'audio/wav; codecs=MS_PCM' });
                chunks = [];
                var audioURL = window.URL.createObjectURL(blob);
                audio.src = audioURL;

                // Note: Leaving the blob transmission piece in here as a comment
                // in case we want to go this route later
                // var form = new FormData();
                // form.append('blob', blob);

                // var xhr = new XMLHttpRequest();
                // xhr.open('POST', '/prompts/:id', true);
                // xhr.setRequestHeader('enctype', 'multipart/form-data');
                // xhr.send(form);
            };
    
            var chunks = [];
    
            mediaRecorder.ondataavailable = function(e) {
                chunks.push(e.data);
            };

            /* *******************************
            ***** SPEECH-TO-TEXT SECTION *****
            ******************************* */
            recognition.onerror = function(event) {
                if(event.error == 'no-speech') {
                    speechSubmission.value = 'No speech was detected. Try again.';  
                }
            };

            recognition.onresult = function(event) {
                var tempSpeech = '';
                for (var i = event.resultIndex, len = event.results.length; i < len; i++) {
                    var transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalSpeech += transcript;
                        speechDisplay.innerHTML = finalSpeech;

                        submitButton.classList.remove('hidden');
                        submitButton.classList.add('visible');

                        // Send the speech as text as a value to pass back to the server on submission
                        speechSubmission.value = finalSpeech;
                    } else {
                        // We could use this to display text to the user as they're speaking
                        tempSpeech += transcript;
                    }
                }
            };

            /* *******************************
            **** USER EVENTS AND API CALLS ***
            ******************************* */
            record.onclick = function() {
                mediaRecorder.start();
                record.style.background = 'red';
                record.style.color = 'black';

                // reset the 'You said' text and playback section in case they're re-recording
                finalSpeech = '';
                speechDisplay.innerHTML = '';
                if(soundClip.hasChildNodes()) {
                    soundClip.removeChild(soundClip.firstChild);
                }

                recognition.start();
            };
    
            stop.onclick = function() {
                mediaRecorder.stop();
                record.style.background = '';
                record.style.color = '';

                recognition.stop();
            };
        }).catch(function(err) {
            console.log('Error:', err);
        });
    } else {
        console.log('Your browser doesn\'t support this feature.');
    }
}

main();
