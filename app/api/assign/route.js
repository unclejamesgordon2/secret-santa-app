import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req) {
    try {
        const { participants } = await req.json();

        if (!participants || !Array.isArray(participants) || participants.length < 2) {
            return NextResponse.json({ message: 'Need at least 2 participants' }, { status: 400 });
        }

        // 1. Derangement (Shuffle until no one picks themselves)
        const santas = [...participants];
        let recipients = [...participants];
        let isValid = false;

        // Safety limit to prevent infinite loops (though unlikely with n >= 2)
        let attempts = 0;
        while (!isValid && attempts < 100) {
            isValid = true;
            // Fisher-Yates shuffle
            for (let i = recipients.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [recipients[i], recipients[j]] = [recipients[j], recipients[i]];
            }

            // Check for self-assignment (comparing emails as unique IDs)
            for (let i = 0; i < santas.length; i++) {
                if (santas[i].email === recipients[i].email) {
                    isValid = false;
                    break;
                }
            }
            attempts++;
        }

        if (!isValid) {
            return NextResponse.json({ message: 'Failed to generate valid pairings. Please try again.' }, { status: 500 });
        }

        // 2. Configure Transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                ciphers: 'SSLv3'
            }
        });

        // 3. Send Emails
        const emailPromises = santas.map((santa, index) => {
            const recipient = recipients[index];

            const mailOptions = {
                from: `"Secret Santa 🎅" <${process.env.SMTP_USER}>`,
                to: santa.email,
                subject: 'Your Secret Santa Assignment! 🎁',
                text: `Ho Ho Ho ${santa.name}! \n\nYou have been assigned to be the Secret Santa for: ${recipient.name} (${recipient.email}).\n\nRemember, it's a secret! \n\nMerry Christmas!`,
                html: `
          <div style="background-color: #f0f0f0; padding: 20px; font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; border: 2px solid #D42426;">
              <h1 style="color: #D42426; text-align: center;">Secret Santa Assignment 🎅</h1>
              <p style="font-size: 18px; text-align: center;">Hello <strong>${santa.name}</strong>!</p>
              <p style="font-size: 16px; text-align: center;">You have been chosen to spread some holiday cheer.</p>
              <div style="background-color: #165B33; color: white; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px;">You are the Secret Santa for:</p>
                <h2 style="margin: 10px 0 0 0; font-size: 28px;">${recipient.name}</h2>
                <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">(${recipient.email})</p>
              </div>
              <p style="font-size: 14px; color: #666; text-align: center;">Remember, keep it a secret until the gift exchange!</p>
              <p style="text-align: center; font-size: 24px;">🎄🎁❄️</p>
            </div>
          </div>
        `
            };

            return transporter.sendMail(mailOptions);
        });

        await Promise.all(emailPromises);

        return NextResponse.json({ message: 'Success', pairings: santas.length });

    } catch (error) {
        console.error('Assignment Error:', error);
        return NextResponse.json({ message: 'Failed to assign or send emails. Check server logs.' }, { status: 500 });
    }
}
