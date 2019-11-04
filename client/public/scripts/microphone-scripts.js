// Source: https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API
function main() {
    var record = document.getElementById('microphone-start');
    var stop = document.getElementById('microphone-stop');
    var soundClips = document.getElementById('sound-clips');
    var submitButton = document.getElementById('submit-speech');
    var speechSubmission = document.getElementById('speech-input');
    
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
                form.append('file', blob, 'test.wav');

                var xhr = new XMLHttpRequest();
                xhr.open('POST', '/prompts/:id', true);
                xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                xhr.send(form);
            };
    
            var chunks = [];
    
            mediaRecorder.ondataavailable = function(e) {
                chunks.push(e.data);
            };
    
            record.onclick = function() {
                mediaRecorder.start();
                console.log('Recorder started');
                record.style.background = 'red';
                record.style.color = 'black';
            };
    
            stop.onclick = function() {
                mediaRecorder.stop();
                console.log('Recorder stopped');
                record.style.background = '';
                record.style.color = '';
            };
        }).catch(function(err) {
            console.log('Error:', err);
        });
    } else {
        console.log('getUserMedia not supported on your browser');
    }
}

function test() {
    return 'Test success!';
}

main();
