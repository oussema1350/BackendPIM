import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function speakText(text: string): Promise<void> {
  try {
    // Path to the Python executable in the virtual environment
    const pythonPath = '/Users/oussemahajjem/development/medi-trust_backend/kokoro_env/bin/python';
    // Path to tts_wrapper.py
    const scriptPath = '/Users/oussemahajjem/development/medi-trust_backend/src/medication/tts_wrapper.py';
    
    // Escape the text to handle special characters
    const escapedText = text.replace(/"/g, '\\"').replace(/\n/g, ' ');
    
    // Construct the command to run tts_wrapper.py with the text as an argument
    const command = `${pythonPath} ${scriptPath} "${escapedText}"`;
    
    // Execute the command
    const { stdout, stderr } = await execPromise(command);
    
    if (stderr) {
      console.error('TTS script stderr:', stderr);
      throw new Error(`TTS script error: ${stderr}`);
    }
    
    console.log('TTS script stdout:', stdout);
  } catch (error) {
    console.error('Failed to execute TTS script:', error);
    throw new Error(`TTS execution failed: ${error.message}`);
  }
}