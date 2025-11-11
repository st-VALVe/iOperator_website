# EmailJS Setup Instructions

## Quick Setup Guide

To enable email sending from the contact form, you need to configure EmailJS (free service).

### Step 1: Create EmailJS Account

1. Go to https://www.emailjs.com/
2. Click "Sign Up" and create a free account
3. Verify your email address

### Step 2: Add Email Service

1. In EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions for your email provider
5. **Save your Service ID** (you'll need it later)

### Step 3: Create Email Template

1. Go to **Email Templates**
2. Click **Create New Template**
3. Use this template structure:

**Template Name:** Contact Form Template

**Subject:** `{{subject}}`

**Content:**
```
New {{request_type}} from AI Operator Website

From: {{from_name}} ({{from_email}})
Request Type: {{request_type}}

Message:
{{message}}

---
Reply to: {{reply_to}}
```

4. **Save your Template ID** (you'll need it later)

### Step 4: Get Public Key

1. Go to **Account** → **General**
2. Find your **Public Key** (starts with something like `user_xxxxx`)
3. Copy it

### Step 5: Update Code Configuration

Open `src/App.tsx` and find the `EMAILJS_CONFIG` object (around line 22). Replace the placeholder values:

```typescript
const EMAILJS_CONFIG = {
  PUBLIC_KEY: 'your_public_key_here',        // From Step 4
  SERVICE_ID: 'your_service_id_here',        // From Step 2
  TEMPLATE_ID: 'your_template_id_here',     // From Step 3
  TO_EMAIL: 'st-valve@mail.ru'              // Already set
};
```

### Step 6: Test

1. Save the file
2. The form will now send emails to `st-valve@mail.ru` when submitted

## Free Tier Limits

EmailJS free tier includes:
- 200 emails per month
- Basic email templates
- Standard support

For more emails, consider upgrading to a paid plan.

## Troubleshooting

- **Emails not sending?** Check browser console for errors
- **Service ID not working?** Make sure the service is active in EmailJS dashboard
- **Template errors?** Verify all template variables match the code ({{from_name}}, {{from_email}}, etc.)

## Security Note

The Public Key is safe to expose in frontend code. EmailJS uses it to identify your account, but it doesn't grant full access.

