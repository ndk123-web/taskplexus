import { Link } from 'react-router-dom';
import Footer from '../../components/layout/Footer';
import '../../styles/pages/Legal.css';

const PrivacyPolicy = () => {
  return (
    <div className="legal-page">
      <nav className="legal-navbar">
        <div className="legal-nav-content">
          <Link to="/" className="legal-nav-logo">
            <img src="/TaskPlexus.png" alt="TaskPlexus" width={32} />
            <span>TaskPlexus</span>
          </Link>
          <Link to="/" className="legal-nav-back">← Back to Home</Link>
        </div>
      </nav>

      <main className="legal-container">
        <div className="legal-header">
          <h1>Privacy Policy</h1>
          <p className="legal-date">Last Updated: December 2025</p>
        </div>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Introduction</h2>
            <p>
              TaskPlexus ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy 
              Policy explains how we collect, use, disclose, and safeguard your information when you use our Service, 
              including our website and related mobile applications.
            </p>
            <p>
              Please read this Privacy Policy carefully. If you do not agree with our policies and practices, 
              please do not use our Service.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Information We Collect</h2>
            <p>
              We collect information in the following ways:
            </p>

            <h3 className="legal-subheading">2.1 Information You Provide Directly</h3>
            <ul className="legal-list">
              <li><strong>Account Registration:</strong> When you create an account, we collect your full name, email address, and password (encrypted)</li>
              <li><strong>Profile Information:</strong> Optional information such as profile picture, bio, or preferences</li>
              <li><strong>Service Data:</strong> Tasks, goals, notes, workspace configurations, and other content you create</li>
              <li><strong>Communication Data:</strong> Messages, support tickets, and feedback you send to us</li>
            </ul>

            <h3 className="legal-subheading">2.2 Information Collected Automatically</h3>
            <ul className="legal-list">
              <li><strong>Usage Analytics:</strong> Pages visited, features used, time spent, and interaction patterns (anonymized)</li>
              <li><strong>Device Information:</strong> Device type, operating system, browser type, IP address</li>
              <li><strong>Cookies & Tracking:</strong> Session cookies, authentication tokens, and preference data</li>
              <li><strong>Error Logs:</strong> Technical logs for debugging and service improvement (no personal content included)</li>
            </ul>

            <h3 className="legal-subheading">2.3 Third-Party Data</h3>
            <p>
              If you connect third-party services to TaskPlexus (future feature), we may receive limited data required 
              for integration. You control what data is shared via your third-party service settings.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. How We Use Your Information</h2>
            <p>
              We use collected information for the following purposes:
            </p>
            <ul className="legal-list">
              <li><strong>Service Delivery:</strong> To provide, maintain, and improve TaskPlexus</li>
              <li><strong>Account Management:</strong> To authenticate users and manage accounts</li>
              <li><strong>Communication:</strong> To send account updates, security alerts, support responses, and service announcements</li>
              <li><strong>Personalization:</strong> To customize your experience and remember your preferences</li>
              <li><strong>Analytics & Improvement:</strong> To analyze usage patterns and optimize features (using anonymized data)</li>
              <li><strong>Security & Fraud Prevention:</strong> To detect, prevent, and address fraud and security issues</li>
              <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes</li>
              <li><strong>AI Features:</strong> To power AI Planner and AI Chat features using your workspace data</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Data Security & Protection</h2>
            <p>
              Your data security is a top priority. We implement the following measures:
            </p>
            <ul className="legal-list">
              <li><strong>Encryption in Transit:</strong> All data transmitted between your device and our servers uses SSL/TLS encryption</li>
              <li><strong>Encryption at Rest:</strong> Sensitive data is encrypted while stored on our servers</li>
              <li><strong>Password Security:</strong> Passwords are hashed using industry-standard algorithms; we never store plain-text passwords</li>
              <li><strong>Access Control:</strong> Only authorized personnel can access user data, and only when necessary</li>
              <li><strong>Regular Audits:</strong> We conduct regular security audits and penetration testing</li>
              <li><strong>Secure Infrastructure:</strong> Data is hosted on secure, monitored servers with automatic backups</li>
            </ul>
            <p>
              While we implement robust security measures, no system is completely secure. We cannot guarantee absolute 
              security; you use our Service at your own risk.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Data Sharing & Third-Party Services</h2>
            <p>
              We do not sell, share, or monetize your personal data. However, we may share information in these cases:
            </p>

            <h3 className="legal-subheading">5.1 Third-Party Service Providers</h3>
            <ul className="legal-list">
              <li><strong>Hosting Providers:</strong> We use secure cloud infrastructure to host user data</li>
              <li><strong>Payment Processors:</strong> Razorpay processes payments; we share only necessary billing information</li>
              <li><strong>Analytics Services:</strong> We use analytics tools to understand usage patterns (anonymized data only)</li>
            </ul>

            <h3 className="legal-subheading">5.2 Legal Requirements</h3>
            <p>
              We may disclose your information if required by law, regulation, court order, or government request. 
              We will attempt to notify you of such requests when legally permissible.
            </p>

            <h3 className="legal-subheading">5.3 Business Transfer</h3>
            <p>
              If TaskPlexus is merged, acquired, or sold, your data may be transferred as part of the transaction. 
              We will notify you of any change in ownership or control of your data.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Your Data Rights & Control</h2>
            <p>
              You have the following rights regarding your data:
            </p>
            <ul className="legal-list">
              <li><strong>Access:</strong> You can access and download your account data at any time from your Settings</li>
              <li><strong>Modification:</strong> You can update or correct your account information</li>
              <li><strong>Deletion:</strong> You can request deletion of your account and associated data</li>
              <li><strong>Export:</strong> You can export your tasks, goals, and workspace data in standard formats</li>
            </ul>
            <p>
              To exercise these rights, contact us at <a href="mailto:support@taskplexus.com">support@taskplexus.com</a>
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Data Retention & Deletion</h2>
            <p>
              We retain your data for as long as your account is active. Upon account deletion:
            </p>
            <ul className="legal-list">
              <li>Your personal data will be permanently deleted from production systems within 30 days</li>
              <li>Backup copies may be retained for up to 90 days for disaster recovery purposes</li>
              <li>Aggregated, anonymized data may be retained indefinitely for analytics</li>
              <li>Legal and compliance data may be retained as required by law</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>8. Cookies & Tracking</h2>
            <p>
              TaskPlexus uses cookies to enhance your experience:
            </p>
            <ul className="legal-list">
              <li><strong>Session Cookies:</strong> Maintain your login session during browsing</li>
              <li><strong>Authentication Tokens:</strong> Secure your account access</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and theme preferences</li>
              <li><strong>Analytics Cookies:</strong> Track usage patterns to improve the service (anonymized)</li>
            </ul>
            <p>
              We do NOT use cookies for advertising or external tracking. You can disable cookies in your browser 
              settings, but this may limit functionality.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Children's Privacy</h2>
            <p>
              TaskPlexus is not intended for users under 13 years of age. We do not knowingly collect information 
              from children under 13. If we discover that a child under 13 has provided us with information, we will 
              promptly delete such information and terminate the child's account.
            </p>
            <p>
              Parents or guardians who believe their child has provided information to TaskPlexus should contact us 
              immediately at <a href="mailto:support@taskplexus.com">support@taskplexus.com</a>
            </p>
          </section>

          <section className="legal-section">
            <h2>10. International Data Transfer</h2>
            <p>
              TaskPlexus operates in India and stores data on servers located in India. If you access TaskPlexus from 
              outside India, you consent to the transfer of your data to India, which may have different data protection 
              laws than your country.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. GDPR & Privacy Laws Compliance</h2>
            <p>
              If you are a resident of the European Union or other jurisdiction with privacy laws similar to GDPR, 
              the following additional rights apply:
            </p>
            <ul className="legal-list">
              <li>Right to access your personal data</li>
              <li>Right to rectify inaccurate data</li>
              <li>Right to erasure ("right to be forgotten")</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
              <li>Right to withdraw consent at any time</li>
            </ul>
            <p>
              To exercise these rights, contact us at <a href="mailto:support@taskplexus.com">support@taskplexus.com</a>
            </p>
          </section>

          <section className="legal-section">
            <h2>12. Security Incident Notification</h2>
            <p>
              If we discover a security breach that compromises your personal data, we will notify you within 72 hours 
              of discovery. Notification will be sent to your registered email address and may include information about 
              the incident and recommended actions.
            </p>
          </section>

          <section className="legal-section">
            <h2>13. Third-Party Links</h2>
            <p>
              TaskPlexus may contain links to third-party websites. We are not responsible for the privacy practices 
              of external sites. We recommend reviewing the privacy policies of any third-party services you access.
            </p>
          </section>

          <section className="legal-section">
            <h2>14. Do Not Track (DNT) Signals</h2>
            <p>
              Some browsers include a "Do Not Track" feature. Currently, there is no industry standard for recognizing 
              DNT signals. TaskPlexus does not respond to DNT browser signals, but you can disable cookies in your 
              browser settings.
            </p>
          </section>

          <section className="legal-section">
            <h2>15. Changes to Privacy Policy</h2>
            <p>
              We may update this Privacy Policy periodically to reflect changes in our practices, technology, legal 
              requirements, and other factors. Changes will be effective immediately upon posting.
            </p>
            <p>
              If we make material changes that affect how we handle your data, we will notify you via email or a 
              prominent notice on our website. Continued use of TaskPlexus after changes constitutes your acceptance 
              of the updated Privacy Policy.
            </p>
          </section>

          <section className="legal-section">
            <h2>16. Contact Information</h2>
            <p>
              If you have questions, concerns, or requests regarding this Privacy Policy or our privacy practices, 
              please contact us:
            </p>
            <div className="legal-contact-info">
              <p><strong>TaskPlexus Privacy Team</strong></p>
              <p>Email: <a href="mailto:support@taskplexus.com">support@taskplexus.com</a></p>
              <p>Operated by: Navnath (Individual)</p>
              <p>Location: Mumbai, India</p>
              <p>Response Time: We aim to respond to all inquiries within 7 business days</p>
            </div>
          </section>

          <div className="legal-footer-nav">
            <Link to="/terms">← Terms & Conditions</Link>
            <Link to="/">Back to Home</Link>
            <Link to="/refund-policy">Refund Policy →</Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
