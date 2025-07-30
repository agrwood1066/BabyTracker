import React from 'react';
import { Shield, Mail, Database, Users, Trash2, Download } from 'lucide-react';
import './Legal.css';

function PrivacyPolicy() {
  return (
    <div className="legal-document">
      <div className="legal-header">
        <Shield size={32} />
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last updated: {new Date().toLocaleDateString('en-GB')}</p>
      </div>

      <div className="legal-content">
        <section className="legal-section">
          <h2>1. Information We Collect</h2>
          <div className="info-grid">
            <div className="info-item">
              <Database size={20} />
              <div>
                <h3>Account Information</h3>
                <ul>
                  <li>Email address (for login and communication)</li>
                  <li>Full name (optional, for personalisation)</li>
                  <li>Due date (for pregnancy tracking features)</li>
                </ul>
              </div>
            </div>
            <div className="info-item">
              <Users size={20} />
              <div>
                <h3>Family Data</h3>
                <ul>
                  <li>Shopping lists and baby items</li>
                  <li>Budget categories and spending</li>
                  <li>Baby name suggestions and votes</li>
                  <li>Hospital bag checklists</li>
                  <li>Gift wishlists</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="legal-section">
          <h2>2. How We Use Your Information</h2>
          <ul className="usage-list">
            <li><strong>Service Delivery:</strong> To provide Baby Steps Planner functionality</li>
            <li><strong>Family Sharing:</strong> To enable data sharing with family members you invite</li>
            <li><strong>Account Management:</strong> To manage your subscription and provide support</li>
            <li><strong>Communication:</strong> To send important service updates and respond to support requests</li>
            <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. Data Security & Storage</h2>
          <div className="security-info">
            <h3>🔒 Security Measures</h3>
            <ul>
              <li>All data encrypted in transit and at rest</li>
              <li>Secure authentication via Supabase</li>
              <li>Row Level Security (RLS) policies protecting family data isolation</li>
              <li>Regular security monitoring and updates</li>
            </ul>
            
            <h3>🏠 Data Location</h3>
            <p>Your data is stored securely with Supabase (based in the US) with GDPR compliance measures in place.</p>
          </div>
        </section>

        <section className="legal-section">
          <h2>4. Family Sharing & Data Control</h2>
          <div className="sharing-info">
            <h3>What Gets Shared</h3>
            <p>When you share your family code, the following data becomes accessible to family members:</p>
            <ul>
              <li>Shopping lists and baby items (with original contributor noted)</li>
              <li>Budget categories and spending (family-wide view)</li>
              <li>Baby name suggestions and voting</li>
              <li>Hospital bag checklists</li>
              <li>Gift wishlists</li>
            </ul>
            
            <h3>What Stays Private</h3>
            <ul>
              <li>Your personal account details (email, password)</li>
              <li>Data from other families (complete isolation)</li>
              <li>Private notes marked as personal</li>
            </ul>
          </div>
        </section>

        <section className="legal-section">
          <h2>5. Your Rights Under GDPR</h2>
          <div className="rights-grid">
            <div className="right-item">
              <Download size={20} />
              <div>
                <h3>Right to Data Portability</h3>
                <p>Export your data using our CSV export feature or contact support for complete data export.</p>
              </div>
            </div>
            <div className="right-item">
              <Trash2 size={20} />
              <div>
                <h3>Right to Erasure</h3>
                <p>Delete your account and associated data through your Profile settings or contact support.</p>
              </div>
            </div>
            <div className="right-item">
              <Mail size={20} />
              <div>
                <h3>Right to Access</h3>
                <p>Request a copy of all personal data we hold about you by contacting support.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="legal-section">
          <h2>6. Data Retention</h2>
          <ul>
            <li><strong>Active Accounts:</strong> Data retained while account is active</li>
            <li><strong>Deleted Accounts:</strong> Personal data deleted within 30 days</li>
            <li><strong>Shared Family Data:</strong> Items you contributed may remain if still used by family members</li>
            <li><strong>Backup Systems:</strong> Deleted data removed from backups within 90 days</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>7. Third-Party Services</h2>
          <div className="third-party-info">
            <h3>Services We Use</h3>
            <ul>
              <li><strong>Supabase:</strong> Database and authentication (privacy policy: supabase.com/privacy)</li>
              <li><strong>LinkPreview.net:</strong> Product image extraction for wishlists</li>
              <li><strong>Cloudflare:</strong> Hosting and content delivery</li>
              <li><strong>Payment Processors:</strong> For subscription billing (when applicable)</li>
            </ul>
            <p>These services have their own privacy policies and data handling practices.</p>
          </div>
        </section>

        <section className="legal-section">
          <h2>8. Children's Privacy</h2>
          <p>Baby Steps Planner is designed for expectant parents (18+). We do not knowingly collect personal information from children under 16. If we discover such data has been collected, we will delete it immediately.</p>
        </section>

        <section className="legal-section">
          <h2>9. Changes to This Policy</h2>
          <p>We may update this privacy policy from time to time. We will notify you of any material changes by email and by updating the "last updated" date at the top of this policy.</p>
        </section>

        <section className="legal-section">
          <h2>10. Contact Us</h2>
          <div className="contact-info">
            <Mail size={20} />
            <div>
              <h3>Data Protection & Privacy Questions</h3>
              <p>Email: <a href="mailto:hello@babystepsplanner.com">hello@babystepsplanner.com</a></p>
              <p>We aim to respond to all privacy requests within 30 days.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPolicy;