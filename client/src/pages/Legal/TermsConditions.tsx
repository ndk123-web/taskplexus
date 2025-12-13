import { Link } from 'react-router-dom';
import Footer from '../../components/layout/Footer';
import '../../styles/pages/Legal.css';
import SEO from '../../components/SEO';

const TermsConditions = () => {
  return (
    <div className="legal-page">
      <SEO 
        title="Terms & Conditions" 
        description="Read the Terms & Conditions for using TaskPlexus. Understand your rights and responsibilities."
      />
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
          <h1>Terms & Conditions</h1>
          <p className="legal-date">Last Updated: December 2025</p>
        </div>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using TaskPlexus ("Service"), you accept and agree to be bound by the terms, 
              conditions, and notices contained in this agreement. If you do not agree to these Terms & Conditions, 
              please do not use this service.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Service Description</h2>
            <p>
              TaskPlexus is a cloud-based AI-powered task management and productivity platform. The Service allows 
              users to:
            </p>
            <ul className="legal-list">
              <li>Create and manage workspaces, tasks, and goals</li>
              <li>Utilize AI-powered planning and chat features</li>
              <li>Visualize task dependencies through flowcharts</li>
              <li>Track activity and productivity analytics</li>
              <li>Access offline capabilities through IndexedDB</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. User Accounts & Responsibilities</h2>
            <p>
              To use TaskPlexus, you must create an account with accurate, current, and complete information. You are 
              responsible for:
            </p>
            <ul className="legal-list">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>Accepting responsibility for all activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
              <li>Using the Service in compliance with all applicable laws and regulations</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. AI Features Disclaimer</h2>
            <p>
              TaskPlexus includes AI-powered features (AI Planner and AI Chat) that generate suggestions, plans, 
              and summaries based on your data. You understand and acknowledge that:
            </p>
            <ul className="legal-list">
              <li>AI-generated content is provided for informational and assistance purposes only</li>
              <li>AI suggestions may not always be accurate, complete, or suitable for your specific needs</li>
              <li>You are solely responsible for reviewing and validating any AI-generated content before acting on it</li>
              <li>TaskPlexus does not guarantee the accuracy, reliability, or appropriateness of AI outputs</li>
              <li>You should not rely exclusively on AI features for critical business decisions</li>
              <li>TaskPlexus is not liable for any consequences arising from your use or reliance on AI-generated content</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Subscription Plans & Billing</h2>
            <p>
              <strong>Free Plan:</strong> Users can access the Free plan indefinitely with the following limits:
            </p>
            <ul className="legal-list">
              <li>2 Workspaces</li>
              <li>Unlimited Todos and Goals per workspace</li>
              <li>5 AI Planner requests (lifetime)</li>
              <li>5 AI Chat requests (lifetime)</li>
              <li>Basic analytics and offline access</li>
            </ul>

            <p style={{ marginTop: '16px' }}>
              <strong>Premium Plan (₹99/month):</strong> Premium is a manual monthly payment with the following benefits:
            </p>
            <ul className="legal-list">
              <li>10 Workspaces</li>
              <li>Unlimited Todos and Goals</li>
              <li>50 AI Planner requests per day</li>
              <li>50 AI Chat requests per day</li>
              <li>Advanced analytics and priority support</li>
            </ul>

            <p style={{ marginTop: '16px' }}>
              <strong>Billing Model:</strong> Premium is NOT auto-renewable. You must manually purchase Premium each 
              month if you wish to continue access. Payment is processed via Razorpay and is non-refundable.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Cancellation & Access After Expiry</h2>
            <p>
              You can cancel your Premium subscription at any time. After expiration or cancellation:
            </p>
            <ul className="legal-list">
              <li>Premium features remain active until the end of your paid billing cycle</li>
              <li>After expiry, your account reverts to Free plan limitations</li>
              <li>No refunds are issued for unused portions of a paid month</li>
              <li>Your data remains accessible under Free plan restrictions</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>7. Usage Limits & Fair Use</h2>
            <p>
              To maintain service quality and prevent abuse:
            </p>
            <ul className="legal-list">
              <li>Free plan users are limited to 5 AI Planner and 5 AI Chat requests (lifetime)</li>
              <li>Premium users are limited to 50 AI Planner and 50 AI Chat requests per day</li>
              <li>Excessive API requests, automated scraping, or denial-of-service attacks are prohibited</li>
              <li>TaskPlexus reserves the right to suspend accounts for heavy abuse or policy violations</li>
              <li>Rate limiting may be applied to ensure fair service for all users</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>8. Prohibited Activities</h2>
            <p>You agree not to use TaskPlexus for:</p>
            <ul className="legal-list">
              <li>Illegal activities or content that violates any law or regulation</li>
              <li>Harassment, threats, or defamatory content</li>
              <li>Transmitting malware, viruses, or harmful code</li>
              <li>Reverse engineering, decompiling, or attempting to extract source code</li>
              <li>Automated scraping or data extraction without permission</li>
              <li>Reselling, redistributing, or commercializing the Service without authorization</li>
              <li>Impersonating other users or providing false information</li>
              <li>Circumventing security features or unauthorized access attempts</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>9. Intellectual Property Rights</h2>
            <p>
              TaskPlexus and its content (including but not limited to logos, text, graphics, and software) are the 
              exclusive property of TaskPlexus and its licensors. You may not copy, modify, distribute, or reproduce 
              any part of the Service without explicit permission.
            </p>
            <p>
              User-generated content (tasks, goals, notes) remains your property. By using TaskPlexus, you grant us 
              a license to store, backup, and process your content solely for providing the Service.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, TASKPLEXUS AND ITS SUPPLIERS SHALL NOT BE LIABLE FOR ANY 
              DAMAGES (INCLUDING BUT NOT LIMITED TO DIRECT, INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES) 
              ARISING OUT OF OR IN CONNECTION WITH:
            </p>
            <ul className="legal-list">
              <li>Use or inability to use the Service</li>
              <li>Loss of data, revenue, or profits</li>
              <li>Business interruption or service downtime</li>
              <li>Unauthorized access to or modification of your data</li>
              <li>Any third-party content or services</li>
            </ul>
            <p>
              This limitation applies even if TaskPlexus has been advised of the possibility of such damages.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Warranty Disclaimer</h2>
            <p>
              TASKPLEXUS IS PROVIDED ON AN "AS-IS" AND "AS-AVAILABLE" BASIS. TASKPLEXUS MAKES NO WARRANTIES, 
              EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="legal-list">
              <li>MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE</li>
              <li>UNINTERRUPTED, ERROR-FREE, OR SECURE SERVICE</li>
              <li>ABSENCE OF VIRUSES OR HARMFUL COMPONENTS</li>
              <li>ACCURACY OR COMPLETENESS OF CONTENT</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>12. Data Handling & Privacy</h2>
            <p>
              Your use of TaskPlexus is governed by our Privacy Policy. TaskPlexus stores and processes your data 
              (including tasks, goals, and workspace information) on secure servers. We use encryption and industry-standard 
              security practices to protect your information.
            </p>
            <p>
              We do not sell, share, or monetize your personal data. Your data is accessed only by you and is never 
              shown to third parties except where required by law.
            </p>
          </section>

          <section className="legal-section">
            <h2>13. Service Availability & Maintenance</h2>
            <p>
              While we strive to maintain 99% uptime, TaskPlexus does not guarantee uninterrupted service. We may 
              perform scheduled maintenance or updates, which may temporarily interrupt the Service. We will endeavor 
              to provide notice of scheduled maintenance.
            </p>
          </section>

          <section className="legal-section">
            <h2>14. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless TaskPlexus, its owners, operators, and employees from 
              any claims, damages, or costs (including legal fees) arising from:
            </p>
            <ul className="legal-list">
              <li>Your violation of these Terms & Conditions</li>
              <li>Your use of the Service</li>
              <li>Your content or user-generated data</li>
              <li>Your violation of any third-party rights</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>15. Termination of Service</h2>
            <p>
              TaskPlexus reserves the right to suspend or terminate your account if you:
            </p>
            <ul className="legal-list">
              <li>Violate these Terms & Conditions</li>
              <li>Engage in illegal or harmful activities</li>
              <li>Abuse the Service or overuse resources</li>
              <li>Fail to comply with our policies</li>
            </ul>
            <p>
              Upon termination, your access will be revoked, but your data may be retained for backup purposes in 
              accordance with our Privacy Policy.
            </p>
          </section>

          <section className="legal-section">
            <h2>16. Third-Party Links & Services</h2>
            <p>
              TaskPlexus may contain links to third-party websites, services, or tools. We do not endorse, control, 
              or assume responsibility for these external services. Your use of third-party services is governed by 
              their terms and policies. TaskPlexus is not liable for any damage or loss arising from your use of 
              third-party services.
            </p>
          </section>

          <section className="legal-section">
            <h2>17. Modification of Terms</h2>
            <p>
              TaskPlexus reserves the right to modify these Terms & Conditions at any time. Changes will be effective 
              immediately upon posting. Continued use of the Service after modifications constitutes your acceptance 
              of the updated terms. We recommend reviewing this page periodically for updates.
            </p>
          </section>

          <section className="legal-section">
            <h2>18. Governing Law & Jurisdiction</h2>
            <p>
              These Terms & Conditions are governed by and construed in accordance with the laws of India, without 
              regard to its conflict of law provisions. You agree to submit to the exclusive jurisdiction of the 
              courts located in Mumbai, India.
            </p>
          </section>

          <section className="legal-section">
            <h2>19. Severability</h2>
            <p>
              If any provision of these Terms & Conditions is found to be invalid or unenforceable, the remaining 
              provisions shall remain in full force and effect.
            </p>
          </section>

          <section className="legal-section">
            <h2>20. Contact Information</h2>
            <p>
              If you have questions about these Terms & Conditions, please contact us at:
            </p>
            <div className="legal-contact-info">
              <p><strong>TaskPlexus</strong></p>
              <p>Operated by: Navnath (Individual)</p>
              <p>Email: <a href="mailto:support@taskplexus.com">support@taskplexus.com</a></p>
              <p>Location: Mumbai, India</p>
            </div>
          </section>

          <div className="legal-footer-nav">
            <Link to="/privacy">← Privacy Policy</Link>
            <Link to="/">Back to Home</Link>
            <Link to="/refund-policy">Refund Policy →</Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsConditions;
