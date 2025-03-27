import { ethers } from 'ethers';
import { STORAGE_CONTRACT_ABI, STORAGE_CONTRACT_ADDRESS } from '../config/contracts';

class ApiService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
  }

  initialize(provider, signer) {
    this.provider = provider;
    this.signer = signer;
    this.contract = new ethers.Contract(
      STORAGE_CONTRACT_ADDRESS,
      STORAGE_CONTRACT_ABI,
      signer
    );
  }

  async fetchUserFiles(address) {
    try {
      const files = await this.contract.getUserFiles(address);
      return files.map(file => ({
        id: file.id,
        name: file.name,
        size: file.size,
        cid: file.cid,
        type: file.fileType,
        uploadDate: new Date(file.uploadDate * 1000),
      }));
    } catch (error) {
      console.error('Error fetching user files:', error);
      throw error;
    }
  }

  async fetchUserProfile(address) {
    try {
      const profile = await this.contract.getUserProfile(address);
      return {
        totalStorageUsed: profile.totalStorageUsed,
        filesStored: profile.filesStored,
        memberSince: new Date(profile.memberSince * 1000),
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(address, profile) {
    try {
      const tx = await this.contract.updateUserProfile(
        address,
        profile.totalStorageUsed,
        profile.filesStored
      );
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async updateUserSettings(address, settings) {
    try {
      const tx = await this.contract.updateUserSettings(
        address,
        settings.notifications,
        settings.autoBackup,
        ethers.utils.parseUnits(settings.storageLimit, 'gwei')
      );
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }

  async fetchStorageProviders() {
    try {
      const providers = await this.contract.getStorageProviders();
      return providers.map(provider => ({
        address: provider.address,
        name: provider.name,
        totalSpace: provider.totalSpace,
        usedSpace: provider.usedSpace,
        reputationScore: provider.reputationScore,
        stakedAmount: ethers.utils.formatEther(provider.stakedAmount),
      }));
    } catch (error) {
      console.error('Error fetching storage providers:', error);
      throw error;
    }
  }

  async downloadFile(cid) {
    try {
      const file = await this.contract.getFileByCid(cid);
      if (!file) {
        throw new Error('File not found');
      }
      return file;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  async uploadFile(file) {
    try {
      const buffer = await file.arrayBuffer();
      const tx = await this.contract.uploadFile(
        file.name,
        buffer,
        file.type
      );
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async deleteFile(cid) {
    try {
      const tx = await this.contract.deleteFile(cid);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async shareFile(cid) {
    try {
      const shareLink = await this.contract.generateShareLink(cid);
      return shareLink;
    } catch (error) {
      console.error('Error sharing file:', error);
      throw error;
    }
  }
}

export default new ApiService(); 