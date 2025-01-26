export function itemFoundTemplate(data: EmailTemplateData) {
  const shippingUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/shipping/${data.lostItem.claimToken}`;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: white;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }
          .header {
            background-color: #0078D2;
            color: white;
            padding: 24px;
            text-align: center;
          }
          .logo {
            width: 200px;
            margin-bottom: 16px;
          }
          .content {
            padding: 32px 24px;
          }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background-color: #0078D2; 
            color: white !important; 
            text-decoration: none;
            border-radius: 4px;
            margin: 16px 0;
            font-weight: bold;
          }
          .option {
            background-color: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 24px;
            margin: 24px 0;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          }
          .code {
            background-color: #f8fafc;
            padding: 16px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 1.2em;
            margin: 16px 0;
            text-align: center;
            letter-spacing: 2px;
            border: 1px dashed #cbd5e1;
          }
          .shipping-option {
            background-color: #f0f9ff;
            border: 1px solid #bae6fd;
          }
          .flight-info {
            background-color: #f8fafc;
            padding: 16px;
            border-radius: 8px;
            margin: 16px 0;
          }
          .footer {
            background-color: #1e293b;
            color: white;
            padding: 24px;
            text-align: center;
            font-size: 0.875rem;
          }
          h1 { color: #0078D2; font-size: 1.5em; margin: 0 0 24px 0; }
          h2 { color: #1e293b; font-size: 1.25em; margin: 24px 0 16px 0; }
          h3 { color: #0078D2; font-size: 1.1em; margin: 0 0 16px 0; }
          p { color: #475569; line-height: 1.5; margin: 8px 0; }
          .divider { border-top: 1px solid #e2e8f0; margin: 24px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img 
              src="https://s202.q4cdn.com/986123435/files/doc_downloads/logos/american-airlines/aa_aa__hrz_rgb_grd_pos.png"
              alt="American Airlines Logo" 
              style="width: 200px; height: auto;"
            />
            <h1 style="color: white; margin: 0;">Lost Item Recovery</h1>
          </div>

          <div class="content">
            <p style="font-size: 1.1em;">${data.message}</p>
            
            <div class="flight-info">
              <h2 style="margin-top: 0;">Item Details</h2>
              <p><strong>Item:</strong> ${data.lostItem.itemName}</p>
              <p><strong>Description:</strong> ${data.lostItem.itemDescription}</p>
              <div style="margin-top: 16px;">
                <p style="margin: 4px 0;"><strong>Flight:</strong> ${data.flight.flightNumber}</p>
                <p style="margin: 4px 0;"><strong>Route:</strong> ${data.flight.originCode} → ${data.flight.destinationCode}</p>
              </div>
            </div>

            <div class="divider"></div>

            <h2>Claim Your Item</h2>
            <p>Please choose one of the following options to retrieve your item:</p>
            
            <div class="option">
              <h3>1. Collect In Person</h3>
              <p>Visit our American Airlines Lost & Found office with your verification code:</p>
              <div class="code">${data.lostItem.collectionCode}</div>
              <p style="font-size: 0.9em; color: #64748b;">
                Present this code along with a valid ID at our counter
              </p>
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/verify/${data.lostItem.claimToken}" 
                class="button">
                Verify & Collect
              </a>
            </div>

            <div class="option shipping-option">
              <h3>2. Ship to Your Address</h3>
              <p>Have your item safely delivered to your preferred address:</p>
              <ul style="color: #475569; line-height: 1.6;">
                <li>Express shipping with tracking</li>
                <li>Secure, insured delivery</li>
                <li>Flat rate of $9.99</li>
              </ul>
              <a href="${shippingUrl}" class="button" style="background-color: #0284c7;">
                Ship to Me
              </a>
            </div>

            <div style="text-align: center; margin-top: 32px;">
              <img src="${data.lostItem.qrCodeUrl}" 
                alt="QR Code" 
                style="max-width: 200px; margin-bottom: 16px;"
              />
              <p style="font-size: 0.9em; color: #64748b;">
                Scan this QR code when collecting your item in person
              </p>
            </div>
          </div>

          <div class="footer">
            <p style="color: #e2e8f0; margin: 0;">
              American Airlines Lost & Found Department
            </p>
            <p style="color: #94a3b8; font-size: 0.8em; margin-top: 8px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

interface EmailTemplateData {
  lostItem: {
    itemName: string;
    itemDescription: string;
    claimToken: string;
    collectionCode: string;
    qrCodeUrl: string;
  };
  flight: {
    flightNumber: string;
    originCode: string;
    destinationCode: string;
  };
  message: string;
} 