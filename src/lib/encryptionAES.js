
import fs from 'fs';
import crypto from 'crypto';

// Function to generate a random key
function generateKey() {
    return crypto.randomBytes(32);
}

const encryptionKey = generateKey();

// Function to encrypt a file and encode the result in Base64
function encrypt(inputPath, outputPath, key) {
    const input = fs.readFileSync(inputPath);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    const encryptedData = Buffer.concat([iv, cipher.update(input), cipher.final()]);

    // Encode the encrypted data in Base64
    const encodedData = encryptedData.toString('base64');

    if(!fs.existsSync(outputPath)){
        fs.unlinkSync(inputPath)
        fs.writeFileSync(outputPath, encodedData);
    }
    // console.log('File encrypted and encoded in Base64 successfully.');
}

// Function to decode Base64 and decrypt a file
function decrypt(inputPath, outputPath, key) {
    const encodedData = fs.readFileSync(inputPath, 'utf-8');
    const encryptedData = Buffer.from(encodedData, 'base64');
    const iv = encryptedData.slice(0, 16);
    const encryptedContent = encryptedData.slice(16);

    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    const decryptedData = Buffer.concat([decipher.update(encryptedContent), decipher.final()]);

    if(!fs.existsSync(outputPath)){
        fs.writeFileSync(outputPath, decryptedData);
    }
    // console.log('File decoded from Base64 and decrypted successfully.');
}

export default {
    encrypt,
    decrypt
}

// // Example usage
// const inputFile = 'sample.mkv';
// const encodedEncryptedFile = 'encoded_encrypted_file.rda';
// const decodedDecryptedFile = 'decrypt.mkv';

// // Encrypt and encode the file
// encryptAndEncodeBase64(inputFile, encodedEncryptedFile, encryptionKey);

// // Decode and decrypt the file
// decodeBase64AndDecrypt(encodedEncryptedFile, decodedDecryptedFile, encryptionKey);
