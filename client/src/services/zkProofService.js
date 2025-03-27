import { ethers } from 'ethers';
import { PrivacyProof } from '../contracts/PrivacyProof';
import { generateProof } from '../utils/zkProof';

class ZKProofService {
    constructor(provider, signer) {
        this.provider = provider;
        this.signer = signer;
        this.contract = new ethers.Contract(
            process.env.REACT_APP_PRIVACY_PROOF_ADDRESS,
            PrivacyProof.abi,
            signer
        );
    }

    async generateFileProof(fileHash, fileContent) {
        try {
            // Generate commitment
            const commitment = ethers.utils.keccak256(
                ethers.utils.defaultAbiCoder.encode(
                    ['bytes32', 'bytes'],
                    [fileHash, fileContent]
                )
            );

            // Generate ZK proof
            const { a, b, c, input } = await generateProof(fileHash, commitment);

            return {
                commitment,
                proof: { a, b, c, input }
            };
        } catch (error) {
            console.error('Error generating proof:', error);
            throw error;
        }
    }

    async submitProof(fileHash, commitment, proof) {
        try {
            const tx = await this.contract.submitProof(
                fileHash,
                commitment,
                proof.a,
                proof.b,
                proof.c,
                proof.input
            );
            await tx.wait();
            return tx;
        } catch (error) {
            console.error('Error submitting proof:', error);
            throw error;
        }
    }

    async verifyProof(fileHash) {
        try {
            return await this.contract.verifyProof(fileHash);
        } catch (error) {
            console.error('Error verifying proof:', error);
            throw error;
        }
    }

    async getUserProofs(userAddress) {
        try {
            return await this.contract.getUserProofs(userAddress);
        } catch (error) {
            console.error('Error getting user proofs:', error);
            throw error;
        }
    }
}

export default ZKProofService; 