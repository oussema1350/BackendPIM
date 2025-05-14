import { Injectable, NestMiddleware } from '@nestjs/common';
   import { Request, Response, NextFunction } from 'express';
   import { speakText } from './tts.util';

   @Injectable()
   export class TtsMiddleware implements NestMiddleware {
     async use(req: Request, res: Response, next: NextFunction) {
       // Store the original send method
       const originalSend = res.send;
       
       // Override send to capture the response
       res.send = function (body) {
         try {
           // Parse the response body
           const responseBody = typeof body === 'string' ? JSON.parse(body) : body;
           if (req.path === '/medications/analyze' && responseBody.result) {
             // Extract speak parameter from request body
             const speak = req.body.speak !== false; // Default to true
             if (speak) {
               // Speak the result
               speakText(responseBody.result).catch((err) => {
                 console.error('TTS error in middleware:', err);
               });
             }
           }
         } catch (err) {
           console.error('Error processing response in TTS middleware:', err);
         }
         
         // Call the original send method
         return originalSend.call(this, body);
       };
       
       next();
     }
   }