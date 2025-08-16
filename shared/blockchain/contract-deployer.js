import { Address, Cell, contractAddress, StateInit } from "ton";

export class ContractDeployer {
  addressForContract(params) {
    return contractAddress({
      workchain: 0,
      initialData: params.data,
      initialCode: params.code,
    });
  }

  async deployContract(params, tonConnectUI) {
    const contractAddr = this.addressForContract(params);
    let cell = new Cell();
    new StateInit({ data: params.data, code: params.code }).writeTo(cell);
    
    if (!params.dryRun) {
      // Validate tonConnectUI
      if (!tonConnectUI) {
        throw new Error('TON Connect UI is not available. Please ensure wallet is connected.');
      }

      // Check if sendTransaction method exists
      if (typeof tonConnectUI.sendTransaction !== 'function') {
        throw new Error('TON Connect UI sendTransaction method is not available. Please reconnect your wallet.');
      }

      const transaction = {
        validUntil: Date.now() + 5 * 60 * 1000,
        messages: [
          {
            address: contractAddr.toString(),
            amount: params.value.toString(),
            stateInit: cell.toBoc().toString("base64"),
            payload: params.message?.toBoc().toString("base64"),
          },
        ],
      };

      try {
        await tonConnectUI.sendTransaction(transaction);
      } catch (error) {
        console.error('Transaction failed:', error);
        throw new Error(`Deployment transaction failed: ${error.message || 'Unknown error'}`);
      }
    }

    return contractAddr;
  }
} 