import { createWorker } from 'tesseract.js';
import { pipeline } from '@tensorflow/tfjs-node';
import { logger } from '../utils/logger.js';
import sharp from 'sharp';
import { compress } from 'brotli';
import { ethers } from 'ethers';
import { STORAGE_CONTRACT_ABI, STORAGE_CONTRACT_ADDRESS } from '../config/contracts';

class StorageOptimizer {
    constructor() {
        this.ocrWorker = null;
        this.compressionModel = null;
        this.initialized = false;
        this.provider = null;
        this.contract = null;
    }

    async initialize(provider) {
        if (this.initialized) return;

        this.provider = provider;
        this.contract = new ethers.Contract(
            STORAGE_CONTRACT_ADDRESS,
            STORAGE_CONTRACT_ABI,
            provider
        );
        this.initialized = true;

        try {
            // Initialize OCR worker for text analysis
            this.ocrWorker = await createWorker();
            await this.ocrWorker.loadLanguage('eng');
            await this.ocrWorker.initialize('eng');

            // Load compression model
            this.compressionModel = await pipeline('image-compression', 'tfjs-node');
            
            logger.info('Storage optimizer initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize storage optimizer:', error);
            throw error;
        }
    }

    async optimizeFile(fileBuffer, fileType) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            let optimizedBuffer = fileBuffer;
            let compressionRatio = 1;

            // Analyze file content
            const analysis = await this.analyzeContent(fileBuffer, fileType);
            
            // Apply optimization based on content type
            if (analysis.isImage) {
                const result = await this.optimizeImage(fileBuffer, analysis);
                optimizedBuffer = result.buffer;
                compressionRatio = result.ratio;
            } else if (analysis.isText) {
                const result = await this.optimizeText(fileBuffer, analysis);
                optimizedBuffer = result.buffer;
                compressionRatio = result.ratio;
            }

