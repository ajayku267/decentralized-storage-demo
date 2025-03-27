import { ethers } from 'ethers';
import { groth16 } from 'snarkjs';

export async function generateProof(fileHash, commitment) {
    try {
        // Generate witness
        const input = {
            fileHash: fileHash,
            commitment: commitment,
            // Add any additional inputs needed for your specific proof
        };

        // Generate proof using snarkjs
        const { proof, publicSignals } = await groth16.fullProve(
            input,
            'circuits/file_proof.wasm',
            'circuits/file_proof.zkey'
        );

        // Format proof for contract
        return {
            a: [proof.pi_a[0], proof.pi_a[1]],
            b: [
                [proof.pi_b[0][0], proof.pi_b[0][1]],
                [proof.pi_b[1][0], proof.pi_b[1][1]]
            ],
            c: [proof.pi_c[0], proof.pi_c[1]],
            input: publicSignals
        };
    } catch (error) {
        console.error('Error generating proof:', error);
        throw error;
    }
}

export function verifyProof(proof, publicSignals) {
    try {
        return groth16.verify(
            'circuits/verification_key.json',
            publicSignals,
            proof
        );
    } catch (error) {
        console.error('Error verifying proof:', error);
        throw error;
    }
} 