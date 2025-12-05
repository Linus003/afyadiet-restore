// lib/mpesa.ts

const MPESA_KEY = process.env.MPESA_CONSUMER_KEY!
const MPESA_SECRET = process.env.MPESA_CONSUMER_SECRET!
const MPESA_URL = process.env.MPESA_ENV === "production" 
  ? "https://api.safaricom.co.ke" 
  : "https://sandbox.safaricom.co.ke"
const PASSKEY = process.env.MPESA_PASSKEY!
const SHORTCODE = process.env.MPESA_SHORTCODE!

// 1. Get Access Token
export async function getMpesaToken() {
  const credentials = Buffer.from(`${MPESA_KEY}:${MPESA_SECRET}`).toString('base64')
  try {
    const response = await fetch(`${MPESA_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      method: "GET",
      headers: { Authorization: `Basic ${credentials}` }
    })
    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error("M-Pesa Token Error:", error)
    throw new Error("Failed to get M-Pesa token")
  }
}

// 2. Trigger STK Push
export async function stkPush(amount: number, phoneNumber: string, reference: string) {
  const token = await getMpesaToken()
  
  // Format Date: YYYYMMDDHHmmss
  const date = new Date()
  const timestamp = date.getFullYear() +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    ("0" + date.getDate()).slice(-2) +
    ("0" + date.getHours()).slice(-2) +
    ("0" + date.getMinutes()).slice(-2) +
    ("0" + date.getSeconds()).slice(-2)
    
  const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64')

  // Format Phone: Ensure it starts with 254
  let formattedPhone = phoneNumber.replace(/\D/g, '') // Remove non-digits
  if (formattedPhone.startsWith("0")) formattedPhone = "254" + formattedPhone.slice(1)
  if (formattedPhone.startsWith("7")) formattedPhone = "254" + formattedPhone
  if (formattedPhone.startsWith("+254")) formattedPhone = formattedPhone.slice(1)

  // 💡 THIS USES YOUR DOMAIN FROM .ENV
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/mpesa/callback`

  const body = {
    BusinessShortCode: SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.ceil(amount),
    PartyA: formattedPhone,
    PartyB: SHORTCODE,
    PhoneNumber: formattedPhone,
    CallBackURL: callbackUrl,
    AccountReference: reference.slice(0, 12),
    TransactionDesc: "Payment for Appointment"
  }

  try {
    const response = await fetch(`${MPESA_URL}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })
    
    return await response.json()
  } catch (error) {
    console.error("STK Push Error:", error)
    throw error
  }
}