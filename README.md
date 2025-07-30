# Riva Portfolio

A modern, professional portfolio website built with Next.js, featuring a sleek Apple-inspired design and automated lead capture system.

**Last Deployment:** August 1, 2024 - Production Ready ✅

## 🚀 Features

- **Modern Design**: Facebook-inspired color palette with professional animations
- **Responsive**: Mobile-first design that works on all devices
- **Dark Mode**: Automatic dark/light mode support
- **Contact Form**: Automated with Brevo email service and n8n workflows
- **SEO Optimized**: Built with Next.js for optimal performance
- **Deploy Ready**: Configured for Netlify deployment

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Styling**: Custom Facebook-inspired design system
- **Animations**: Framer Motion
- **Email Service**: Brevo (formerly Sendinblue)
- **Automation**: n8n workflows
- **Deployment**: Netlify
- **Hosting**: GitHub

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- GitHub account
- Netlify account
- Brevo account (free tier available)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/imnotanaiaccount/myportfolio.git
   cd myportfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) (or your deployed URL)

## 📧 Email Setup with Brevo

### 1. Create Brevo Account
1. Go to [brevo.com](https://brevo.com) and sign up
2. Verify your email address
3. Add your domain in Senders & IP → Senders

### 2. Get API Key
1. Navigate to Settings → API Keys
2. Create new API key with "Email Campaigns" permission
3. Copy the API key

### 3. Create Email Template
1. Go to Email → Templates
2. Create new template with this HTML:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Contact Form Submission</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1877f2; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #1877f2; }
        .value { background: white; padding: 10px; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 New Contact Form Submission</h1>
        </div>
        <div class="content">
            <div class="field">
                <div class="label">👤 Name:</div>
                <div class="value">{{ params.firstName }} {{ params.lastName }}</div>
            </div>
            <div class="field">
                <div class="label">📧 Email:</div>
                <div class="value">{{ params.email }}</div>
            </div>
            <div class="field">
                <div class="label">📞 Phone:</div>
                <div class="value">{{ params.phone }}</div>
            </div>
            <div class="field">
                <div class="label">🛠️ Service:</div>
                <div class="value">{{ params.projectType }}</div>
            </div>
            <div class="field">
                <div class="label">💬 Message:</div>
                <div class="value">{{ params.message }}</div>
            </div>
            <div class="field">
                <div class="label">⏰ Submitted:</div>
                <div class="value">{{ params.timestamp }}</div>
            </div>
        </div>
    </div>
</body>
</html>
```

3. Save and note the template ID

## ⚙️ n8n Workflow Setup

### 1. Install n8n
```bash
npm install -g n8n
n8n start
```

### 2. Create Workflow
1. Go to `http://localhost:5678`
2. Create new workflow: "Portfolio Contact Form"
3. Add nodes in this order:

**Step 1: Webhook Trigger**
- Add "Webhook" node
- Method: POST
- Copy webhook URL

**Step 2: Data Processing**
- Add "Set" node
- Map fields:
```json
{
  "firstName": "{{ $json.firstName }}",
  "lastName": "{{ $json.lastName }}",
  "email": "{{ $json.email }}",
  "phone": "{{ $json.phone }}",
  "projectType": "{{ $json.projectType }}",
  "message": "{{ $json.description }}",
  "timestamp": "{{ new Date().toISOString() }}"
}
```

**Step 3: Brevo Email**
- Add "Brevo" node
- Configure with your API key
- Use your template ID
- Map all parameters

**Step 4: Google Sheets (Optional)**
- Add "Google Sheets" node
- Create spreadsheet to log contacts

**Step 5: Slack/Discord (Optional)**
- Add notification node for instant alerts

### 3. Activate Workflow
- Save and activate the workflow
- Test with sample data

## 🌐 Netlify Deployment

### 1. Connect to GitHub
1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub and select your repository

### 2. Configure Build Settings
- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: `18`

### 3. Set Environment Variables
Go to Site settings → Environment variables and add:

```
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=noreply@riva.com
NOTIFICATION_EMAIL=hello@riva.com
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/lead-capture
```

### 4. Deploy
Click "Deploy site" and wait for build to complete.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `BREVO_API_KEY` | Your Brevo API key | Yes |
| `BREVO_TEMPLATE_ID` | Email template ID | Yes |
| `BREVO_SENDER_EMAIL` | Sender email address | Yes |
| `NOTIFICATION_EMAIL` | Where to send notifications | Yes |
| `N8N_WEBHOOK_URL` | n8n webhook URL | Optional |

### Customization

#### Colors
Edit `tailwind.config.js` to customize the Facebook-inspired color palette:

```javascript
colors: {
  facebook: '#1877f2',
  'facebook-light': '#42a5f5',
  'facebook-dark': '#0d47a1',
  // ... more colors
}
```

#### Content
Update the following files to customize your content:
- `components/Hero.js` - Main hero section
- `components/Services.js` - Your services
- `components/Examples.js` - Project examples
- `components/Contact.js` - Contact form fields

## 📊 Analytics & Monitoring

### Google Analytics
1. Create Google Analytics 4 property
2. Add tracking code to `pages/_app.js`
3. Set up goals for contact form submissions

### Netlify Analytics
- Enable in site settings
- Monitor form submissions and page views

### n8n Monitoring
- Set up webhook monitoring
- Create alerts for failed executions
- Monitor workflow performance

## 🛡️ Security & Spam Protection

### Rate Limiting
The contact form includes basic rate limiting and validation.

### Email Validation
- Server-side email format validation
- Required field validation
- CORS protection

### Additional Protection (Optional)
- Add reCAPTCHA to contact form
- Implement IP-based rate limiting
- Set up email blacklist checking

## 🚨 Troubleshooting

### Common Issues

**Build Failures**
- Check Node.js version (requires 18+)
- Verify all dependencies are installed
- Check Netlify build logs

**Email Not Sending**
- Verify Brevo API key is correct
- Check template ID exists
- Ensure sender email is verified

**n8n Webhook Issues**
- Verify webhook URL is accessible
- Check n8n workflow is active
- Test webhook with sample data

**Contact Form Not Working**
- Check Netlify function logs
- Verify environment variables
- Test form submission locally

### Debug Mode
Set `NODE_ENV=development` to see detailed error messages.

## 📈 Performance Optimization

### Build Optimization
- Images are optimized with Next.js Image component
- CSS is purged with Tailwind
- JavaScript is minified and bundled

### Loading Performance
- Lazy loading for components
- Optimized fonts with `next/font`
- Efficient animations with Framer Motion

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you need help:
1. Check the troubleshooting section
2. Review Netlify function logs
3. Test n8n workflow execution
4. Verify all environment variables

## 🎉 What's Next?

After deployment, consider:
- Setting up a custom domain
- Adding Google Analytics
- Creating email marketing campaigns
- Setting up CRM integration
- Adding blog functionality
- Implementing A/B testing

---

**Built with ❤️ using Next.js, Tailwind CSS, and modern web technologies.** / /   T r i v i a l   c o m m i t   t o   f o r c e   N e t l i f y   r e d e p l o y  
 