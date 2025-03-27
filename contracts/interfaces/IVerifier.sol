// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IVerifier {
    /**
     * @dev Verifies a zero-knowledge proof
     * @param proof The proof to verify
     * @param publicInputs The public inputs to the proof
     * @return bool Whether the proof is valid
     */
    function verifyProof(
        bytes calldata proof,
        uint256[] calldata publicInputs
    ) external view returns (bool);

    /**
     * @dev Verifies a batch of zero-knowledge proofs
     * @param proofs Array of proofs to verify
     * @param publicInputs Array of public inputs for each proof
     * @return bool Whether all proofs are valid
     */
    function verifyBatchProofs(
        bytes[] calldata proofs,
        uint256[][] calldata publicInputs
    ) external view returns (bool);

    /**
     * @dev Verifies a privacy-preserving proof
     * @param proof The proof to verify
     * @param publicInputs The public inputs to the proof
     * @param privateInputs The private inputs to the proof
     * @return bool Whether the proof is valid
     */
    function verifyPrivacyProof(
        bytes calldata proof,
        uint256[] calldata publicInputs,
        uint256[] calldata privateInputs
    ) external view returns (bool);

    /**
     * @dev Verifies a proof of storage
     * @param proof The proof to verify
     * @param fileHash The hash of the file
     * @param timestamp The timestamp of the proof
     * @return bool Whether the proof is valid
     */
    function verifyStorageProof(
        bytes calldata proof,
        bytes32 fileHash,
        uint256 timestamp
    ) external view returns (bool);

    /**
     * @dev Verifies a proof of data availability
     * @param proof The proof to verify
     * @param dataHash The hash of the data
     * @param timestamp The timestamp of the proof
     * @return bool Whether the proof is valid
     */
    function verifyAvailabilityProof(
        bytes calldata proof,
        bytes32 dataHash,
        uint256 timestamp
    ) external view returns (bool);

    /**
     * @dev Verifies a proof of data integrity
     * @param proof The proof to verify
     * @param dataHash The hash of the data
     * @param timestamp The timestamp of the proof
     * @return bool Whether the proof is valid
     */
    function verifyIntegrityProof(
        bytes calldata proof,
        bytes32 dataHash,
        uint256 timestamp
    ) external view returns (bool);

    /**
     * @dev Verifies a proof of data consistency
     * @param proof The proof to verify
     * @param dataHash The hash of the data
     * @param timestamp The timestamp of the proof
     * @return bool Whether the proof is valid
     */
    function verifyConsistencyProof(
        bytes calldata proof,
        bytes32 dataHash,
        uint256 timestamp
    ) external view returns (bool);
} 