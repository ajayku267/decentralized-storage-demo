import { ethers } from 'ethers';
import { CrossChainBridge } from '../contracts/CrossChainBridge';

class CrossChainService {
    constructor(provider, signer) {
        this.provider = provider;
        this.signer = signer;
        this.contract = new ethers.Contract(
            process.env.REACT_APP_CROSS_CHAIN_BRIDGE_ADDRESS,
            CrossChainBridge.abi,
            signer
        );
    }

    async getSupportedChains() {
        try {
            const chainIds = await this.contract.getSupportedChainIds();
            const chains = await Promise.all(
                chainIds.map(async (chainId) => {
                    const chainInfo = await this.contract.supportedChains(chainId);
                    return {
                        chainId: chainId.toNumber(),
                        isActive: chainInfo.isActive,
                        bridgeContract: chainInfo.bridgeContract,
                        minConfirmations: chainInfo.minConfirmations.toNumber()
                    };
                })
            );
            return chains.filter(chain => chain.isActive);
        } catch (error) {
            console.error('Error getting supported chains:', error);
            throw error;
        }
    }

    async initiateTransfer(to, amount, targetChainId) {
        try {
            const tx = await this.contract.initiateTransfer(
                to,
                amount,
                targetChainId
            );
            await tx.wait();
            return tx;
        } catch (error) {
            console.error('Error initiating transfer:', error);
            throw error;
        }
    }

    async getTransferStatus(transferId) {
        try {
            const transfer = await this.contract.transferRequests(transferId);
            return {
                from: transfer.from,
                to: transfer.to,
                amount: transfer.amount.toString(),
                sourceChainId: transfer.sourceChainId.toNumber(),
                targetChainId: transfer.targetChainId.toNumber(),
                timestamp: transfer.timestamp.toNumber(),
                executed: transfer.executed
            };
        } catch (error) {
            console.error('Error getting transfer status:', error);
            throw error;
        }
    }

    async getPendingTransfers() {
        try {
            const events = await this.contract.queryFilter(
                this.contract.filters.TransferInitiated()
            );
            return await Promise.all(
                events.map(async (event) => {
                    const transferId = event.args.transferId;
                    return await this.getTransferStatus(transferId);
                })
            );
        } catch (error) {
            console.error('Error getting pending transfers:', error);
            throw error;
        }
    }

    async getChainInfo(chainId) {
        try {
            const chainInfo = await this.contract.supportedChains(chainId);
            return {
                isActive: chainInfo.isActive,
                bridgeContract: chainInfo.bridgeContract,
                minConfirmations: chainInfo.minConfirmations.toNumber()
            };
        } catch (error) {
            console.error('Error getting chain info:', error);
            throw error;
        }
    }
}

export default CrossChainService; 