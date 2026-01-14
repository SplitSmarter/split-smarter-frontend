import AESGCMCrypto, { EncryptedData } from 'react-native-aes-gcm-crypto';
import { AESEncryptedData } from "@/src/types/crypto"; // Assume this is your model

// const key = 'Base64Encoded32ByteKeyHere'; // Must be Base64 encoded
const key = '01234567890123456789012345678901'

export const encrypt = async (plainText: string): Promise<AESEncryptedData> => {
    const encryptedData: EncryptedData = await AESGCMCrypto.encrypt(
        plainText,
        true,     // returns Base64-encoded results
        key
    );

    return {
        cipherText: encryptedData.content,
        tag: encryptedData.tag,
        iv: encryptedData.iv,
    };
};

export const decrypt = async (data: AESEncryptedData): Promise<string> => {
    return await AESGCMCrypto.decrypt(
        data.cipherText,
        key,
        data.iv,
        data.tag,
        true  // expects Base64 input
    );
};