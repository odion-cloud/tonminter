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

      await tonConnectUI.sendTransaction(transaction);
    }

    return contractAddr;
  }
} 