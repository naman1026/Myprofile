'use server';

import { z } from 'zod';

// Define the schema for the email data
const emailSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(1, "Message is required"),
});

export type SendEmailInput = z.infer<typeof emailSchema>;
export type SendEmailResult = { success: boolean; error?: string };

/**
 * Server action to handle sending an email.
 * In a real application, this would integrate with an email service provider
 * (e.g., Resend, Nodemailer with SMTP, SendGrid, etc.).
 * For this example, we'll just log the details to the console.
 */
export async function sendEmailAction(formData: SendEmailInput): Promise<SendEmailResult> {
  // Validate the input data
  const validationResult = emailSchema.safeParse(formData);

  if (!validationResult.success) {
    console.error("Email validation failed:", validationResult.error.flatten().fieldErrors);
    // Return a generic error or specific field errors if needed
    return { success: false, error: "Invalid form data provided." };
  }

  const { name, email, message } = validationResult.data;
  const recipientEmail = process.env.CONTACT_EMAIL || 'namankumarcu@gmail.com'; // Get recipient from env or fallback

   // --- Placeholder for actual email sending logic ---
  console.log('--- New Contact Form Submission ---');
  console.log(`Recipient: ${recipientEmail}`);
  console.log(`Sender Name: ${name}`);
  console.log(`Sender Email: ${email}`);
  console.log(`Message: ${message}`);
  console.log('------------------------------------');

  // Simulate email sending delay (optional)
  // await new Promise(resolve => setTimeout(resolve, 1000));

  // In a real implementation:
  // try {
  //   const emailService = require('your-email-service-library');
  //   await emailService.send({
  //     to: recipientEmail,
  //     from: 'your-portfolio-noreply@example.com', // Use a verified sender email
  //     reply_to: email,
  //     subject: `New Contact Form Message from ${name}`,
  //     text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
  //     // html: `<p>...</p>` // Optional HTML version
  //   });
     return { success: true };
  // } catch (error) {
  //   console.error("Failed to send email:", error);
  //   return { success: false, error: "Could not send the message due to a server error." };
  // }

  // --- End of placeholder ---

  // For now, assume success if validation passes and logging occurs
   // return { success: true }; // Uncomment this if removing the try/catch block above

}
