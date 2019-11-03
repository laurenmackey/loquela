# Sources: https://realpython.com/python-speech-recognition/, https://pypi.org/project/SpeechRecognition/2.1.3/
# Note: SpeechRecognition contains a default API key for the Google Web Speech API, but
# we are limited to 50 requests per day with this key
import speech_recognition as sr
import sys

languageArg = sys.argv[1]
fileArg = sys.argv[2]

def main():
    r = sr.Recognizer()
    speech_input = sr.AudioFile(fileArg)

    with speech_input as source:
        r.adjust_for_ambient_noise(source)
        audio = r.record(source)

    # TODO: add language=languageArg somewhere in here
    try:
        print(r.recognize_google(audio))
    except sr.RequestError:
        print('API unavailable')
    except sr.UnknownValueError:
        print('Unable to recognize speech')

main()
