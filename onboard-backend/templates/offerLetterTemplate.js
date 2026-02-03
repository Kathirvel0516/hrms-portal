module.exports = (d) => `
DATE: ${d.dateOfUpload}

NAME: ${d.employeeName}
Designation: ${d.designation}
Location: ${d.city}, ${d.state}

APPOINTMENT LETTER

We are pleased to appoint you as ${d.designation}
for our client ${d.client}.

Date of Joining: ${d.doj}

This appointment is contractual.

For Infinite Hunters Multi Service Pvt. Ltd.
Authorized Signatory
`;