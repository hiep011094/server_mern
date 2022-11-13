import nodemailer from "nodemailer"
import { google } from "googleapis";

// send mail

const sendMail = async (to, url, txt) => {

    const auth2Client = new google.auth.OAuth2(
        process.env.MAILING_SERVICE_CLIENT_ID,
        process.env.MAILING_SERVICE_CLIENT_SECRET,
        process.env.OAUTH_PLAYGROUND
    )

    auth2Client.setCredentials({
        refresh_token: process.env.MAILING_SERVICE_REFRESH_TOKEN
    })
    try {
        const accessToken = await auth2Client.getAccessToken()
        const smtpTransport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.SENDER_EMAIL_ADDRESS,
                clientId: process.env.MAILING_SERVICE_CLIENT_ID,
                clientSecret: process.env.MAILING_SERVICE_CLIENT_SECRET,
                refreshToken: process.env.MAILING_SERVICE_REFRESH_TOKEN,
                accessToken
            }
        })

        const mailOptions = {
            from: process.env.SENDER_EMAIL_ADDRESS,
            to: to,
            subject: "Dev react",
            html: `
                <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
                <h2 style="text-align: center; text-transform: uppercase;color: teal;">Welcome to the DevAT channel.</h2>
                <p>Congratulations! You're almost set to start using DEVAT✮SHOP.
                    Just click the button below to validate your email address.
                </p>
                
                <a href=${url} style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">${txt}</a>
            
                <p>If the button doesn't work for any reason, you can also click on the link below:</p>
            
                <div>${url}</div>
                </div>
            `
        }

        const result = await smtpTransport.sendMail(mailOptions)
        return result

    } catch (error) {
        return error
    }







}

export default sendMail