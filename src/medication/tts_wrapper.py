import sys
import os

def main():
    # Get the text from command-line argument
    if len(sys.argv) < 2:
        print("Error: No text provided")
        sys.exit(1)
    
    text = sys.argv[1]
    
    # Import speech.py as a module
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    from speech import main as speech_main
    
    # Mock the input function to return the provided text
    original_input = __builtins__.input
    __builtins__.input = lambda _: text
    
    try:
        # Run speech.py's main function
        speech_main()
    finally:
        # Restore original input function
        __builtins__.input = original_input

if __name__ == "__main__":
    main()