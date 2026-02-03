const express = require("express");
const router = express.Router();
const multer = require("multer");

const generatePDF = require("../services/pdfService");
const sendEmail = require("../services/mailService");

const upload = multer({ dest: "uploads/" });

router.post(
  "/",
  upload.fields([
    { name: "passportPhoto", maxCount: 1 },
    { name: "passbook", maxCount: 1 }
  ]),
  async (req, res) => {

    try {

      console.log("NEW REQUEST RECEIVED");
      console.log("Data:", req.body);

      const pdfPath = await generatePDF(req.body);

      await sendEmail(
        req.body.email,
        req.body.employeeName,
        pdfPath
      );

      res.status(200).json({
        success: true
      });

    } catch (error) {

      console.error("PROCESS FAILED");
      console.error(error);

      res.status(500).json({
        success: false
      });
    }
  }
);

module.exports = router;
