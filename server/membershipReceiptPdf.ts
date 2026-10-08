import PDFDocument from 'pdfkit';
import { MembershipRenewalReceipt } from '../src/types/index.js';

/**
 * Generates an official, photo-replica PDF document of the Sambalpur Truck Owners' Association
 * Membership Renewal Receipt (सदस्यता नवीनीकरण रसीद).
 * Faithfully matches the uploaded physical document (IMG_20260920_211353.jpg style):
 * - Maroon header with yellow title and official contact info
 * - Association truck gear emblem (Left) and Maa Samaleswari crest (Right)
 * - Calligraphic cursive "Receipt" title
 * - Authentic dotted lines with bold printed vehicle/owner values
 * - Cyan rupee pill capsule with bold amount
 * - Official blue angled rubber stamp & authorized signature
 * - Complete renewal count tracking (#N बार नवीनीकृत) and new validity expiry date
 */
export async function generateMembershipReceiptPdf(receipt: MembershipRenewalReceipt): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Slip voucher size (width 620 pt, height 400 pt) ~ standard landscape certificate/receipt
      const doc = new PDFDocument({
        size: [620, 400],
        margin: 15,
        bufferPages: true,
        info: {
          Title: `STOA Membership Renewal Receipt #${receipt.receiptNumber} - ${receipt.displayNumber}`,
          Author: "Sambalpur Truck Owner's Association (STOA)",
          Subject: `Membership Renewal Receipt for Vehicle ${receipt.displayNumber}`,
          Keywords: `STOA, Membership, Renewal, Receipt, Sambalpur, ${receipt.displayNumber}`,
        },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      const maroon = '#7B112D';
      const darkMaroon = '#5A081E';
      const goldYellow = '#FFE500';
      const offWhite = '#FFFDF9';
      const inkBlack = '#0F172A';
      const dottedGrey = '#94A3B8';
      const stampBlue = '#0284C7';
      const inkBlue = '#1D4ED8';

      // 1. Outer Receipt Card Border & Background
      const cardX = 15;
      const cardY = 15;
      const cardW = 590;
      const cardH = 370;
      const cornerR = 8;

      doc.roundedRect(cardX, cardY, cardW, cardH, cornerR).fill(offWhite);
      doc.roundedRect(cardX, cardY, cardW, cardH, cornerR).lineWidth(2).stroke(maroon);

      // Top Decorative Chevron Strip
      doc.save();
      doc.roundedRect(cardX, cardY, cardW, 8, cornerR).clip();
      doc.rect(cardX, cardY, cardW, 8).fill(darkMaroon);
      for (let x = cardX - 10; x < cardX + cardW + 20; x += 12) {
        doc.polygon([x, cardY], [x + 6, cardY], [x + 12, cardY + 8], [x + 6, cardY + 8]).fill(maroon);
      }
      doc.restore();

      // 2. Official Maroon Header Banner
      const headerY = cardY + 8;
      const headerH = 76;
      doc.rect(cardX, headerY, cardW, headerH).fill(maroon);
      doc.rect(cardX, headerY + headerH - 2, cardW, 2).fill(darkMaroon);

      // --- Left Logo: STOA Circular Truck Emblem ---
      const leftLogoX = cardX + 42;
      const leftLogoY = headerY + 38;

      // Outer rings
      doc.circle(leftLogoX, leftLogoY, 30).fill('#0F172A');
      doc.circle(leftLogoX, leftLogoY, 28).lineWidth(1.5).stroke('#F59E0B');
      doc.circle(leftLogoX, leftLogoY, 26).fill('#B91C1C');

      // Radiating sunburst rays
      doc.save();
      for (let a = 0; a < 360; a += 30) {
        const rad = (a * Math.PI) / 180;
        const x1 = leftLogoX + Math.cos(rad) * 14;
        const y1 = leftLogoY + Math.sin(rad) * 14;
        const x2 = leftLogoX + Math.cos(rad) * 24;
        const y2 = leftLogoY + Math.sin(rad) * 24;
        doc.moveTo(x1, y1).lineTo(x2, y2).lineWidth(1).stroke('#FDE047');
      }
      doc.restore();

      // Inner white disc
      doc.circle(leftLogoX, leftLogoY, 15).fill('#FFFFFF');

      // Truck Silhouette inside emblem
      doc.rect(leftLogoX - 10, leftLogoY - 4, 13, 8).fill('#1E293B');
      doc.rect(leftLogoX + 3, leftLogoY - 1, 7, 5).fill('#B91C1C');
      doc.circle(leftLogoX - 6, leftLogoY + 5, 2.5).fill('#000000');
      doc.circle(leftLogoX + 6, leftLogoY + 5, 2.5).fill('#000000');

      // Emblem top text
      doc.font('Helvetica-Bold').fontSize(5).fillColor('#FFE500')
        .text('STOA', leftLogoX - 7, leftLogoY - 23, { width: 14, align: 'center' });
      doc.fontSize(4).fillColor('#FFFFFF')
        .text('SAMBALPUR', leftLogoX - 16, leftLogoY + 18, { width: 32, align: 'center' });

      // --- Right Logo: Sacred Maa Samaleswari Divine Crest ---
      const rightLogoX = cardX + cardW - 42;
      const rightLogoY = headerY + 38;

      // Divine halo & aura
      doc.circle(rightLogoX, rightLogoY, 30).fill('#7F1D1D');
      doc.circle(rightLogoX, rightLogoY, 28).lineWidth(1.2).dash(3, { space: 2 }).stroke('#FDE047');
      doc.undash();

      // Temple Arch / Mukut Silhouette
      doc.save();
      doc.polygon(
        [rightLogoX, rightLogoY - 22],
        [rightLogoX + 16, rightLogoY - 8],
        [rightLogoX + 12, rightLogoY + 18],
        [rightLogoX - 12, rightLogoY + 18],
        [rightLogoX - 16, rightLogoY - 8]
      ).fill('#FACC15');
      doc.restore();

      // Golden Temple Crown Details
      doc.circle(rightLogoX, rightLogoY - 5, 8).fill('#DC2626');
      doc.circle(rightLogoX, rightLogoY - 5, 5).fill('#FDE047');
      // Sacred Tilak in center
      doc.rect(rightLogoX - 1.5, rightLogoY - 8, 3, 7).fill('#DC2626');
      doc.circle(rightLogoX, rightLogoY - 9, 1.5).fill('#FFFFFF');
      doc.font('Helvetica-Bold').fontSize(4.5).fillColor('#FFE500')
        .text('MAA SAMALESWARI', rightLogoX - 25, rightLogoY + 19, { width: 50, align: 'center' });

      // --- Center Header Titles ---
      const centerW = 410;
      const centerX = cardX + (cardW - centerW) / 2;

      doc.font('Helvetica-Bold').fontSize(16).fillColor(goldYellow)
        .text("SAMBALPUR TRUCK OWNERS' ASSOCIATION", centerX, headerY + 8, {
          width: centerW,
          align: 'center',
          characterSpacing: 0.5,
        });

      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#FFFFFF')
        .text('H.O.: Transport Nagar, N.H. 53, SAMBALPUR - 768006 (ODISHA)', centerX, headerY + 28, {
          width: centerW,
          align: 'center',
        });

      doc.font('Helvetica').fontSize(8).fillColor('#FFFFFF')
        .text('CONTACT NO. 9437056834, Regd. No. 7238/237 of 1973/74', centerX, headerY + 41, {
          width: centerW,
          align: 'center',
        });

      doc.font('Helvetica').fontSize(8).fillColor('#FDE047')
        .text('E-mail ID : stoa.sbp@gmail.com', centerX, headerY + 54, {
          width: centerW,
          align: 'center',
        });

      // 3. Faint Truck Watermark in Center of Form Body
      doc.save();
      doc.opacity(0.06);
      const wmX = cardX + 170;
      const wmY = cardY + 160;
      doc.rect(wmX, wmY, 150, 60).fill('#0F172A');
      doc.polygon([wmX + 150, wmY + 20], [wmX + 180, wmY + 20], [wmX + 210, wmY + 60], [wmX + 150, wmY + 60]).fill('#0F172A');
      doc.circle(wmX + 30, wmY + 65, 14).fill('#0F172A');
      doc.circle(wmX + 70, wmY + 65, 14).fill('#0F172A');
      doc.circle(wmX + 175, wmY + 65, 14).fill('#0F172A');
      doc.restore();

      // 4. Cursive Script "Receipt"
      const bodyTop = headerY + headerH + 8;
      doc.font('Times-BoldItalic').fontSize(26).fillColor('#1E293B')
        .text('Receipt', cardX, bodyTop, { width: cardW, align: 'center' });

      // Helper function to draw dotted line
      const drawDottedLine = (x1: number, y: number, x2: number) => {
        doc.save();
        doc.dash(1.5, { space: 2.5 }).strokeColor(dottedGrey).lineWidth(1);
        doc.moveTo(x1, y).lineTo(x2, y).stroke();
        doc.restore();
      };

      // 5. Authentic Dotted Fields
      const formX = cardX + 28;
      const formW = cardW - 56;
      let currY = bodyTop + 28;
      const rowGap = 26;

      // ROW 1: No ............ and Date ............
      doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#334155').text('No', formX, currY);
      const noLabelW = 22;
      drawDottedLine(formX + noLabelW, currY + 11, formX + 180);
      doc.font('Courier-Bold').fontSize(14).fillColor(inkBlack)
        .text(String(receipt.receiptNumber), formX + noLabelW + 8, currY - 2);

      const dateLabelX = formX + 330;
      doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#334155').text('Date', dateLabelX, currY);
      const dateLabelW = 32;
      drawDottedLine(dateLabelX + dateLabelW, currY + 11, formX + formW);
      doc.font('Helvetica-Bold').fontSize(11).fillColor(inkBlack)
        .text(receipt.dateFormatted, dateLabelX + dateLabelW + 8, currY);

      // ROW 2: Received with thanks from ............
      currY += rowGap;
      const rcvLabel = 'Received with thanks from';
      doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#334155').text(rcvLabel, formX, currY);
      const rcvW = 150;
      drawDottedLine(formX + rcvW, currY + 11, formX + formW);
      doc.font('Helvetica-Bold').fontSize(11).fillColor(inkBlack)
        .text(receipt.ownerName.toUpperCase(), formX + rcvW + 8, currY);

      // ROW 3: the sum of Rupees ............
      currY += rowGap;
      const sumLabel = 'the sum of Rupees';
      doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#334155').text(sumLabel, formX, currY);
      const sumW = 115;
      drawDottedLine(formX + sumW, currY + 11, formX + formW);
      doc.font('Helvetica-Bold').fontSize(10.5).fillColor(inkBlack)
        .text(receipt.feeInWords.toUpperCase(), formX + sumW + 8, currY);

      // ROW 4: Membership No ........ Vehicle No ........
      currY += rowGap;
      const memLabel = 'Membership No';
      doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#334155').text(memLabel, formX, currY);
      const memW = 95;
      drawDottedLine(formX + memW, currY + 11, formX + 250);
      doc.font('Courier-Bold').fontSize(12).fillColor(inkBlack)
        .text(receipt.membershipNumber, formX + memW + 8, currY - 1);

      const vehLabelX = formX + 265;
      const vehLabel = 'Vehicle No';
      doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#334155').text(vehLabel, vehLabelX, currY);
      const vehW = 68;
      drawDottedLine(vehLabelX + vehW, currY + 11, formX + formW);
      doc.font('Helvetica-Bold').fontSize(12).fillColor(inkBlack)
        .text(receipt.displayNumber, vehLabelX + vehW + 8, currY - 1);

      // ROW 5: towards Renewal Fee for the year ............
      currY += rowGap;
      const yrLabel = 'towards Renewal Fee for the year';
      doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#334155').text(yrLabel, formX, currY);
      const yrW = 185;
      drawDottedLine(formX + yrW, currY + 11, formX + formW);
      doc.font('Courier-Bold').fontSize(12).fillColor(inkBlack)
        .text(receipt.renewalYear, formX + yrW + 8, currY - 1);

      // 6. Footer Section: Rupee Capsule Pill + Official Stamp + Signatures
      const footerY = currY + 28;

      // --- Left: Cyan Rupee Capsule Pill ---
      const pillX = formX;
      const pillY = footerY;
      const pillW = 135;
      const pillH = 34;

      doc.roundedRect(pillX, pillY, pillW, pillH, 17).fill('#BAE6FD');
      doc.roundedRect(pillX, pillY, pillW, pillH, 17).lineWidth(1.5).stroke(stampBlue);

      // Dark Blue Circle with Rupee Symbol
      doc.circle(pillX + 17, pillY + 17, 13).fill('#0369A1');
      doc.font('Helvetica-Bold').fontSize(14).fillColor('#FFFFFF')
        .text('Rs.', pillX + 6, pillY + 10, { width: 22, align: 'center' });

      // Fee Amount
      doc.font('Courier-Bold').fontSize(16).fillColor(inkBlack)
        .text(`${receipt.feeAmount}/-`, pillX + 38, pillY + 9);

      // Validity sub-badge
      doc.font('Helvetica').fontSize(7.5).fillColor('#475569')
        .text(`Valid up to: ${receipt.newExpiryDate}`, pillX + 2, pillY + pillH + 4);

      // Renewal Count Badge (सुरक्षित नवीनीकरण रिकॉर्ड: #N बार)
      const countText = `Renewal Count: #${receipt.renewalCountForVehicle || 1} (कुल ${receipt.renewalCountForVehicle || 1} बार नवीनीकृत)`;
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor(maroon)
        .text(countText, pillX + 2, pillY + pillH + 15);

      // --- Rubber Stamp Overlay in Angled Blue Ink ---
      doc.save();
      doc.rotate(-10, { origin: [pillX + 180, footerY + 10] });
      doc.rect(pillX + 160, footerY - 5, 95, 26).lineWidth(1.2).strokeColor(stampBlue).stroke();
      doc.font('Courier-Bold').fontSize(8.5).fillColor(stampBlue)
        .text(`STOA #${receipt.receiptNumber}`, pillX + 164, footerY - 2, { width: 87, align: 'center' });
      doc.font('Helvetica-Bold').fontSize(6.5).fillColor(stampBlue)
        .text('OFFICIAL VERIFIED', pillX + 164, footerY + 8, { width: 87, align: 'center' });
      doc.restore();

      // --- Right: Digital Authorized Signatory ---
      const sigX = formX + formW - 170;
      const sigY = footerY - 8;

      // Authentic ballpoint blue ink signature path
      doc.save();
      doc.strokeColor(inkBlue).lineWidth(1.5);
      doc.moveTo(sigX + 15, sigY + 18)
        .bezierCurveTo(sigX + 30, sigY + 2, sigX + 45, sigY + 28, sigX + 65, sigY + 12)
        .bezierCurveTo(sigX + 80, sigY + 2, sigX + 105, sigY + 25, sigX + 130, sigY + 14)
        .stroke();
      doc.dash(2, { space: 2 }).strokeColor(dottedGrey).lineWidth(0.8);
      doc.moveTo(sigX + 10, sigY + 26).lineTo(sigX + 155, sigY + 26).stroke();
      doc.restore();

      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(maroon)
        .text("For Sambalpur Truck Owner's Association", sigX, sigY + 28, {
          width: 165,
          align: 'right',
        });

      doc.font('Helvetica').fontSize(7.5).fillColor('#64748B')
        .text('Authorized Signatory / अधिकृत हस्ताक्षरकर्ता', sigX, sigY + 39, {
          width: 165,
          align: 'right',
        });

      // 7. Bottom Decorative Chevron Strip & Legal Footer
      const btmY = cardY + cardH - 12;
      doc.save();
      doc.roundedRect(cardX, btmY, cardW, 12, cornerR).clip();
      doc.rect(cardX, btmY, cardW, 12).fill(darkMaroon);
      for (let x = cardX - 10; x < cardX + cardW + 20; x += 12) {
        doc.polygon([x, btmY], [x + 6, btmY], [x + 12, btmY + 12], [x + 6, btmY + 12]).fill(maroon);
      }
      doc.restore();

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
