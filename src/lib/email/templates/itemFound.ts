export function itemFoundTemplate(data: any) {
  const shippingUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/shipping/${data.lostItem.claimToken}`;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: sans-serif; }
          .button { 
            display: inline-block; 
            padding: 10px 20px; 
            background-color: #2563eb; 
            color: white; 
            text-decoration: none;
            border-radius: 6px;
            margin: 10px 0;
          }
          .option {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .code {
            background-color: #f1f5f9;
            padding: 10px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 1.2em;
            margin: 10px 0;
          }
          .shipping-option {
            background-color: #eff6ff;
            border: 1px solid #bfdbfe;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Lost Item Found</h1>
          <p>${data.message}</p>
          
          <div class="item-details">
            <h2>${data.lostItem.itemName}</h2>
            <p>${data.lostItem.itemDescription}</p>
            
            <div class="flight-info">
              <p><strong>Flight:</strong> ${data.flight.flightNumber}</p>
              <p><strong>Route:</strong> ${data.flight.originCode} → ${data.flight.destinationCode}</p>
            </div>
          </div>

          <div class="actions">
            <p>You have two options to claim this item:</p>
            
            <div class="option">
              <h3>1. Collect In Person</h3>
              <p>Visit our lost and found office with your verification code:</p>
              <div class="code">${data.lostItem.collectionCode}</div>
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/verify/${data.lostItem.claimToken}" class="button">
                Verify & Collect
              </a>
            </div>

            <div class="option shipping-option">
              <h3>2. Ship to Your Address</h3>
              <p>Have the item shipped to your preferred address for a flat rate of $9.99</p>
              <p>✈️ Express shipping with tracking</p>
              <p>🔒 Secure payment processing</p>
              <a href="${shippingUrl}" class="button" style="background-color: #059669;">
                Ship to Me
              </a>
            </div>
          </div>

          <div class="qr-code">
            <img src="${data.lostItem.qrCodeUrl}" alt="QR Code" />
            <p>Scan this QR code when collecting your item in person</p>
          </div>
        </div>
      </body>
    </html>
  `;
} 