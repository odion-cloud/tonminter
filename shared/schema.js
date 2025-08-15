import { z } from "zod";

export const insertUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email format").optional(),
});

export const NetworkType = {
  MAINNET: 'mainnet',
  TESTNET: 'testnet'
};

// Type definitions as plain objects for documentation
export const TokenConfigSchema = {
  name: "string",
  symbol: "string", 
  decimals: "number",
  totalSupply: "number",
  initialPrice: "number",
  imageUrl: "string (optional)",
  description: "string (optional)"
};

export const TransactionFeeConfigSchema = {
  feePercentage: "number",
  distributionType: "'default' | 'custom'",
  buybackPercentage: "number (optional)",
  treasuryPercentage: "number (optional)"
};

export const BuybackConfigSchema = {
  triggerType: "'threshold' | 'time' | 'hybrid'",
  thresholdAmount: "number",
  timePeriod: "'daily' | 'weekly' | 'monthly'",
  maxBuybackPerTx: "number"
};

export const ContractConfigSchema = {
  token: "TokenConfig",
  transactionFee: "TransactionFeeConfig", 
  buyback: "BuybackConfig"
};

export const CompileResultSchema = {
  success: "boolean",
  message: "string",
  contractCode: "string (optional)"
};

export const DeployResultSchema = {
  success: "boolean",
  message: "string",
  address: "string (optional)",
  txHash: "string (optional)"
};

export const TestResultSchema = {
  success: "boolean",
  message: "string",
  testsRun: "number",
  testsPassed: "number", 
  testsFailed: "number",
  details: "TestDetail[]"
};

export const TestDetailSchema = {
  name: "string",
  success: "boolean",
  message: "string (optional)"
}; 