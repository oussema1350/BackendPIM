import axios from 'axios';
   import { speakText } from './tts.util';

   async function analyzeAndSpeak(imageUrl: string, speak: boolean = true) {
     try {
       const response = await axios.post('http://localhost:3000/medications/analyze', {
         imageUrl,
         speak
       });
       const result = response.data.result;
       console.log('Analysis Result:', result);
       if (speak) {
         await speakText(result);
       }
     } catch (error) {
       console.error('Error:', error.message);
     }
   }

   // Example usage
   analyzeAndSpeak('https://www.drugs.com/images/pills/mmx/t110127f/ibuprofen.jpg');