            return {
                optimizedBuffer,
                compressionRatio,
                analysis
            };
        } catch (error) {
            logger.error('File optimization failed:', error);
            throw error;
        }
    }

    async analyzeContent(fileBuffer, fileType) {
        const analysis = {
            isImage: false,
            isText: false,
            contentType: fileType,
            size: fileBuffer.length,
            metadata: {}
        };

        try {
            // Check if file is an image
            if (fileType.startsWith('image/')) {
                analysis.isImage = true;
                const imageAnalysis = await this.analyzeImage(fileBuffer);
                analysis.metadata = { ...analysis.metadata, ...imageAnalysis };
            }

            // Check if file contains text
            if (fileType === 'text/plain' || fileType === 'application/pdf') {
                analysis.isText = true;
                const textAnalysis = await this.analyzeText(fileBuffer);
                analysis.metadata = { ...analysis.metadata, ...textAnalysis };
            }

            return analysis;
        } catch (error) {
            logger.error('Content analysis failed:', error);
            return analysis;
        }
    }

    async analyzeImage(fileBuffer) {
        try {
            const metadata = await sharp(fileBuffer).metadata();
            return {
                dimensions: `${metadata.width}x${metadata.height}`,
                colorSpace: metadata.space,
                compressionPotential: this.calculateImageCompressionPotential(metadata)
            };
        } catch (error) {
            logger.error('Image analysis failed:', error);
            return {};
        }
    }

    async analyzeText(fileBuffer) {
        try {
            const { data: { text } } = await this.ocrWorker.recognize(fileBuffer);
            return {
                textLength: text.length,
                language: await this.detectLanguage(text),
                compressionPotential: this.calculateTextCompressionPotential(text)
            };
        } catch (error) {
            logger.error('Text analysis failed:', error);
            return {};
        }
    }

    async optimizeImage(fileBuffer, analysis) {
        try {
            const metadata = await sharp(fileBuffer).metadata();
            let optimizedBuffer = fileBuffer;
            let quality = 80;

            // Adjust quality based on image type and size
            if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
                quality = this.calculateJPEGQuality(metadata);
            }

            // Optimize image using sharp
            optimizedBuffer = await sharp(fileBuffer)
                .resize(metadata.width, metadata.height, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality, progressive: true })
                .toBuffer();

            const ratio = fileBuffer.length / optimizedBuffer.length;

            return {
                buffer: optimizedBuffer,
                ratio
            };
        } catch (error) {
            logger.error('Image optimization failed:', error);
            return {
                buffer: fileBuffer,
                ratio: 1
            };
        }
    }

    async optimizeText(fileBuffer, analysis) {
        try {
            // Convert buffer to string
            const text = fileBuffer.toString('utf8');

            // Apply text-specific optimizations
            let optimizedText = text;
            
            // Remove unnecessary whitespace
            optimizedText = optimizedText.replace(/\s+/g, ' ').trim();
            
            // Compress using Brotli
            const compressedBuffer = compress(optimizedText);
            
            const ratio = fileBuffer.length / compressedBuffer.length;

            return {
                buffer: compressedBuffer,
                ratio
            };
        } catch (error) {
            logger.error('Text optimization failed:', error);
            return {
                buffer: fileBuffer,
                ratio: 1
            };
        }
    }

    calculateImageCompressionPotential(metadata) {
        // Calculate compression potential based on image characteristics
        let potential = 0.7; // Base potential

        // Adjust based on image size
        if (metadata.width > 1920 || metadata.height > 1080) {
            potential += 0.2; // High resolution images have more potential
        }

        // Adjust based on color space
        if (metadata.space === 'srgb') {
            potential += 0.1; // sRGB images can be compressed more
        }

        return Math.min(potential, 0.9); // Cap at 0.9
    }

    calculateTextCompressionPotential(text) {
        // Calculate compression potential based on text characteristics
        let potential = 0.6; // Base potential

        // Adjust based on text length
        if (text.length > 1000) {
            potential += 0.2; // Longer texts have more potential
        }

        // Adjust based on whitespace
        const whitespaceRatio = (text.match(/\s/g) || []).length / text.length;
        if (whitespaceRatio > 0.2) {
            potential += 0.1; // More whitespace means more potential
        }

        return Math.min(potential, 0.8); // Cap at 0.8
    }

    calculateJPEGQuality(metadata) {
        let quality = 80; // Default quality

        // Adjust quality based on image size
        if (metadata.width > 1920 || metadata.height > 1080) {
            quality = 70; // Lower quality for high resolution
        } else if (metadata.width < 800 && metadata.height < 600) {
            quality = 90; // Higher quality for small images
        }

        return quality;
    }

    async detectLanguage(text) {
        // Implement language detection logic
        return 'en';
    }

    async optimizeStorage() {
        try {
            // Get all storage providers
            const providers = await this.contract.getStorageProviders();
            
            // Analyze storage usage and optimize
            for (const provider of providers) {
                const usageRatio = provider.usedSpace / provider.totalSpace;
                
                // If storage usage is high (>80%), trigger optimization
                if (usageRatio > 0.8) {
                    await this.optimizeProvider(provider.address);
                }
            }
        } catch (error) {
            console.error('Error optimizing storage:', error);
            throw error;
        }
    }

    async optimizeProvider(providerAddress) {
        try {
            // Get provider's files
            const files = await this.contract.getProviderFiles(providerAddress);
            
            // Sort files by last access time
            files.sort((a, b) => b.lastAccessTime - a.lastAccessTime);
            
            // Move least accessed files to other providers
            for (const file of files) {
                if (file.lastAccessTime < Date.now() - 30 * 24 * 60 * 60 * 1000) { // 30 days
                    await this.relocateFile(file.cid, providerAddress);
                }
            }
        } catch (error) {
            console.error(`Error optimizing provider ${providerAddress}:`, error);
            throw error;
        }
    }

    async relocateFile(cid, fromProvider) {
        try {
            // Find a suitable provider with low storage usage
            const providers = await this.contract.getStorageProviders();
            const suitableProvider = providers.find(
                provider => 
                    provider.address !== fromProvider &&
                    (provider.usedSpace / provider.totalSpace) < 0.5
            );

            if (suitableProvider) {
                // Transfer file to new provider
                await this.contract.transferFile(
                    cid,
                    fromProvider,
                    suitableProvider.address
                );
            }
        } catch (error) {
            console.error(`Error relocating file ${cid}:`, error);
            throw error;
        }
    }

    async analyzeStorageMetrics() {
        try {
            const providers = await this.contract.getStorageProviders();
            
            const metrics = {
                totalStorage: providers.reduce((acc, p) => acc + p.totalSpace, 0),
                totalUsed: providers.reduce((acc, p) => acc + p.usedSpace, 0),
                averageUsage: 0,
                providers: providers.length,
                optimizationNeeded: false,
            };

            metrics.averageUsage = metrics.totalUsed / metrics.totalStorage;
            metrics.optimizationNeeded = metrics.averageUsage > 0.8;

            return metrics;
        } catch (error) {
            console.error('Error analyzing storage metrics:', error);
            throw error;
        }
    }

    async getOptimizationRecommendations() {
        try {
            const metrics = await this.analyzeStorageMetrics();
            const recommendations = [];

            if (metrics.optimizationNeeded) {
                recommendations.push({
                    type: 'HIGH_USAGE',
                    message: 'Storage usage is high. Consider adding more storage providers.',
                });
            }

            const providers = await this.contract.getStorageProviders();
            for (const provider of providers) {
                const usageRatio = provider.usedSpace / provider.totalSpace;
                
                if (usageRatio > 0.9) {
                    recommendations.push({
                        type: 'PROVIDER_CRITICAL',
                        message: `Provider ${provider.address} is running critically low on storage.`,
                        provider: provider.address,
                    });
                } else if (usageRatio > 0.8) {
                    recommendations.push({
                        type: 'PROVIDER_WARNING',
                        message: `Provider ${provider.address} is running low on storage.`,
                        provider: provider.address,
                    });
                }
            }

            return recommendations;
        } catch (error) {
            console.error('Error getting optimization recommendations:', error);
            throw error;
        }
    }

    async terminate() {
        if (this.ocrWorker) {
            await this.ocrWorker.terminate();
        }
        this.initialized = false;
    }
}

export const storageOptimizer = new StorageOptimizer(); 