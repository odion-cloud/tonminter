import { createServer } from "http";
import { storage } from "./storage.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function registerRoutes(app) {
  // Health check endpoint
  app.get('/api/health', async (req, res) => {
    res.json({ 
      success: true, 
      message: "VueTonner API is running",
      timestamp: new Date().toISOString(),
      network: req.query.testnet ? 'testnet' : 'mainnet'
    });
  });

  // Network info endpoint
  app.get('/api/network', async (req, res) => {
    try {
      const network = req.query.testnet ? 'testnet' : 'mainnet';
      res.json({
        success: true,
        network,
        endpoints: {
          mainnet: 'https://toncenter.com/api/v2/jsonRPC',
          testnet: 'https://testnet.toncenter.com/api/v2/jsonRPC'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  // Validate address endpoint
  app.post('/api/validate/address', async (req, res) => {
    try {
      const { address } = req.body;

      if (!address) {
        return res.status(400).json({
          success: false,
          message: 'Address is required'
        });
      }

      // Import TON address validation
      const { Address } = await import('ton');

      try {
        Address.parse(address);
        res.json({
          success: true,
          valid: true,
          message: 'Valid TON address'
        });
      } catch {
        res.json({
          success: true,
          valid: false,
          message: 'Invalid TON address format'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  // Token metadata validation
  app.post('/api/validate/metadata', async (req, res) => {
    try {
      const { metadata } = req.body;

      const errors = [];

      if (!metadata.name || metadata.name.length < 1) {
        errors.push('Token name is required');
      }

      if (!metadata.symbol || metadata.symbol.length < 1) {
        errors.push('Token symbol is required');
      }

      if (metadata.symbol && metadata.symbol.length > 10) {
        errors.push('Token symbol must be 10 characters or less');
      }

      if (!metadata.decimals || metadata.decimals < 0 || metadata.decimals > 18) {
        errors.push('Decimals must be between 0 and 18');
      }

      if (!metadata.totalSupply || metadata.totalSupply <= 0) {
        errors.push('Total supply must be greater than 0');
      }

      res.json({
        success: errors.length === 0,
        valid: errors.length === 0,
        errors,
        message: errors.length === 0 ? 'Metadata is valid' : 'Metadata validation failed'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  // Image validation endpoint
  app.post('/api/validate/image', async (req, res) => {
    try {
      const { imageUrl } = req.body;

      if (!imageUrl) {
        return res.json({
          success: true,
          valid: false,
          message: 'No image URL provided'
        });
      }

      // Basic URL validation
      try {
        new URL(imageUrl);

        // Check if it's a reasonable image URL
        const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
        const isImageUrl = imageExtensions.some(ext => 
          imageUrl.toLowerCase().includes(ext)
        ) || imageUrl.includes('ipfs://') || imageUrl.includes('data:image/');

        res.json({
          success: true,
          valid: isImageUrl,
          message: isImageUrl ? 'Image URL is valid' : 'URL does not appear to be an image'
        });
      } catch {
        res.json({
          success: true,
          valid: false,
          message: 'Invalid URL format'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  

  // Contract deployment status
  app.get('/api/deployment/:address', async (req, res) => {
    try {
      const { address } = req.params;
      const network = req.query.testnet ? 'testnet' : 'mainnet';

      // Here you would check the actual deployment status on the blockchain
      // For now, return a simple response
      res.json({
        success: true,
        address,
        network,
        deployed: true, // This would be checked against the blockchain
        message: 'Contract deployment status retrieved'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  const server = createServer(app);
  return server;
}