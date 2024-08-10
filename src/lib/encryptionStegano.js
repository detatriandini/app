import Jimp from "jimp";
import Ffmpeg from "fluent-ffmpeg";
import * as path from 'path'
import * as fs  from "fs"
import { setTimeout } from 'timers/promises';

const chunkSize = 1000;
const batchSize = 50;


const clearDirectory = async (directoryPath) => {
    try {
        const files = fs.readdirSync(directoryPath);

        for (const file of files) {
            const filePath = path.join(directoryPath, file);
            const stats = fs.lstatSync(filePath);

            if (stats.isDirectory()) {
                clearDirectory(filePath);

                fs.rmdirSync(filePath);
            } else {
                fs.unlinkSync(filePath);
            }
        }
    } catch (err) {
        console.error(`Error clearing directory: ${err}`);
    }
};

async function encodeMessageInFrame(framePath, bits, bitIndex) {
    try {
        const image = await Jimp.read(framePath);
        const data = image.bitmap.data;

        for (let i = 0; i < data.length; i += 4) {
            for (let j = 0; j < 3; j++) {
                if (bitIndex < bits.length) {
                    data[i + j] = (data[i + j] & 254) | bits[bitIndex];
                    bitIndex++;
                }
            }
        }

        await image.writeAsync(framePath);
        return bitIndex;
    } catch (error) {
        console.error('Error encoding message in frame:', error);
    }
}

function messageToBits(message) {
    let bits = [];
    for (let i = 0; i < message.length; i++) {
        const charCode = message.charCodeAt(i);
        for (let j = 7; j >= 0; j--) {
            bits.push((charCode >> j) & 1);
        }
    }
    // Add a delimiter to mark the end of the message (e.g., a null character)
    for (let j = 7; j >= 0; j--) {
        bits.push((0 >> j) & 1);
    }
    console.log(bits)
    return bits;
}

async function encrypt(inputPath, outputPath, message, fileType){
    const framesDir = "steganoFrame/"
    const bits = messageToBits(message);

    try {
        if(fileType.includes("mp4")){
            // Ensure frames directory exists
            if (!fs.existsSync(framesDir)) {
                fs.mkdirSync(framesDir, { recursive: true });
            }

            // Step 1: Extract the first frame
            await new Promise((resolve, reject) => {
                Ffmpeg(inputPath)
                    .output(path.join(framesDir, 'frame-001.png'))
                    .frames(1)
                    .on('end', resolve)
                    .on('error', reject)
                    .run();
            });

            // Step 2: Encode message into the first frame
            const framePath = path.join(framesDir, 'frame-001.png');
            await encodeMessageInFrame(framePath, bits);

            // Step 3: Reassemble video
            await new Promise((resolve, reject) => {
                Ffmpeg(inputPath)
                    .input(path.join(framesDir, 'frame-001.png'))
                    // .complexFilter([
                    //     '[1:v]scale=1920:1080[fg]; [0:v]scale=1920:1080[bg]; [fg][bg]overlay=0:0:shortest=1'
                    // ])
                    .outputOptions('-c:v', 'libx264', '-pix_fmt', 'yuv420p')
                    .save(outputPath)
                    .on('end', resolve)
                    .on('error', reject);
            });

            await clearDirectory(framesDir);

        }else{
            const coverImage = await Jimp.read(inputPath);
            const coverData = coverImage.bitmap.data;

            let bitIndex = 0;
            for (let i = 0; i < coverData.length; i += 4) {
                for (let j = 0; j < 3; j++) {
                    if (bitIndex < bits.length) {
                        coverData[i + j] = (coverData[i + j] & 254) | bits[bitIndex];
                        bitIndex++;
                    }
                }
            }

            await coverImage.writeAsync(outputPath);
        }
        console.log('Secret message has been encoded into the cover image.');
    } catch (error) {
        console.log(error)
    }
}

// Convert bits to message
function bitsToMessage(bits) {
    let message = '';
    console.log(bits)
    for (let i = 0; i < bits.length; i += 8) {
        let charCode = 0;
        for (let j = 0; j < 8; j++) {
            charCode = (charCode << 1) | bits[i + j];
        }
        if (charCode === 0) break; // Stop at null character
        message += String.fromCharCode(charCode);
    }
    return message;
}

// Decode message from frame
async function decodeMessageFromFrame(framePath) {
    try {
        const image = await Jimp.read(framePath);
        const data = image.bitmap.data;

        let bits = [];
        for (let i = 0; i < data.length; i += 4) {
            for (let j = 0; j < 3; j++) {
                bits.push(data[i + j] & 1);
            }
        }

        return bitsToMessage(bits);
    } catch (error) {
        console.error('Error decoding message from frame:', error);
    }
}

async function decrypt(inputPath, fileType){
    let message = '';
    try {
        if(fileType.includes("mp4")){
            const framesDir = "steganoFrame/"
            // Ensure frames directory exists
            if (!fs.existsSync(framesDir)) {
                fs.mkdirSync(framesDir, { recursive: true });
            }

            // Step 1: Extract the first frame
            await new Promise((resolve, reject) => {
                Ffmpeg(inputPath)
                    .output(path.join(framesDir, 'frame-001.png'))
                    .frames(1)
                    .on('end', resolve)
                    .on('error', reject)
                    .run();
            });

            // Step 2: Decode message from the first frame
            const framePath = path.join(framesDir, 'frame-001.png');
            message = await decodeMessageFromFrame(framePath);

            await clearDirectory(framesDir);

        }else{
            const encodedImage = await Jimp.read(inputPath);
            const encodedData = encodedImage.bitmap.data;

            let messageBits = [];

            for (let i = 0; i < encodedData.length; i += 4) {
                for (let j = 0; j < 3; j++) {
                    messageBits.push(encodedData[i + j] & 1);
                }
                // console.log(messageBits)
            }

            for (let i = 0; i < messageBits.length; i += 8) {
                let charCode = 0;
                for (let j = 0; j < 8; j++) {
                    charCode = (charCode << 1) | messageBits[i + j];
                }
                if (charCode === 0) break;
                message += String.fromCharCode(charCode);
            }
        }
        console.log('Secret message has been decoded and saved to', message);

        return message
    } catch (err) {
        console.error(err);
    }
}

export default {
    encrypt,
    decrypt
}