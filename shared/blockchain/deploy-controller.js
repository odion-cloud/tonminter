import BN from "bn.js";
import { Address, beginCell, toNano } from "ton";
import { ContractDeployer } from "./contract-deployer.js";
import { getTonClient } from "./ton-client.js";
import { 
  waitForContractDeploy, 
  waitForSeqno, 
  zeroAddress, 
  cellToAddress, 
  makeGetCall 
} from "./blockchain-utils.js";
import {
  buildJettonOnchainMetadata,
  burn,
  mintBody,
  transfer,
  updateMetadataBody,
  changeAdminBody,
  readJettonMetadata,
  initData,
  JETTON_MINTER_CODE
} from "./jetton-minter.js";

export const JETTON_DEPLOY_GAS = toNano(0.25);

export const JettonDeployState = {
  NOT_STARTED: 'NOT_STARTED',
  BALANCE_CHECK: 'BALANCE_CHECK',
  UPLOAD_IMAGE: 'UPLOAD_IMAGE',
  UPLOAD_METADATA: 'UPLOAD_METADATA',
  AWAITING_MINTER_DEPLOY: 'AWAITING_MINTER_DEPLOY',
  AWAITING_JWALLET_DEPLOY: 'AWAITING_JWALLET_DEPLOY',
  VERIFY_MINT: 'VERIFY_MINT',
  ALREADY_DEPLOYED: 'ALREADY_DEPLOYED',
  DONE: 'DONE',
};

class JettonDeployController {
  async createJetton(params, tonConnectUI, walletAddress, network = 'testnet') {
    // Validate tonConnectUI
    if (!tonConnectUI) {
      throw new Error("TON Connect UI is not available. Please ensure wallet is connected.");
    }

    const contractDeployer = new ContractDeployer();
    const tc = await getTonClient(network);

    // Check balance
    const balance = await tc.getBalance(params.owner);
    if (balance.lt(JETTON_DEPLOY_GAS)) {
      throw new Error("Not enough balance in deployer wallet");
    }

    const deployParams = this.createDeployParams(params, params.offchainUri);
    const contractAddr = contractDeployer.addressForContract(deployParams);

    if (await tc.isContractDeployed(contractAddr)) {
      console.log("Contract already deployed");
    } else {
      await contractDeployer.deployContract(deployParams, tonConnectUI);
      await waitForContractDeploy(contractAddr, tc);
    }

    const ownerJWalletAddr = await makeGetCall(
      contractAddr,
      "get_wallet_address",
      [beginCell().storeAddress(params.owner).endCell()],
      ([addr]) => addr.beginParse().readAddress(),
      tc,
    );

    await waitForContractDeploy(ownerJWalletAddr, tc);

    return contractAddr;
  }

  createDeployParams(params, offchainUri) {
    const queryId = parseInt(process.env.VUE_APP_DEPLOY_QUERY_ID || "0");

    // Include transaction fee and deflationary settings in metadata
    const enhancedMetadata = {
      ...params.onchainMetaData
    };

    // Add transaction fee configuration to metadata (only if not null)
    if (params.transactionFee) {
      enhancedMetadata.transaction_fee_percentage = params.transactionFee.feePercentage?.toString() || "2";
      enhancedMetadata.transaction_fee_buyback_percentage = params.transactionFee.buybackPercentage?.toString() || "50";
      enhancedMetadata.transaction_fee_treasury_percentage = params.transactionFee.treasuryPercentage?.toString() || "50";
      enhancedMetadata.transaction_fee_distribution_type = params.transactionFee.distributionType || "default";
    } else {
      // Set to "none" when transaction fees are disabled
      enhancedMetadata.transaction_fee_distribution_type = "none";
    }

    // Add deflationary mechanism configuration to metadata (only if not null)
    if (params.deflationary) {
      enhancedMetadata.deflationary_trigger_type = params.deflationary.triggerType || "threshold";
      enhancedMetadata.deflationary_threshold_amount = params.deflationary.thresholdAmount?.toString() || "10000";
      enhancedMetadata.deflationary_time_period = params.deflationary.timePeriod || "weekly";
      enhancedMetadata.deflationary_max_buyback_per_tx = params.deflationary.maxBuybackPerTx?.toString() || "5000";
      enhancedMetadata.deflationary_enable_auto_buyback = params.deflationary.enableAutoBuyback?.toString() || "true";
      enhancedMetadata.deflationary_enable_burn_on_buyback = params.deflationary.enableBurnOnBuyback?.toString() || "true";
    } else {
      // Set to "none" when deflationary mechanism is disabled
      enhancedMetadata.deflationary_trigger_type = "none";
    }

    return {
      code: JETTON_MINTER_CODE,
      data: initData(params.owner, enhancedMetadata, offchainUri),
      deployer: params.owner,
      value: JETTON_DEPLOY_GAS,
      message: mintBody(params.owner, params.amountToMint, toNano(0.2), queryId),
    };
  }

