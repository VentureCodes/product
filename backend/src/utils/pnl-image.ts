import { v4 as uuidv4 } from 'uuid'
import QRCode from 'qrcode'
const sharp = require('sharp')
const axios = require('axios')
const { createCanvas, loadImage } = require('canvas')
import { s3Client } from './s3Client'

interface PNLData {
  pair: string
  percentage: string
  time: string
  footer: string
  entryPrice: string
  exitPrice: string
  leverage: string
  code: string
  appName: string
  side: string
}

interface PNLImageResponse {
  url: string
  error?: string
}

export const createPNLImage = async (
  pnlData: PNLData,
): Promise<PNLImageResponse> => {
  try {
    // Load the base background image
    let baseImageUrl =
      'https://dollarapp.fra1.cdn.digitaloceanspaces.com/doge.jpeg'
    const greenBaseImageUrls = [
      'https://dollarapp.fra1.cdn.digitaloceanspaces.com/green3.png',
      'https://dollarapp.fra1.cdn.digitaloceanspaces.com/green2.png',
    ]
    const redBaseImageUrls = [
      'https://dollarapp.fra1.cdn.digitaloceanspaces.com/red5.png',
    ]
    const logoImageUrl =
      'https://dollarapp.fra1.cdn.digitaloceanspaces.com/logo.png'
    const clockIconUrl =
      'https://dollarapp.fra1.cdn.digitaloceanspaces.com/wall-clock.png'

    // Convert percentage string to number for logic
    const percentageValue = parseFloat(pnlData.percentage.replace('%', ''))

    if (percentageValue < 0) {
      // If percentage is negative, pick a random image from the red set
      const randomRedImage =
        redBaseImageUrls[Math.floor(Math.random() * redBaseImageUrls.length)]
      baseImageUrl = randomRedImage
    } else if (percentageValue > 0) {
      // If percentage is positive, pick a random image from the green set
      const randomGreenImage =
        greenBaseImageUrls[
          Math.floor(Math.random() * greenBaseImageUrls.length)
        ]
      baseImageUrl = randomGreenImage
    }

    const baseImageResponse = await axios({
      method: 'get',
      url: baseImageUrl,
      responseType: 'arraybuffer', // Important: get the image as an array buffer
    })
    const baseImage = await sharp(Buffer.from(baseImageResponse.data)) // Replace with your background image
      .resize(1200, 800) // Resize to desired dimensions
      .toBuffer()

    // Create a canvas for drawing text
    const canvas = createCanvas(1200, 800)
    const ctx = canvas.getContext('2d')

    // Draw the background image onto the canvas
    const background = await loadImage(baseImage)
    ctx.drawImage(background, 0, 0, 1200, 800)

    //////////////////////////
    // Draw a larger PNLData box in the bottom-left corner
    //  const boxX = 50; // Adjusted X for consistent padding
    //  const boxY = 500; // Higher position to accommodate larger box
    //  const boxWidth = 500; // Increased width
    //  const boxHeight = 500; // Increased height
    //  const cornerRadius = 20;

    //  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Translucent black
    //  ctx.beginPath();
    //  ctx.moveTo(boxX + cornerRadius, boxY);
    //  ctx.lineTo(boxX + boxWidth - cornerRadius, boxY);
    //  ctx.arcTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + cornerRadius, cornerRadius);
    //  ctx.lineTo(boxX + boxWidth, boxY + boxHeight - cornerRadius);
    //  ctx.arcTo(
    //    boxX + boxWidth,
    //    boxY + boxHeight,
    //    boxX + boxWidth - cornerRadius,
    //    boxY + boxHeight,
    //    cornerRadius,
    //  );
    //  ctx.lineTo(boxX + cornerRadius, boxY + boxHeight);
    //  ctx.arcTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - cornerRadius, cornerRadius);
    //  ctx.lineTo(boxX, boxY + cornerRadius);
    //  ctx.arcTo(boxX, boxY, boxX + cornerRadius, boxY, cornerRadius);
    //  ctx.closePath();
    //  ctx.fill();

    //  // Draw the logo at the top of the box
    //  const logoImage = await loadImage(logoImageUrl);
    //  ctx.drawImage(logoImage, boxX + 20, boxY + 20, 100, 40);

    //  // Draw trade pair (e.g., ACHUSDT)
    //  ctx.fillStyle = '#ffffff';
    //  ctx.font = 'bold 25px Arial';
    //  ctx.fillText(pnlData.pair, boxX + 140, boxY + 50);

    //  // Draw order side (e.g., Short or Long) with leverage
    //  const orderSide = pnlData.side === 'Buy' ? 'Long' : 'Short';
    //  const sideColor = pnlData.side === 'Buy' ? '#00FF00' : '#FF0000';

    //  ctx.fillStyle = sideColor;
    //  ctx.fillRect(boxX + 300, boxY + 30, 100, 30); // Background for the side
    //  ctx.fillStyle = '#ffffff';
    //  ctx.font = 'bold 16px Arial'; // Adjusted font for the side text
    //  ctx.fillText(`${orderSide} ${pnlData.leverage}x`, boxX + 310, boxY + 50);

    //  // Draw percentage
    //  ctx.fillStyle = percentageValue < 0 ? '#FF0000' : '#00FF00';
    //  ctx.font = 'bold 50px Arial';
    //  ctx.fillText(pnlData.percentage, boxX + 20, boxY + 110);

    //  // Draw clock icon and duration
    //  const clockIcon = await loadImage(clockIconUrl);
    //  ctx.drawImage(clockIcon, boxX + 20, boxY + 140, 25, 25); // Slightly larger clock icon

    //  ctx.fillStyle = '#ffffff';
    //  ctx.font = '18px Arial'; // Adjusted font size for time
    //  ctx.fillText(pnlData.time, boxX + 55, boxY + 160);

    //  // Draw entry and exit prices
    //  ctx.fillStyle = '#ffffff';
    //  ctx.font = 'bold 20px Arial'; // Adjusted font size for prices
    //  ctx.fillText('Entry Price', boxX + 20, boxY + 200);
    //  ctx.fillText('Exit Price', boxX + 250, boxY + 230);

    //  ctx.fillStyle = '#00FF00';
    //  ctx.fillText(pnlData.entryPrice, boxX + 20, boxY + 230);
    //  ctx.fillText(pnlData.exitPrice, boxX + 250, boxY + 230);

    // // Calculate position and size of the square with border radius
    const squareWidth = 550 // Width of the square
    const squareHeight = 550 // Height of the square (adjustable)
    const xPos = 660 // Center-right position X (1200 - 500 - padding)
    const yPos = 110 // Centered vertically Y

    // Draw a square with rounded corners
    const borderRadius = 20 // Adjust border radius to make it rounded
    ctx.beginPath()
    ctx.moveTo(xPos + borderRadius, yPos) // Top-left corner
    ctx.lineTo(xPos + squareWidth - borderRadius, yPos) // Top-right
    ctx.arcTo(
      xPos + squareWidth,
      yPos,
      xPos + squareWidth,
      yPos + squareHeight,
      borderRadius,
    ) // Right
    ctx.lineTo(xPos + squareWidth, yPos + squareHeight - borderRadius) // Bottom-right
    ctx.arcTo(
      xPos + squareWidth,
      yPos + squareHeight,
      xPos + squareWidth - borderRadius,
      yPos + squareHeight,
      borderRadius,
    ) // Bottom-right corner
    ctx.lineTo(xPos + borderRadius, yPos + squareHeight) // Bottom-left
    ctx.arcTo(
      xPos,
      yPos + squareHeight,
      xPos,
      yPos + squareHeight - borderRadius,
      borderRadius,
    ) // Left
    ctx.lineTo(xPos, yPos + borderRadius) // Top-left corner
    ctx.arcTo(xPos, yPos, xPos + borderRadius, yPos, borderRadius) // Top-left arc
    ctx.closePath()

    // Fill the square with a semi-transparent color
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)' // Black color with 50% opacity
    ctx.fill()

    // Add text inside the square
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 40px Arial'
    ctx.fillText(pnlData.pair, xPos + 20, yPos + 60)

    if (percentageValue < 0) {
      ctx.fillStyle = '#ff0000' // Red color for negative percentage
    } else {
      ctx.fillStyle = '#00ff00' // Green color for positive percentage
    }

    ctx.font = 'bold 80px Arial' // Larger font for percentage
    ctx.fillText(pnlData.percentage, xPos + 30, yPos + 150)

    ctx.fillStyle = '#ffffff'

    // Load the clock icon image
    const clockIcon = await loadImage(clockIconUrl)
    const clockIconWidth = 30 // Adjust size of the clock icon
    const clockIconHeight = 30

    // Position the clock icon just before the time text
    ctx.drawImage(
      clockIcon,
      xPos + 20,
      yPos + 190,
      clockIconWidth,
      clockIconHeight,
    )

    // Adjust the time text position to accommodate the clock icon
    ctx.fillText(pnlData.time, xPos + 60, yPos + 220) // Leave some space after the clock icon

    // Add logo to the top-right of the square
    const logoImage = await loadImage(logoImageUrl) // Replace with your logo image file path
    const logoWidth = 120 // Adjust logo size
    const logoHeight = 40
    ctx.drawImage(
      logoImage,
      xPos + squareWidth - logoWidth - 20,
      yPos + 20,
      logoWidth,
      logoHeight,
    ) // Position the logo at the top-right of the square

    // Now create the new white rectangle inside the original square
    const rectWidth = 400 // Width of the new rectangle (same as original square)
    const rectHeight = 150 // Height of the new rectangle
    const rectXPos = xPos + 40 // Position inside the original square (same X)
    const rectYPos = yPos + 280 // Positioned below the time text

    const rectBorderRadius = 20 // Rounded corners for the rectangle
    ctx.beginPath()
    ctx.moveTo(rectXPos + rectBorderRadius, rectYPos) // Top-left corner
    ctx.lineTo(rectXPos + rectWidth - rectBorderRadius, rectYPos) // Top-right
    ctx.arcTo(
      rectXPos + rectWidth,
      rectYPos,
      rectXPos + rectWidth,
      rectYPos + rectHeight,
      rectBorderRadius,
    ) // Right
    ctx.lineTo(rectXPos + rectWidth, rectYPos + rectHeight - rectBorderRadius) // Bottom-right
    ctx.arcTo(
      rectXPos + rectWidth,
      rectYPos + rectHeight,
      rectXPos + rectWidth - rectBorderRadius,
      rectYPos + rectHeight,
      rectBorderRadius,
    ) // Bottom-right corner
    ctx.lineTo(rectXPos + rectBorderRadius, rectYPos + rectHeight) // Bottom-left
    ctx.arcTo(
      rectXPos,
      rectYPos + rectHeight,
      rectXPos,
      rectYPos + rectHeight - rectBorderRadius,
      rectBorderRadius,
    ) // Left
    ctx.lineTo(rectXPos, rectYPos + rectBorderRadius) // Top-left corner
    ctx.arcTo(
      rectXPos,
      rectYPos,
      rectXPos + rectBorderRadius,
      rectYPos,
      rectBorderRadius,
    ) // Top-left arc
    ctx.closePath()

    // Fill the rectangle with white background
    ctx.fillStyle = '#ffffff' // White background for the rectangle
    ctx.fill()

    // Generate QR code dynamically based on pnlData.code
    const qrCodeBuffer = await QRCode.toBuffer(pnlData.code)

    // Convert the QR code buffer to an image and draw it on the canvas
    const qrCodeImage = await loadImage(qrCodeBuffer)
    const qrCodeSize = 100 // Size of the QR code
    ctx.drawImage(
      qrCodeImage,
      rectXPos + 20,
      rectYPos + 20,
      qrCodeSize,
      qrCodeSize,
    ) // Position the QR code on the left

    // Add text next to the QR code
    ctx.fillStyle = '#000000' // Black text color
    ctx.font = '20px Arial'

    const maxTextWidth = rectWidth - qrCodeSize - 40

    wrapText(
      ctx,
      pnlData.footer,
      rectXPos + qrCodeSize + 25,
      rectYPos + 50,
      maxTextWidth,
      25,
    )

    ctx.font = 'bold 20px Arial'

    // Add the username below the text in the same row
    ctx.fillText(pnlData.code, rectXPos + qrCodeSize + 25, rectYPos + 100) // Username below the text

    // Convert canvas to buffer
    const outputBuffer = canvas.toBuffer()

    // Save the final image
    // await sharp(outputBuffer).toFile('pnl-image-output.jpg') // Output file name
    // console.log('PNL Image created: pnl-image-output.jpg')

    const result = await uploadToS3(
      {
        file: outputBuffer,
        name: 'pnl-image-output.jpg',
      },
      'pnl-images',
    )

    console.log('PNL Image URL:', result.url)
    return { url: result.url }
  } catch (err) {
    console.error('Error creating PNL image:', err)
    return {
      error: 'Error creating PNL image',
      url: '',
    }
  }
}

