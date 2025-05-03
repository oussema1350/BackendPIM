import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';


@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;


  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // Utilisez "gmail" comme service
      auth: {
        user: 'oussemawushu@gmail.com', // Votre adresse Gmail
        pass: 'saxp wvgj zlfq lhcs', // Mot de passe d'application
      },
    });
  }

  async sendPasswordResetEmail(to: string, newPassword: string) {
    const mailOptions = {
      from: 'no-reply@votresite.com', // L'email d'expéditeur
      to, // L'email de l'utilisateur
      subject: 'Votre nouveau mot de passe',
      text: `Bonjour,
  
  Nous avons réinitialisé votre mot de passe. Votre nouveau mot de passe est le suivant : 
  
  ${newPassword}
  
  Veuillez vous connecter et changer ce mot de passe pour des raisons de sécurité.
  
  Cordialement,
  L'équipe de votre application`,
    };

    await this.transporter.sendMail(mailOptions);
  }
  async sendReportMessage(to: string, message: string, user: string, email: string) {
    const mailOptions = {
      from: 'no-reply@votresite.com',
      to,
      subject: 'message report',
      text: `Hi Admin,
        a user reported this message : << ${message} >>
        from : << ${user} >>
        With email: << ${email} >>
        thanks for understanding
        please take care of this user
        `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async BannedUser(to: string, user: string, email: string) {
    const mailOptions = {
      from: 'no-reply@votresite.com',
      to,
      subject: 'User Has Been Banned',
      text: `Hi Admin,
        This user : << ${user} >> 
        With email: << ${email} >>
        has been banned
        thanks for understanding`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}