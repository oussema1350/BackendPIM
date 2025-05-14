import pyttsx3

def main():
    # Initialize the TTS engine
    engine = pyttsx3.init()

    # Set properties (optional)
    engine.setProperty('rate', 150)  # Speed of speechhe
    engine.setProperty('volume', 0.9)  # Volume (0.0 to 1.0)

    print("Interactive text-to-speech (type 'exit' to quit)")
    print("-" * 50)

    while True:
        prompt = input("\nEnter text to speak: ")
        if prompt.lower() == 'exit':
            break
        
        try:
            # Convert text to speech
            engine.say(prompt)
            engine.runAndWait()
            print("Speaking completed.")
        except Exception as e:
            print(f"Error generating speech: {e}")

if __name__ == "__main__":
    main()