// Function to wrap text into multiple lines based on maximum width
// Define the types for the function parameters
// function wrapText(
//   ctx: CanvasRenderingContext2D, // The canvas context for drawing
//   text: string, // The text to wrap
//   x: number, // The x-coordinate for drawing the text
//   y: number, // The y-coordinate for drawing the text
//   maxWidth: number, // Maximum width for the text to wrap
//   lineHeight: number, // The vertical space between lines of text
// ): void {
//   const words = text.split(' ') // Split text into words
//   let line = ''
//   let lines: string[] = []

//   for (let i = 0; i < words.length; i++) {
//     const testLine = line + words[i] + ' ' // Test line with the new word
//     const testWidth = ctx.measureText(testLine).width // Get width of the test line

//     if (testWidth > maxWidth && i > 0) {
//       // If the line exceeds max width, push the line
//       lines.push(line)
//       line = words[i] + ' ' // Start a new line with the current word
//     } else {
//       line = testLine // Otherwise, continue adding words to the line
//     }
//   }

//   lines.push(line) // Push the last line

//   // Draw each line of text
//   for (let i = 0; i < lines.length; i++) {
//     ctx.fillText(lines[i], x, y + i * lineHeight) // Draw each line, offset by lineHeight
//   }
// }

// Function to wrap text into multiple lines based on maximum width
// Define the types for the function parameters
function wrapText(
  ctx: CanvasRenderingContext2D, // The canvas context for drawing
  text: string, // The text to wrap
  x: number, // The x-coordinate for drawing the text
  y: number, // The y-coordinate for drawing the text
  maxWidth: number, // Maximum width for the text to wrap
  lineHeight: number, // The vertical space between lines of text
): void {
  const words = text.split(' ') // Split text into words
  let line = ''
  let lines: string[] = []

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ' // Test line with the new word
    const testWidth = ctx.measureText(testLine).width // Get width of the test line

    if (testWidth > maxWidth && i > 0) {
      // If the line exceeds max width, push the line
      lines.push(line)
      line = words[i] + ' ' // Start a new line with the current word
    } else {
      line = testLine // Otherwise, continue adding words to the line
    }
  }

  lines.push(line) // Push the last line

  // Draw each line of text
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, y + i * lineHeight) // Draw each line, offset by lineHeight
  }
}

async function uploadToS3(
  file: any,
  destination: string,
): Promise<{ url: string }> {
  return new Promise(async (resolve, reject) => {
    try {
      const sanitizedFileName =
        uuidv4() + '-' + file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')

      s3Client.putObject(
        {
          Bucket: process.env.DO_SPACES_BUCKET,
          Key: `${destination}/${sanitizedFileName}`,
          Body: file.file,
          ACL: 'public-read',
        },
        function (err: any, data: any) {
          console.log('err', err, data)
          if (err) throw err

          const url = `https://${
            process.env.DO_SPACES_BUCKET
          }.${process.env.DO_SPACES_ENDPOINT?.replace(
            'https://',
            '',
          )}/${destination}/${sanitizedFileName}`

          resolve({ url })
        },
      )
    } catch (error) {
      reject(error)
    }
  })
}
