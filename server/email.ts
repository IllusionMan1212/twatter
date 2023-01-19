const prepareHTMLTemplate = (content: string) => {
    return `
    <!DOCTYPE html>
    <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title></title>
    <!--[if mso]>
        <noscript>
    <xml>
    <o:OfficeDocumentSettings>
    <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
    </xml>
    </noscript>
    <![endif]-->
    <style type="text/css">
        table, td, div, h1, p {font-family: Arial, sans-serif;}
        .btn {padding: 12px 16px; background-color: #577291; text-decoration: none; color: white; border: 1px solid; border-radius: 4px;}
        .btn:hover {background-color: #4A6480;}
        .extra-text {color: #595959;}
        td {padding: 0 50px;}
        p, h1, h2, h3, h4, h5, h6 {padding: 0; margin: 1em 0;}
        a {text-decoration: none; color: #577291}
        a:hover {text-decoration: underline;}
        a:visited {color: #577291;}
    </style>
    </head>
    <body style="margin:0;padding:0;">
        <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;background:#ffffff;">
            ${content}
        </table>
    </body>
    </html>
    `;
};

export const prepareResetPasswordEmailHTML = (link: string) => {
    return prepareHTMLTemplate(`
      <tr>
        <td align="center" style="padding:0;">
          <table role="presentation" style="width:100%;max-width:602px;border-collapse:collapse;border-spacing:0;text-align:left;">
            <tr>
              <td>
                <h1 style="font-family:'Courier New'">TWATTER</h1>
                <h3>The password reset link you requested is ready</h3>
              </td>
            </tr>
            <tr align="center">
              <td style="padding:30px 20px;">
                <a class="btn" href="${link}">Reset Password</a>
              </td>
            </tr>
            <tr>
              <td>
                <p>This link expires in 1 hour</p>
                <p class="extra-text" style="font-size:14px">If the above button is not working please visit this link manually on your browser: <a href="${link}">${link}</a></p>
              </td>
            </tr>
            <tr>
              <td>
                <p class="extra-text" style="font-size:12px;margin:2em 0;">
                  You’re receiving this email because you recently requested a password reset. If this wasn’t you, please ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `);
};

export const prepareResetPasswordEmailText = (link: string) => {
    return `TWATTER\n\n\
    The password link you requested is ready\n\n\
    Link: (${link})\nThis link expires in 1 hour\n\n\
    You're receiving this email because you recently requested a password. If this wasn't you, please ignore this email.`;
};
