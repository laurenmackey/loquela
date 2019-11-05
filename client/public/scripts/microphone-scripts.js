// Sources: https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API,
// https://discourse.processing.org/t/uploading-recorded-audio-to-web-server-node-js-express/4569/4,
// https://codeburst.io/html5-speech-recognition-api-670846a50e92
function main() {
    var record = document.getElementById('microphone-start');
    var stop = document.getElementById('microphone-stop');
    var soundClips = document.getElementById('sound-clips');
    var submitButton = document.getElementById('submit-speech');
    var speechSubmission = document.getElementById('speech-input');
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    var recognition = new SpeechRecognition();
    recognition.interimResults = true;
    recognition.continuous = true;
    // TODO: can add recognition.lang via passed-in variable here
    var finalSpeech = '';
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia ({
            audio: true
        }).then(function(stream) {
            var mediaRecorder = new MediaRecorder(stream);
    
            mediaRecorder.onstop = function(e) {
                console.log('Record onstop event triggered');
    
                var clipContainer = document.createElement('article');
                var audio = document.createElement('audio');
                clipContainer.classList.add('clip');
                audio.setAttribute('controls', '');
                // submitButton.classList.remove('hidden');
                // submitButton.classList.add('visible');

                clipContainer.appendChild(audio);
                soundClips.appendChild(clipContainer);
    
                var blob = new Blob(chunks, { 'type': 'audio/wav; codecs=MS_PCM' });
                chunks = [];
                var audioURL = window.URL.createObjectURL(blob);
                audio.src = audioURL;

                // Send the blob URL value back to the frontend to pass back to the server on submission
                // speechSubmission.value = audioURL;

                var form = new FormData();
                form.append('blob', blob);

                var xhr = new XMLHttpRequest();
                xhr.open('POST', '/prompts/:id', true);
                xhr.setRequestHeader('enctype', 'multipart/form-data');
                xhr.send(form);
            };
    
            var chunks = [];
    
            mediaRecorder.ondataavailable = function(e) {
                chunks.push(e.data);
            };

            recognition.onerror = function(event) {
                if(event.error == 'no-speech') {
                    console.log('No speech was detected. Try again.');  
                }
            };

            recognition.onresult = function(event) {
                console.log('event is', event);
                var tempSpeech = '';
                for (var i = event.resultIndex, len = event.results.length; i < len; i++) {
                    var transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalSpeech += transcript;
                        console.log('You said:', finalSpeech);
                    } else {
                        tempSpeech += transcript;
                    }
                }
                // finalSpeech = event.results[event.results.length - 1][0].transcript;
            };
    
            record.onclick = function() {
                mediaRecorder.start();
                console.log('Recorder started');
                record.style.background = 'red';
                record.style.color = 'black';

                recognition.start();
            };
    
            stop.onclick = function() {
                mediaRecorder.stop();
                console.log('Recorder stopped');
                record.style.background = '';
                record.style.color = '';

                recognition.stop();
            };
        }).catch(function(err) {
            console.log('Error:', err);
        });
    } else {
        console.log('Browser doesn\'t support this feature.');
    }
}

main();