  async burnAdmin(contractAddress, tonConnectUI, walletAddress, network = 'testnet') {
    const tc = await getTonClient(network);
    const waiter = await waitForSeqno(
      tc.openWalletFromAddress({
        source: Address.parse(walletAddress),
      }),
    );

    const transaction = {
      validUntil: Date.now() + 5 * 60 * 1000,
      messages: [
        {
          address: contractAddress.toString(),
          amount: toNano(0.01).toString(),
          stateInit: undefined,
          payload: changeAdminBody(zeroAddress()).toBoc().toString("base64"),
        },
      ],
    };

    await tonConnectUI.sendTransaction(transaction);
    await waiter();
  }

  async mint(tonConnectUI, jettonMaster, amount, walletAddress, network = 'testnet') {
    const tc = await getTonClient(network);
    const waiter = await waitForSeqno(
      tc.openWalletFromAddress({
        source: Address.parse(walletAddress),
      }),
    );

    const transaction = {
      validUntil: Date.now() + 5 * 60 * 1000,
      messages: [
        {
          address: jettonMaster.toString(),
          amount: toNano(0.04).toString(),
          stateInit: undefined,
          payload: mintBody(Address.parse(walletAddress), amount, toNano(0.02), 0)
            .toBoc()
            .toString("base64"),
        },
      ],
    };

    await tonConnectUI.sendTransaction(transaction);
    await waiter();
  }

  async transfer(tonConnectUI, amount, toAddress, fromAddress, ownerJettonWallet, network = 'testnet') {
    const tc = await getTonClient(network);
    const waiter = await waitForSeqno(
      tc.openWalletFromAddress({
        source: Address.parse(fromAddress),
      }),
    );

    const transaction = {
      validUntil: Date.now() + 5 * 60 * 1000,
      messages: [
        {
          address: ownerJettonWallet,
          amount: toNano(0.05).toString(),
          stateInit: undefined,
          payload: transfer(Address.parse(toAddress), Address.parse(fromAddress), amount)
            .toBoc()
            .toString("base64"),
        },
      ],
    };

    await tonConnectUI.sendTransaction(transaction);
    await waiter();
  }

  async burnJettons(tonConnectUI, amount, jettonAddress, walletAddress, network = 'testnet') {
    const tc = await getTonClient(network);
    const waiter = await waitForSeqno(
      tc.openWalletFromAddress({
        source: Address.parse(walletAddress),
      }),
    );

    const transaction = {
      validUntil: Date.now() + 5 * 60 * 1000,
      messages: [
        {
          address: jettonAddress,
          amount: toNano(0.031).toString(),
          stateInit: undefined,
          payload: burn(amount, Address.parse(walletAddress)).toBoc().toString("base64"),
        },
      ],
    };

    await tonConnectUI.sendTransaction(transaction);
    await waiter();
  }

  async getJettonDetails(contractAddr, owner, network = 'testnet') {
    const tc = await getTonClient(network);
    
    const minter = await makeGetCall(
      contractAddr,
      "get_jetton_data",
      [],
      async ([totalSupply, __, adminCell, contentCell]) => ({
        ...(await readJettonMetadata(contentCell)),
        admin: cellToAddress(adminCell),
        totalSupply: totalSupply,
      }),
      tc,
    );

    const jWalletAddress = await makeGetCall(
      contractAddr,
      "get_wallet_address",
      [beginCell().storeAddress(owner).endCell()],
      ([addressCell]) => cellToAddress(addressCell),
      tc,
    );

    const isDeployed = await tc.isContractDeployed(jWalletAddress);

    let jettonWallet;
    if (isDeployed) {
      jettonWallet = await makeGetCall(
        jWalletAddress,
        "get_wallet_data",
        [],
        ([amount, _, jettonMasterAddressCell]) => ({
          balance: amount,
          jWalletAddress,
          jettonMasterAddress: cellToAddress(jettonMasterAddressCell),
        }),
        tc,
      );
    } else {
      jettonWallet = null;
    }

    return {
      minter,
      jettonWallet,
    };
  }

  async updateMetadata(contractAddress, data, tonConnectUI, walletAddress, network = 'testnet') {
    const tc = await getTonClient(network);
    const waiter = await waitForSeqno(
      tc.openWalletFromAddress({
        source: Address.parse(walletAddress),
      }),
    );

    const transaction = {
      validUntil: Date.now() + 5 * 60 * 1000,
      messages: [
        {
          address: contractAddress.toString(),
          amount: toNano(0.01).toString(),
          stateInit: undefined,
          payload: updateMetadataBody(buildJettonOnchainMetadata(data)).toBoc().toString("base64"),
        },
      ],
    };

    await tonConnectUI.sendTransaction(transaction);
    await waiter();
  }
}

export const jettonDeployController = new JettonDeployController(); 