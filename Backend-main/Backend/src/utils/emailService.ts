import nodemailer from 'nodemailer';
import { config } from '../config/env';
import logger from './logger';


const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: false, 
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });
};


export const sendVerificationEmail = async (
  email: string,
  name: string,
  token: string
): Promise<void> => {
  try {
    const transporter = createTransporter();
    const verificationUrl = `${config.frontendUrl}/verify-email/${token}`;

    const mailOptions = {
      from: config.emailFrom,
      to: email,
      subject: 'Verify your SUST CSE Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to SUST CSE Portal, ${name}!</h2>
          <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create this account, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">SUST Computer Science and Engineering Department</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent to ${email}`);
  } catch (error) {
    logger.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};


export const sendTeacherApprovalEmail = async (
  email: string,
  name: string
): Promise<void> => {
  try {
    const transporter = createTransporter();
    const loginUrl = `${config.frontendUrl}/login`;

    const mailOptions = {
      from: config.emailFrom,
      to: email,
      subject: 'Your SUST CSE Account Has Been Approved',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Congratulations, ${name}!</h2>
          <p>Your teacher account has been approved by the administrator.</p>
          <p>You can now log in to access the SUST CSE Portal:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background-color: #2196F3; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Login Now
            </a>
          </div>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">SUST Computer Science and Engineering Department</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Approval email sent to ${email}`);
  } catch (error) {
    logger.error('Error sending approval email:', error);
  }
};


export const sendNoticeEmail = async (
  recipients: string[],
  noticeTitle: string,
  noticeContent: string,
  noticeId: string
): Promise<void> => {
  try {
    const transporter = createTransporter();
    const noticeUrl = `${config.frontendUrl}/notices/${noticeId}`;

    const mailOptions = {
      from: config.emailFrom,
      bcc: recipients, 
      subject: `New Notice: ${noticeTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2> New Notice Posted</h2>
          <h3>${noticeTitle}</h3>
          <p>${noticeContent.substring(0, 200)}${noticeContent.length > 200 ? '...' : ''}</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${noticeUrl}" style="background-color: #FF9800; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block;">
              View Full Notice
            </a>
          </div>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">SUST Computer Science and Engineering Department</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Notice email sent to ${recipients.length} recipients`);
  } catch (error) {
    logger.error('Error sending notice email:', error);
  }
};


export const sendResultEmail = async (
  recipients: string[],
  session: string,
  semester: number
): Promise<void> => {
  try {
    const transporter = createTransporter();
    const resultsUrl = `${config.frontendUrl}/results`;

    const mailOptions = {
      from: config.emailFrom,
      bcc: recipients,
      subject: `Results Published - ${session} Semester ${semester}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2> Results Published</h2>
          <p>Results for <strong>${session}</strong> - Semester <strong>${semester}</strong> have been published.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resultsUrl}" style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block;">
              View Results
            </a>
          </div>
          <p style="color: #666;">Log in to your account to view your results.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">SUST Computer Science and Engineering Department</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Result email sent to ${recipients.length} students`);
  } catch (error) {
    logger.error('Error sending result email:', error);
  }
};
