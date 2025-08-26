# Stripe Environment Setup Guide

## Required Environment Variables

To enable Stripe payments in your Fantasia application, you need to configure the following environment variables:

### 1. Stripe Configuration

```bash
# Stripe Secret Key (Server-side)
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxxxxxxx

# Stripe Publishable Key (Client-side)
supabase secrets set VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxx

# Stripe Webhook Signing Secret
supabase secrets set STRIPE_SIGNING_SECRET=whsec_xxxxxxxxxx

# Price IDs from Stripe Dashboard
supabase secrets set PREMIUM_PLAN_PRICE_ID=price_xxxxxxxxxx
supabase secrets set VOICE_CREDITS_PRICE_ID=price_xxxxxxxxxx
```

### 2. Application Configuration

```bash
# Your application base URL
supabase secrets set APP_BASE_URL=http://localhost:5173

# Supabase Service Role Key (for admin operations)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Setting Up Stripe Products

### 1. Create Products in Stripe Dashboard

1. Log into your Stripe Dashboard
2. Go to **Products** → **Catalog**
3. Create two products:

#### Premium Subscription Product
- **Name**: Fantasia Premium Plan
- **Pricing Model**: Recurring
- **Billing Period**: Monthly
- **Price**: €9.98/month
- **Copy the Price ID** → Use for `PREMIUM_PLAN_PRICE_ID`

#### Voice Credits Product
- **Name**: Voice Credits Package
- **Pricing Model**: One-time
- **Price**: €4.99 (or your preferred price)
- **Copy the Price ID** → Use for `VOICE_CREDITS_PRICE_ID`

### 2. Configure Webhook Endpoint

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL: `https://your-project-ref.supabase.co/functions/v1/stripe-webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `invoice.paid`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing Secret** → Use for `STRIPE_SIGNING_SECRET`

## Environment Variables Summary

| Variable | Purpose | Example |
|----------|---------|---------|
| `STRIPE_SECRET_KEY` | Server-side Stripe operations | `sk_test_...` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Client-side Stripe operations | `pk_test_...` |
| `STRIPE_SIGNING_SECRET` | Webhook signature verification | `whsec_...` |
| `PREMIUM_PLAN_PRICE_ID` | Premium subscription price | `price_...` |
| `VOICE_CREDITS_PRICE_ID` | Voice credits price | `price_...` |
| `APP_BASE_URL` | Frontend application URL | `http://localhost:5173` |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin database operations | `eyJhbGciOi...` |

## Frontend Environment Variables

Create or update your `.env` file in the project root:

```env
# Stripe Public Key for frontend
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxx

# Other existing variables...
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Testing Setup

For development/testing, use Stripe's test mode:
- All keys should start with `sk_test_` and `pk_test_`
- Use test card numbers: `4242 4242 4242 4242`
- No real money transactions occur

## Production Setup

For production:
1. Switch to live mode in Stripe Dashboard
2. Create new products with live prices
3. Update all environment variables with live keys
4. Update webhook endpoint to production URL
5. Test thoroughly with real payment methods

## Verification

After setting up all environment variables, you can verify the setup by:

1. **Frontend**: Check if the premium button is enabled on the Plans page
2. **Backend**: Check Supabase Edge Function logs for any missing environment variable errors
3. **Test Payment**: Try creating a test checkout session

## Troubleshooting

### Common Issues

1. **"STRIPE_SECRET_KEY not found"**
   - Verify the environment variable is set correctly
   - Check spelling and case sensitivity

2. **"Invalid Price ID"**
   - Ensure the Price ID is from the correct Stripe account (test vs live)
   - Verify the Price ID exists and is active

3. **Webhook Signature Verification Failed**
   - Check that `STRIPE_SIGNING_SECRET` matches the webhook endpoint
   - Ensure the webhook URL is correct

4. **Payment Sessions Not Creating**
   - Check `APP_BASE_URL` is set correctly
   - Verify all required environment variables are present

### Debug Mode

Enable debug logging by checking Supabase Edge Function logs:
```bash
supabase functions logs stripe-webhook
supabase functions logs create-checkout-session
```
