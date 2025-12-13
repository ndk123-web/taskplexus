package config

import (
	"context"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/getbrevo/brevo-go/lib" // Import path yaad rakhna
)

func SendEmailViaBrevo(recipientEmail string, subject string, htmlContent string, emailType string, args ...string) error {
	// 1. Configuration Setup
	cfg := lib.NewConfiguration()
	// Apni API Key yahan daalo (Better hai ENV variable se lo)
	cfg.AddDefaultHeader("api-key", os.Getenv("BREVO_API_KEY"))

	// 2. Client Create karo
	brevoClient := lib.NewAPIClient(cfg)

	// 3. Email Data Prepare karo
	sender := &lib.SendSmtpEmailSender{
		Name:  "TaskPlexus Team",
		Email: "no-reply@taskplexus.app",
	}

	to := []lib.SendSmtpEmailTo{
		{
			Email: recipientEmail,
		},
	}

	// 3 types of emailType : "Welcome" , "PasswordReset"
	// User ka naam aur Link dynamic replace karne ke liye placeholder use karenge
	// Go mein strings.Replace use karke {{User}} aur {{Link}} change kar lena runtime pe

	switch emailType {

	case "Welcome":
		subject = "Welcome to TaskPlexus! Let's Get Organized 🚀"
		htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; }
                    .header h1 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px; }
                    .content { padding: 30px; color: #333333; line-height: 1.6; }
                    .feature-grid { display: table; width: 100%; margin-top: 20px; }
                    .feature-item { display: table-cell; width: 33%; padding: 10px; text-align: center; vertical-align: top; }
                    .icon { font-size: 24px; margin-bottom: 10px; display: block; }
                    .btn { display: block; width: 200px; margin: 30px auto; padding: 14px 20px; background-color: #764ba2; color: #ffffff; text-align: center; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(118, 75, 162, 0.3); }
                    .btn:hover { background-color: #5a387e; }
                    .footer { background-color: #f4f7f6; padding: 20px; text-align: center; font-size: 12px; color: #888; }
                    .highlight { color: #764ba2; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>TaskPlexus</h1>
                        <p>Your Second Brain for Productivity</p>
                    </div>
                    <div class="content">
                        <h2>Welcome Aboard! 👋</h2>
                        <p>We are thrilled to have you join <b>TaskPlexus</b>. You've just taken the first step towards a more organized and productive life.</p>
                        
                        <p>TaskPlexus isn't just a todo list; it's your personal AI-powered command center. Here is what you can do right now:</p>

                        <div class="feature-grid">
                            <div class="feature-item">
                                <span class="icon">🤖</span>
                                <strong>AI Planner</strong>
                                <p style="font-size: 13px; color: #666;">Turn ideas into plans instantly.</p>
                            </div>
                            <div class="feature-item">
                                <span class="icon">🔄</span>
                                <strong>Flowcharts</strong>
                                <p style="font-size: 13px; color: #666;">Visualize complex workflows.</p>
                            </div>
                            <div class="feature-item">
                                <span class="icon">🎯</span>
                                <strong>Goal Tracking</strong>
                                <p style="font-size: 13px; color: #666;">Focus on what matters.</p>
                            </div>
                        </div>
                        
                        <a href="https://www.taskplexus.app/dashboard" class="btn">Launch Dashboard</a>
                        
                        <p style="text-align: center; font-size: 14px;">Need help? Our <span class="highlight">AI Chat Assistant</span> is ready to guide you.</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 TaskPlexus Inc. All rights reserved.</p>
                        <p>You received this email because you signed up for TaskPlexus.</p>
                    </div>
                </div>
            </body>
            </html>`

	case "PasswordReset":
		subject = "Reset Your TaskPlexus Password 🔒"
		htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
                    .container { max-width: 500px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-top: 5px solid #ff4757; }
                    .content { padding: 40px 30px; text-align: center; color: #333; }
                    .logo { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 20px; display: inline-block; }
                    .btn { display: inline-block; padding: 14px 28px; background-color: #ff4757; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
                    .link-text { font-size: 12px; color: #888; margin-top: 20px; word-break: break-all; }
                    .footer { background-color: #fafafa; padding: 15px; text-align: center; font-size: 12px; color: #aaa; border-radius: 0 0 8px 8px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="content">
                        <div class="logo">TaskPlexus 🔒</div>
                        <h2>Password Reset Request</h2>
                        <p>We received a request to reset your password. Don't worry, it happens to the best of us.</p>
                        
                        <a href="{{Link}}" class="btn">Reset My Password</a>

                        <p style="margin-top: 30px; font-size: 14px; color: #666;">Link expires in 30 minutes.</p>
                        
                        <p class="link-text">If the button doesn't work, copy this link:<br> {{Link}}</p>
                    </div>
                    <div class="footer">
                        <p>If you didn't request this, you can safely ignore this email.</p>
                    </div>
                </div>
            </body>
            </html>`

		// token will be in args[0]
		if len(args) < 1 {
			return fmt.Errorf("insufficient arguments for PasswordReset email type")
		}
		htmlContent = strings.ReplaceAll(htmlContent, "{{Link}}", fmt.Sprintf("%v", args[0]))

	case "SignIn":
		subject = "New sign-in to TaskPlexus detected 🛡️"
		htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                    .header { background-color: #2d3436; padding: 20px; text-align: center; }
                    .logo { color: #ffffff; font-size: 20px; font-weight: bold; letter-spacing: 1px; }
                    .content { padding: 40px 30px; color: #333; }
                    .alert-icon { font-size: 40px; display: block; text-align: center; margin-bottom: 20px; }
                    .login-details { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; padding: 15px; margin: 20px 0; }
                    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef; font-size: 14px; }
                    .detail-row:last-child { border-bottom: none; }
                    .label { color: #6c757d; font-weight: 500; }
                    .value { color: #2d3436; font-weight: bold; text-align: right; }
                    .btn-link { color: #d63031; text-decoration: none; font-weight: bold; font-size: 14px; }
                    .footer { background-color: #f4f7f6; padding: 15px; text-align: center; font-size: 12px; color: #888; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">TaskPlexus Security</div>
                    </div>
                    <div class="content">
                        <div class="alert-icon">🛡️</div>
                        <h2 style="text-align: center; margin-top: 0;">New Sign-In Detected</h2>
                        <p>We noticed a new sign-in to your TaskPlexus account. We just wanted to make sure it's you.</p>
                        
                        <div class="login-details">
                            <div class="detail-row">
                                <span class="label">Time</span>
                                <span class="value">{{Time}}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Device</span>
                                <span class="value">{{Device}}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">IP Address</span>
                                <span class="value">{{IP}}</span>
                            </div>
                        </div>

                        <p style="margin-top: 30px;">
                            <strong>Was this you?</strong><br>
                            If yes, you can ignore this email.
                        </p>
                        
                        <p>
                            <strong>Not you?</strong><br>
                            Someone else might have access to your account. Please <a href="https://taskplexus.app/reset-password" class="btn-link">change your password immediately</a>.
                        </p>
                    </div>
                    <div class="footer">
                        <p>Your account security is our priority.</p>
                    </div>
                </div>
            </body>
            </html>`
		// Current Time formatting
		currentTime := time.Now().Format("02 Jan, 03:04 PM")

		if len(args) < 2 {
			return fmt.Errorf("insufficient arguments for SignIn email type")
		}

		// Replace Placeholders
		htmlContent = strings.ReplaceAll(htmlContent, "{{Time}}", currentTime)
		htmlContent = strings.ReplaceAll(htmlContent, "{{Device}}", args[0]) // this is req.UserAgent()
		htmlContent = strings.ReplaceAll(htmlContent, "{{IP}}", args[1])     // this is req.RemoteAddr

	default:
		return fmt.Errorf("unknown email type: %s", emailType)
	}

	emailContent := lib.SendSmtpEmail{
		Sender:      sender,
		To:          to,
		Subject:     subject,
		HtmlContent: htmlContent,
	}

	// 4. Send Email
	_, resp, err := brevoClient.TransactionalEmailsApi.SendTransacEmail(context.Background(), emailContent)

	if err != nil {
		fmt.Printf("Error sending email: %v\n", err)
		return err
	}

	fmt.Printf("Email Sent Successfully! Response Status: %v\n", resp.StatusCode)
	return nil
}
