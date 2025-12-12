import { Link } from 'react-router-dom';
import Footer from '../../components/layout/Footer';
import '../../styles/pages/Legal.css';

const RefundPolicy = () => {
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
          <h1>Refund & Cancellation Policy</h1>
          <p className="legal-date">Last Updated: December 2025</p>
        </div>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Overview</h2>
            <p>
              TaskPlexus offers a Free plan and a Premium plan. This Refund & Cancellation Policy covers the 
              Premium subscription model and outlines our refund and cancellation procedures.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Subscription Model</h2>
            <p>
              <strong>TaskPlexus Premium is a manual monthly payment model with NO auto-renewal.</strong>
            </p>
            <ul className="legal-list">
              <li><strong>Billing Frequency:</strong> Monthly</li>
              <li><strong>Auto-Renewal:</strong> DISABLED - You must manually renew each month</li>
              <li><strong>Price:</strong> ₹99 per month (in Indian Rupees)</li>
              <li><strong>Payment Method:</strong> Credit card, debit card, UPI, or wallet via Razorpay</li>
              <li><strong>Billing Date:</strong> You choose your billing date during first purchase</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. How Premium Works</h2>

            <h3 className="legal-subheading">3.1 Purchase Process</h3>
            <ul className="legal-list">
              <li>Navigate to Settings Billing in your TaskPlexus account</li>
              <li>Click "Buy Premium" and proceed through Razorpay checkout</li>
              <li>Your Premium plan becomes active immediately after successful payment</li>
              <li>You will receive a confirmation email with your billing details and invoice</li>
            </ul>

            <h3 className="legal-subheading">3.2 What You Get</h3>
            <p>During your paid month, you enjoy:</p>
            <ul className="legal-list">
              <li>10 Workspaces (vs. 2 on Free plan)</li>
              <li>Unlimited Todos and Goals</li>
              <li>50 AI Planner requests per day</li>
              <li>50 AI Chat requests per day</li>
              <li>Advanced Analytics</li>
              <li>Priority Support</li>
            </ul>

            <h3 className="legal-subheading">3.3 When Your Plan Expires</h3>
            <ul className="legal-list">
              <li>Your Premium plan is active until the end of your paid calendar month</li>
              <li>You will receive an email reminder 7 days before expiry</li>
              <li>On the expiry date, your account automatically reverts to the Free plan</li>
              <li>Your data remains accessible under Free plan limits</li>
              <li>If you want to continue, you must manually purchase Premium again</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Refund Policy</h2>

            <h3 className="legal-subheading">4.1 No Refunds - Non-Refundable Payments</h3>
            <p>
              <strong>All Premium purchases are FINAL and NON-REFUNDABLE.</strong>
            </p>
            <p>
              Once you purchase Premium and payment is processed successfully, you cannot request a refund for:
            </p>
            <ul className="legal-list">
              <li>Unused portions of your paid month</li>
              <li>Changes of mind after purchase</li>
              <li>Downgrading to Free plan mid-month</li>
              <li>Service unavailability or downtime</li>
              <li>Dissatisfaction with features</li>
            </ul>

            <h3 className="legal-subheading">4.2 Exceptions to Non-Refund Policy</h3>
            <p>
              Refunds may be issued ONLY in the following circumstances:
            </p>
            <ul className="legal-list">
              <li><strong>Payment Error:</strong> Duplicate charges or unauthorized transactions (with proof)</li>
              <li><strong>Service Failure:</strong> Critical, unresolved service outages lasting &gt;7 days during your paid month</li>
              <li><strong>Security Breach:</strong> Breach of your data due to our negligence</li>
              <li><strong>Platform Discontinuation:</strong> If TaskPlexus permanently shuts down</li>
            </ul>
            <p>
              Even in these exceptions, refunds will be processed within 30 days after our investigation and approval.
            </p>

            <h3 className="legal-subheading">4.3 How to Request a Refund</h3>
            <p>
              If you believe you qualify for a refund:
            </p>
            <ol className="legal-list" style={{ listStyleType: 'decimal' }}>
              <li>Contact our support team at <a href="mailto:support@taskplexus.com">support@taskplexus.com</a></li>
              <li>Provide your account email, transaction ID (from Razorpay receipt), and detailed reason</li>
              <li>Include any supporting documentation (screenshots, error logs, etc.)</li>
              <li>We will review your request and respond within 7-10 business days</li>
              <li>Approved refunds will be credited to your original payment method within 5-10 business days</li>
            </ol>

            <h3 className="legal-subheading">4.4 Refund Processing Timeline</h3>
            <ul className="legal-list">
              <li><strong>Review Period:</strong> 7-10 business days after submission</li>
              <li><strong>Processing:</strong> 5-10 business days after approval (varies by bank/payment method)</li>
              <li><strong>Currency:</strong> Refunds are issued in INR (Indian Rupees)</li>
              <li><strong>Method:</strong> Original payment method (credit card, debit card, UPI, etc.)</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Cancellation Policy</h2>

            <h3 className="legal-subheading">5.1 Canceling Your Subscription</h3>
            <p>
              Since TaskPlexus Premium uses manual renewal (no auto-renewal), canceling is simple:
            </p>
            <ul className="legal-list">
              <li>You don't need to formally "cancel" anything</li>
              <li>Simply don't purchase Premium again when your current month expires</li>
              <li>Your account will automatically revert to the Free plan</li>
            </ul>

            <h3 className="legal-subheading">5.2 Access After Cancellation</h3>
            <p>
              <strong>Important:</strong> After your paid month expires:
            </p>
            <ul className="legal-list">
              <li>Your account is limited to Free plan restrictions (2 workspaces, limited AI requests)</li>
              <li>If you had more than 2 workspaces, only the first 2 remain accessible</li>
              <li>Your data is NOT deleted; it's preserved under Free plan limits</li>
              <li>You can purchase Premium again anytime to restore Premium features</li>
            </ul>

            <h3 className="legal-subheading">5.3 Requesting Early Termination</h3>
            <p>
              If you wish to terminate your subscription before your paid month ends:
            </p>
            <ul className="legal-list">
              <li>Contact <a href="mailto:support@taskplexus.com">support@taskplexus.com</a> with your request</li>
              <li>We can flag your account to prevent automatic renewal (if future auto-renewal is added)</li>
              <li><strong>No partial refunds are issued for mid-month cancellation</strong></li>
              <li>Premium features remain active until the end of your paid month</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>6. Chargeback & Dispute Policy</h2>

            <h3 className="legal-subheading">6.1 Unauthorized Transactions</h3>
            <p>
              If you believe a transaction is unauthorized or fraudulent:
            </p>
            <ul className="legal-list">
              <li>Contact us immediately at <a href="mailto:support@taskplexus.com">support@taskplexus.com</a></li>
              <li>Provide your account email, transaction ID, and reason</li>
              <li>We will investigate and issue a refund if fraud is confirmed</li>
            </ul>

            <h3 className="legal-subheading">6.2 Chargeback Consequences</h3>
            <p>
              If you initiate a chargeback through your bank without contacting us first:
            </p>
            <ul className="legal-list">
              <li>We will investigate the chargeback claim</li>
              <li>If the chargeback is reversed, we reserve the right to suspend your account</li>
              <li>Future chargebacks may result in permanent account termination</li>
            </ul>
            <p>
              We strongly recommend contacting us directly before initiating chargebacks, as this helps resolve 
              disputes faster.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Billing Disputes & Errors</h2>

            <h3 className="legal-subheading">7.1 Incorrect Charges</h3>
            <p>
              If you notice billing errors:
            </p>
            <ul className="legal-list">
              <li>Contact us within 30 days of the charge</li>
              <li>Provide your transaction ID and account details</li>
              <li>We will investigate and issue a refund if an error is confirmed</li>
            </ul>

            <h3 className="legal-subheading">7.2 Missing or Delayed Services</h3>
            <p>
              If you do not receive Premium features after payment:
            </p>
            <ul className="legal-list">
              <li>Try refreshing your browser or logging out and back in</li>
              <li>Check your email for payment confirmation</li>
              <li>Contact support if the issue persists after 24 hours</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>8. Tax & Currency Information</h2>

            <h3 className="legal-subheading">8.1 Pricing in INR</h3>
            <p>
              All TaskPlexus Premium prices are displayed in Indian Rupees (₹). If you pay from a different country, 
              your bank may apply currency conversion and foreign transaction fees.
            </p>

            <h3 className="legal-subheading">8.2 Taxes & GST</h3>
            <p>
              In India, we include applicable GST (Goods and Services Tax) in the displayed price. Your invoice will 
              show the breakdown of GST if applicable. TaskPlexus is registered under GST laws in India.
            </p>

            <h3 className="legal-subheading">8.3 International Payments</h3>
            <p>
              International customers are responsible for any currency conversion fees, taxes, or duties imposed by 
              their country or financial institution.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Promotional Offers & Coupons</h2>

            <h3 className="legal-subheading">9.1 Coupon Redemption</h3>
            <p>
              If we offer promotional coupons or discount codes:
            </p>
            <ul className="legal-list">
              <li>Coupons are single-use unless otherwise stated</li>
              <li>Discounts apply only to the first month or specified period</li>
              <li>Coupons cannot be combined unless explicitly allowed</li>
              <li>Expired coupons are invalid and cannot be redeemed</li>
            </ul>

            <h3 className="legal-subheading">9.2 Refunds on Discounted Purchases</h3>
            <p>
              Purchases made with coupons or promotions are still non-refundable. The discount applied does not 
              change our refund policy.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Razorpay Payment Terms</h2>

            <h3 className="legal-subheading">10.1 Payment Processing</h3>
            <p>
              TaskPlexus uses Razorpay for payment processing. By making a payment, you agree to Razorpay's terms 
              and conditions. Razorpay is PCI-DSS compliant and handles all sensitive payment information securely.
            </p>

            <h3 className="legal-subheading">10.2 Failed Payments</h3>
            <p>
              If your payment fails:
            </p>
            <ul className="legal-list">
              <li>You will be notified via email</li>
              <li>No funds will be deducted if the transaction fails</li>
              <li>You can retry payment immediately or at any time before your current month expires</li>
            </ul>

            <h3 className="legal-subheading">10.3 Razorpay Support</h3>
            <p>
              For payment-related issues, you can also contact Razorpay support directly. Your Razorpay receipt 
              contains a transaction ID for reference.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Data & Account Restoration</h2>

            <h3 className="legal-subheading">11.1 Deleted Account Recovery</h3>
            <p>
              If you accidentally delete your account:
            </p>
            <ul className="legal-list">
              <li>Contact us within 7 days of deletion</li>
              <li>We may be able to restore your account and data</li>
              <li>After 7 days, data may be permanently deleted</li>
            </ul>

            <h3 className="legal-subheading">11.2 Data Backup</h3>
            <p>
              You are responsible for backing up your important data. We recommend exporting your tasks and goals 
              regularly. While we maintain backups for disaster recovery, we do not guarantee recovery of deleted data.
            </p>
          </section>

          <section className="legal-section">
            <h2>12. Liability Limitation</h2>
            <p>
              TaskPlexus is not liable for:
            </p>
            <ul className="legal-list">
              <li>Financial losses due to service unavailability</li>
              <li>Loss of data not backed up by you</li>
              <li>Third-party payment processing issues</li>
              <li>Currency conversion or foreign transaction fees</li>
            </ul>
            <p>
              In all cases, TaskPlexus's total liability shall not exceed the amount paid in the 12 months 
              preceding the claim.
            </p>
          </section>

          <section className="legal-section">
            <h2>13. Changes to Pricing & Refund Policy</h2>

            <h3 className="legal-subheading">13.1 Price Changes</h3>
            <p>
              TaskPlexus reserves the right to change Premium pricing at any time. Price changes will not affect 
              your current month; they apply to future renewals only.
            </p>

            <h3 className="legal-subheading">13.2 Policy Updates</h3>
            <p>
              We may update this Refund & Cancellation Policy periodically. Changes will be effective immediately 
              upon posting. Continued use of TaskPlexus Premium constitutes acceptance of updated terms.
            </p>
          </section>

          <section className="legal-section">
            <h2>14. Contact Information</h2>
            <p>
              For refund requests, billing questions, or cancellation assistance, please contact us:
            </p>
            <div className="legal-contact-info">
              <p><strong>TaskPlexus Support Team</strong></p>
              <p>Email: <a href="mailto:support@taskplexus.com">support@taskplexus.com</a></p>
              <p>Response Time: 24-48 hours</p>
              <p>Location: Mumbai, India</p>
              <p>Hours: Monday - Friday, 10 AM - 6 PM IST</p>
            </div>
          </section>

          <div className="legal-footer-nav">
            <Link to="/terms">← Terms & Conditions</Link>
            <Link to="/">Back to Home</Link>
            <Link to="/privacy">Privacy Policy →</Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RefundPolicy;
