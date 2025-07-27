import nodemailer from "nodemailer"

export const sendEmail = async (to: string, type: string) => {
    try {
        var transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        } as any);

        const mailOptions = {
            from: process.env.SMTP_FROM_EMAIL,
            to: to,
            subject: "Hello ✔",
            html: "<b>Hello world?</b>",
        }

        const emailResponse = await transporter.sendMail(mailOptions);
        console.log("Emaail response " , emailResponse)
        return emailResponse;
    } catch (error: any) {
        console.log("Error sending email", error.message)
        throw new Error(error.message || "Error sending email")
    }
}