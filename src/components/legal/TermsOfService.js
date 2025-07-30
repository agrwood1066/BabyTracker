import React from 'react';
import { FileText, CreditCard, Users, AlertTriangle, Mail, Shield } from 'lucide-react';
import './Legal.css';

function TermsOfService() {
  return (
    <div className="legal-document">
      <div className="legal-header">
        <FileText size={32} />
        <h1>Terms of Service</h1>
        <p className="last-updated">Last updated: {new Date().toLocaleDateString('en-GB')}</p>
      </div>

      <div className="legal-content">
        <section className="legal-section">
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using Baby Steps Planner ("the Service"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>
        </section>

        <section className="legal-section">
          <h2>2. Description of Service</h2>
          <div className="service-description">
            <h3>Baby Steps Planner provides:</h3>
            <ul>
              <li>Pregnancy planning and organisation tools</li>
              <li>Budget tracking for baby expenses</li>
              <li>Shopping lists with family sharing</li>
              <li>Gift wishlist management</li>
              <li>Hospital bag checklists</li>
              <li>Baby name suggestions and voting</li>
              <li>Family account sharing capabilities</li>
            </ul>
          </div>
        </section>

        <section className="legal-section">
          <h2>3. Account Registration & Eligibility</h2>
          <div className="account-info">
            <Users size={20} />
            <div>
              <h3>Eligibility Requirements</h3>
              <ul>
                <li>You must be at least 18 years old</li>
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining account security</li>
                <li>One account per person (family sharing available)</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="legal-section">
          <h2>4. Subscription & Billing</h2>
          <div className="billing-info">
            <CreditCard size={20} />
            <div>
              <h3>Payment Terms</h3>
              <ul>
                <li><strong>Free Trial:</strong> 7-day free trial for new users</li>
                <li><strong>Billing Cycle:</strong> Monthly or annual subscriptions</li>
                <li><strong>Auto-Renewal:</strong> Subscriptions renew automatically unless cancelled</li>
                <li><strong>Cancellation:</strong> Cancel anytime through your account settings</li>
                <li><strong>Refunds:</strong> Pro-rated refunds for annual subscriptions cancelled within 30 days</li>
              </ul>
              
              <h3>Subscription Features</h3>
              <ul>
                <li><strong>Free Plan:</strong> Basic features with limited family sharing</li>
                <li><strong>Premium Plan:</strong> All features including unlimited family members and advanced export options</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="legal-section">
          <h2>5. Family Sharing & Responsibilities</h2>
          <div className="family-section">
            <h3>🏠 Family Account Rules</h3>
            <ul>
              <li>You are responsible for family members you invite</li>
              <li>Family data is shared among all family members</li>
              <li>Any family member can add, edit, or delete shared content</li>
              <li>You can leave a family at any time through your profile</li>
              <li>Original account holder is responsible for subscription billing</li>
            </ul>
            
            <h3>⚠️ Important Notes</h3>
            <ul>
              <li>Shared data remains visible to family members even if you leave</li>
              <li>Deleting your account will remove your contributions but may affect family data</li>
              <li>Family members should establish their own communication about data management</li>
            </ul>
          </div>
        </section>

        <section className="legal-section">
          <h2>6. Acceptable Use</h2>
          <div className="acceptable-use">
            <h3>✅ You May</h3>
            <ul>
              <li>Use the service for personal pregnancy planning</li>
              <li>Share data with immediate family members</li>
              <li>Export your data for personal use</li>
              <li>Provide feedback and suggestions</li>
            </ul>
            
            <h3>❌ You May Not</h3>
            <ul>
              <li>Resell or redistribute access to the service</li>
              <li>Use the service for commercial pregnancy planning businesses</li>
              <li>Share login credentials with non-family members</li>
              <li>Attempt to reverse engineer or copy the application</li>
              <li>Use the service in any way that violates applicable laws</li>
              <li>Upload harmful, illegal, or inappropriate content</li>
            </ul>
          </div>
        </section>

        <section className="legal-section">
          <h2>7. Data Ownership & Privacy</h2>
          <div className="data-ownership">
            <Shield size={20} />
            <div>
              <h3>Your Data Rights</h3>
              <ul>
                <li>You own all content you create and upload</li>
                <li>We do not claim ownership of your personal data</li>
                <li>You grant us permission to store and process your data to provide the service</li>
                <li>You can export or delete your data at any time</li>
              </ul>
              
              <h3>Our Responsibilities</h3>
              <ul>
                <li>Maintain data security and privacy protections</li>
                <li>Provide reliable service availability</li>
                <li>Honour your data deletion requests</li>
                <li>Comply with applicable data protection laws</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="legal-section">
          <h2>8. Service Availability & Support</h2>
          <div className="service-info">
            <h3>Service Level</h3>
            <ul>
              <li>We aim for 99.9% uptime but cannot guarantee uninterrupted service</li>
              <li>Scheduled maintenance will be announced in advance when possible</li>
              <li>Emergency maintenance may occur without notice</li>
            </ul>
            
            <h3>Customer Support</h3>
            <ul>
              <li>Email support: <a href="mailto:hello@babystepsplanner.com">hello@babystepsplanner.com</a></li>
              <li>Response time: Within 48 hours for general inquiries</li>
              <li>Priority support for billing and account issues</li>
            </ul>
          </div>
        </section>

        <section className="legal-section">
          <h2>9. Limitation of Liability</h2>
          <div className="liability-section">
            <AlertTriangle size={20} />
            <div>
              <h3>Medical Disclaimer</h3>
              <p><strong>Baby Steps Planner is a planning tool only and does not provide medical advice.</strong> Always consult with qualified healthcare professionals for medical decisions during pregnancy.</p>
              
              <h3>Service Limitations</h3>
              <ul>
                <li>We are not liable for any decisions made based on information in the app</li>
                <li>We are not responsible for loss of data due to user actions</li>
                <li>Our liability is limited to the amount paid for the service</li>
                <li>We provide the service "as is" without warranties</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="legal-section">
          <h2>10. Account Termination</h2>
          <div className="termination-info">
            <h3>You Can</h3>
            <ul>
              <li>Cancel your subscription at any time</li>
              <li>Delete your account through profile settings</li>
              <li>Export your data before deletion</li>
            </ul>
            
            <h3>We May Terminate</h3>
            <ul>
              <li>Accounts that violate these terms</li>
              <li>Accounts with chargebacks or payment issues</li>
              <li>Inactive accounts after extended periods</li>
            </ul>
            
            <h3>Data After Termination</h3>
            <ul>
              <li>Your personal data will be deleted within 30 days</li>
              <li>Shared family data may remain for other family members</li>
              <li>Backups will be purged within 90 days</li>
            </ul>
          </div>
        </section>

        <section className="legal-section">
          <h2>11. Changes to Terms</h2>
          <p>We may update these terms from time to time. Material changes will be notified by email and by updating the "last updated" date. Continued use of the service after changes constitutes acceptance of the new terms.</p>
        </section>

        <section className="legal-section">
          <h2>12. Governing Law</h2>
          <p>These terms are governed by the laws of England and Wales. Any disputes will be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
        </section>

        <section className="legal-section">
          <h2>13. Contact Information</h2>
          <div className="contact-info">
            <Mail size={20} />
            <div>
              <h3>Questions About These Terms</h3>
              <p>Email: <a href="mailto:hello@babystepsplanner.com">hello@babystepsplanner.com</a></p>
              <p>We will respond to all inquiries within 48 hours.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default TermsOfService;