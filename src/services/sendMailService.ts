import nodemailer, { Transporter } from 'nodemailer';
import { resolve } from 'path';
import handlebars from 'handlebars';
import fs from 'fs';

class SendMailService {
    private client: Transporter;

    constructor(){
        nodemailer.createTestAccount().then(acccount => {
            const transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                  user: acccount.user, // generated ethereal user
                  pass: acccount.pass, // generated ethereal password
                },
              });

              this.client = transporter;
        });
    }

    async execute(to: string, subject: string, variables: object, path: string){
        
        const templateFileContent = fs.readFileSync(path).toString("utf8");

        const mailTemplateParse = handlebars.compile(templateFileContent);

        const html = mailTemplateParse(variables);

        const message = await this.client.sendMail({
            to,
            subject,
            html,
            from: "NPS <noreply@nps.com.br>",
        });

        console.log("Message sent: %s", message.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(message));
    }

}

export default new SendMailService();