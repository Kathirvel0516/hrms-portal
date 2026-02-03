const puppeteer = require("puppeteer");
const path = require("path");

module.exports = async (data) => {

  const employeeName = data.employeeName.trim();

  const fileName =
    employeeName.replace(/ /g, "_") + ".pdf";

  const filePath = path.join(
    __dirname,
    "../generated-pdfs",
    fileName
  );

  const html = `
  <html>
  <body style="font-family:Times New Roman; padding:40px;">

  <h3 style="text-align:center">APPOINTMENT LETTER</h3>

  <p>DATE: ${data.dateOfUpload}</p>

  <p>
  NAME: ${data.employeeName}<br/>
  Location: ${data.city}
  </p>

  <p>
  We are pleased to appoint you as ${data.designation}.
  </p>

  <p>
  Date of Joining: ${data.doj}
  </p>

  <p>
  Client: ${data.client}
  </p>

  <br/>

  <p>
  For Infinite Hunters Multi Service Pvt Ltd
  </p>

  <p>
  Authorized Signatory
  </p>

  </body>
  </html>
  `;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(html);

  await page.pdf({
    path: filePath,
    format: "A4",
    printBackground: true
  });

  await browser.close();

  return filePath;
};
