import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function ClientPortalSimulator() {
  const [activeTab, setActiveTab] = useState('auth');
  const [currentUser, setCurrentUser] = useState(null);
  const [services, setServices] = useState([
    { id: 'lead-gen', name: 'Lead Generation', active: true, plan: 'Pro', renewalDate: '2024-12-31' },
    { id: 'email', name: 'Email Marketing', active: false, plan: 'Starter' },
    { id: 'seo', name: 'SEO Services', active: true, plan: 'Business', renewalDate: '2024-11-15' },
  ]);
  const [billingHistory, setBillingHistory] = useState([
    { id: 'inv_001', date: '2024-07-01', amount: 199.99, status: 'Paid', service: 'Lead Generation' },
    { id: 'inv_002', date: '2024-06-01', amount: 199.99, status: 'Paid', service: 'Lead Generation' },
    { id: 'inv_003', date: '2024-05-01', amount: 149.99, status: 'Paid', service: 'Lead Generation' },
  ]);

  useEffect(() => {
    // This code will only run on the client side
    if (typeof window !== 'undefined') {
      // Create test user
      document.getElementById('createUser')?.addEventListener('click', async () => {
        try {
          const email = document.getElementById('emailInput').value;
          const password = document.getElementById('passwordInput').value;
          
          if (!email || !password) {
            throw new Error('Email and password are required');
          }
          
          const response = await fetch('/api/test/create-test-user', { 
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-secret-key': process.env.NEXT_PUBLIC_API_SECRET_KEY || 'test-key'
            },
            body: JSON.stringify({ email, password })
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            console.error('Error response:', data);
            throw new Error(data.error || 'Failed to create test user');
          }
          
          setCurrentUser({
            ...data.user,
            email,
            full_name: 'Test Client',
            avatar_url: '/default-avatar.png',
            last_login: new Date().toISOString(),
            subscription: {
              status: 'active',
              plan: 'Pro',
              next_billing: '2024-08-30',
              payment_method: 'Visa ending in 4242'
            }
          });
          
          document.getElementById('userEmail').textContent = email;
          document.getElementById('userPassword').textContent = '********';
          document.getElementById('auth-section').style.display = 'none';
          document.getElementById('portal-section').style.display = 'block';
          
        } catch (error) {
          const userResult = document.getElementById('userResult');
          userResult.className = 'result error';
          userResult.textContent = `Error: ${error.message}`;
        }
      });
    }
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="tab-content">
            <h2>Dashboard Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Active Services</h3>
                <p className="stat-number">{services.filter(s => s.active).length}</p>
              </div>
              <div className="stat-card">
                <h3>Next Billing</h3>
                <p className="stat-number">${services.reduce((sum, s) => s.active ? sum + 199.99 : sum, 0).toFixed(2)}</p>
                <p className="stat-desc">Due on {currentUser?.subscription?.next_billing}</p>
              </div>
              <div className="stat-card">
                <h3>Support Tickets</h3>
                <p className="stat-number">2</p>
                <p className="stat-desc">Active tickets</p>
              </div>
            </div>
            
            <h3>Recent Activity</h3>
            <div className="activity-feed">
              <div className="activity-item">
                <span className="activity-icon">✓</span>
                <div>
                  <p>Your monthly report is ready</p>
                  <small>2 hours ago</small>
                </div>
              </div>
              <div className="activity-item">
                <span className="activity-icon">🔄</span>
                <div>
                  <p>SEO campaign updated</p>
                  <small>1 day ago</small>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'services':
        return (
          <div className="tab-content">
            <h2>My Services</h2>
            <div className="services-grid">
              {services.map(service => (
                <div key={service.id} className={`service-card ${service.active ? 'active' : ''}`}>
                  <h3>{service.name}</h3>
                  <p className="service-plan">{service.plan} Plan</p>
                  {service.renewalDate && (
                    <p className="renewal">Renews: {service.renewalDate}</p>
                  )}
                  <div className="service-actions">
                    <button className="btn btn-primary">Manage</button>
                    {service.active ? (
                      <button className="btn btn-outline">Pause</button>
                    ) : (
                      <button className="btn btn-secondary">Activate</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'billing':
        return (
          <div className="tab-content">
            <h2>Billing & Invoices</h2>
            <div className="billing-summary">
              <div>
                <h3>Current Plan</h3>
                <p className="plan-name">{currentUser?.subscription?.plan} Plan</p>
                <p>Next billing: {currentUser?.subscription?.next_billing}</p>
              </div>
              <div>
                <h3>Payment Method</h3>
                <p>{currentUser?.subscription?.payment_method}</p>
                <button className="btn btn-text">Update</button>
              </div>
            </div>
            
            <h3>Billing History</h3>
            <table className="billing-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Service</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.map(invoice => (
                  <tr key={invoice.id}>
                    <td>{invoice.date}</td>
                    <td>{invoice.service}</td>
                    <td>${invoice.amount.toFixed(2)}</td>
                    <td><span className={`status-badge ${invoice.status.toLowerCase()}`}>{invoice.status}</span></td>
                    <td><button className="btn btn-text">Download</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        
      case 'support':
        return (
          <div className="tab-content">
            <h2>Support Center</h2>
            <div className="support-options">
              <div className="support-card">
                <h3>Submit a Ticket</h3>
                <p>Need help? Our support team is here to assist you.</p>
                <button className="btn btn-primary">Create Ticket</button>
              </div>
              <div className="support-card">
                <h3>Knowledge Base</h3>
                <p>Find answers to common questions in our help center.</p>
                <button className="btn btn-outline">Browse Articles</button>
              </div>
            </div>
            
            <h3>Recent Tickets</h3>
            <div className="tickets-list">
              <div className="ticket">
                <div className="ticket-header">
                  <span className="ticket-status open">Open</span>
                  <span className="ticket-date">2 days ago</span>
                </div>
                <h4>Question about my campaign performance</h4>
                <p>I'd like to understand the metrics better...</p>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="client-portal">
      <Head>
        <title>Client Portal Simulator</title>
        <style jsx global>{`
          :root {
            --primary: #4a6cf7;
            --primary-dark: #3a5ce4;
            --secondary: #6c757d;
            --success: #28a745;
            --danger: #dc3545;
            --light: #f8f9fa;
            --dark: #343a40;
            --border: #dee2e6;
            --card-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f7fb;
          }
          
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          
          /* Auth Section */
          #auth-section {
            max-width: 500px;
            margin: 50px auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: var(--card-shadow);
          }
          
          .form-group {
            margin-bottom: 20px;
          }
          
          label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
          }
          
          input[type="email"],
          input[type="password"] {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid var(--border);
            border-radius: 4px;
            font-size: 16px;
          }
          
          .btn {
            display: inline-block;
            padding: 10px 16px;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            text-align: center;
            text-decoration: none;
            transition: all 0.2s;
          }
          
          .btn-primary {
            background: var(--primary);
            color: white;
          }
          
          .btn-primary:hover {
            background: var(--primary-dark);
          }
          
          .btn-outline {
            background: transparent;
            border: 1px solid var(--primary);
            color: var(--primary);
          }
          
          .btn-text {
            background: none;
            border: none;
            color: var(--primary);
            padding: 0;
            text-decoration: underline;
          }
          
          .result {
            margin-top: 15px;
            padding: 12px;
            border-radius: 4px;
          }
          
          .success {
            background-color: #d4edda;
            color: #155724;
          }
          
          .error {
            background-color: #f8d7da;
            color: #721c24;
          }
          
          /* Portal Header */
          .portal-header {
            background: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            padding: 15px 0;
            margin-bottom: 30px;
          }
          
          .portal-header .container {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .user-menu {
            display: flex;
            align-items: center;
            gap: 15px;
          }
          
          .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #e9ecef;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: var(--primary);
          }
          
          /* Navigation */
          .portal-nav {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
            border-bottom: 1px solid var(--border);
          }
          
          .nav-tab {
            padding: 12px 16px;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            font-weight: 500;
            color: var(--secondary);
          }
          
          .nav-tab.active {
            color: var(--primary);
            border-bottom-color: var(--primary);
          }
          
          /* Stats Grid */
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: var(--card-shadow);
          }
          
          .stat-number {
            font-size: 28px;
            font-weight: bold;
            margin: 10px 0 5px;
          }
          
          .stat-desc {
            color: var(--secondary);
            font-size: 14px;
          }
          
          /* Services Grid */
          .services-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
          }
          
          .service-card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: var(--card-shadow);
            border: 1px solid var(--border);
          }
          
          .service-card.active {
            border-color: var(--primary);
          }
          
          .service-plan {
            color: var(--secondary);
            margin: 5px 0 15px;
          }
          
          .service-actions {
            display: flex;
            gap: 10px;
            margin-top: 15px;
          }
          
          /* Tables */
          .billing-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: var(--card-shadow);
          }
          
          .billing-table th,
          .billing-table td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid var(--border);
          }
          
          .billing-table th {
            background: #f8f9fa;
            font-weight: 500;
          }
          
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
          }
          
          .status-badge.paid {
            background: #d4edda;
            color: #155724;
          }
          
          /* Support Cards */
          .support-options {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .support-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: var(--card-shadow);
          }
          
          /* Utility Classes */
          .hidden {
            display: none;
          }
          
          .mt-4 { margin-top: 1.5rem; }
          .mb-4 { margin-bottom: 1.5rem; }
          .text-center { text-align: center; }
        `}</style>
      </Head>
      
      {/* Authentication Section */}
      <div id="auth-section" className="container">
        <h1 className="text-center mb-4">Client Portal Simulator</h1>
        <p className="text-center mb-6">Create a test account to explore the client portal</p>
        
        <div className="form-group">
          <label htmlFor="emailInput">Email:</label>
          <input type="email" id="emailInput" placeholder="Enter email" required />
        </div>
        <div className="form-group">
          <label htmlFor="passwordInput">Password:</label>
          <input type="password" id="passwordInput" placeholder="Enter password" required />
        </div>
        <button id="createUser" className="btn btn-primary w-full">Create Test Account</button>
        <div id="userResult" className="result"></div>
        
        <div id="userCredentials" className="mt-4" style={{ display: 'none' }}>
          <p><strong>Test account created with email:</strong> <span id="userEmail"></span></p>
          <p>You can now use these credentials to log in to the client portal.</p>
        </div>
      </div>
      
      {/* Client Portal (initially hidden) */}
      <div id="portal-section" style={{ display: 'none' }}>
        <header className="portal-header">
          <div className="container">
            <h1>Client Portal</h1>
            <div className="user-menu">
              <span>Welcome, {currentUser?.full_name || 'Client'}</span>
              <div className="user-avatar">
                {currentUser?.full_name?.charAt(0) || 'C'}
              </div>
            </div>
          </div>
        </header>
        
        <main className="container">
          <div className="portal-nav">
            <button 
              className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`nav-tab ${activeTab === 'services' ? 'active' : ''}`}
              onClick={() => setActiveTab('services')}
            >
              My Services
            </button>
            <button 
              className={`nav-tab ${activeTab === 'billing' ? 'active' : ''}`}
              onClick={() => setActiveTab('billing')}
            >
              Billing
            </button>
            <button 
              className={`nav-tab ${activeTab === 'support' ? 'active' : ''}`}
              onClick={() => setActiveTab('support')}
            >
              Support
            </button>
          </div>
          
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}
