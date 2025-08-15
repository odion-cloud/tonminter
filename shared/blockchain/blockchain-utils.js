import { Address, beginCell, Cell } from "ton";
import BN from "bn.js";

export async function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

export function zeroAddress() {
  return beginCell()
    .storeUint(2, 2)
    .storeUint(0, 1)
    .storeUint(0, 8)
    .storeUint(0, 256)
    .endCell()
    .beginParse()
    .readAddress();
}

export async function waitForSeqno(wallet) {
  const seqnoBefore = await wallet.getSeqNo();

  return async () => {
    for (let attempt = 0; attempt < 25; attempt++) {
      await sleep(3000);
      const seqnoAfter = await wallet.getSeqNo();
      if (seqnoAfter > seqnoBefore) return;
    }
    throw new Error("Timeout waiting for sequence number");
  };
}

export async function waitForContractDeploy(address, client) {
  let isDeployed = false;
  let maxTries = 25;
  while (!isDeployed && maxTries > 0) {
    maxTries--;
    isDeployed = await client.isContractDeployed(address);
    if (isDeployed) return;
    await sleep(3000);
  }
  throw new Error("Timeout waiting for contract deployment");
}

export function cellToAddress(cell) {
  return cell.beginParse().readAddress();
}

export function isValidAddress(address) {
  try {
    Address.parse(address);
    return true;
  } catch {
    return false;
  }
}

// Make blockchain get method calls
export async function makeGetCall(address, methodName, params = [], parser, tonClient) {
  const prepareParams = (params) => {
    return params.map((p) => {
      if (p instanceof Cell) {
        return ["tvm.Slice", p.toBoc({ idx: false }).toString("base64")];
      } else if (p instanceof BN) {
        return ["num", p.toString(10)];
      }
      throw new Error("unknown parameter type!");
    });
  };

  const parseResponse = (stack) => {
    return stack.map(([type, val]) => {
      switch (type) {
        case "num":
          return new BN(val.replace("0x", ""), "hex");
        case "cell":
          return Cell.fromBoc(Buffer.from(val.bytes, "base64"))[0];
        case "list":
          if (val.elements.length === 0) {
            return null;
          } else {
            throw new Error("list parsing not supported");
          }
        default:
          throw new Error(`unknown type: ${type}, val: ${JSON.stringify(val)}`);
      }
    });
  };

  const { stack } = await tonClient.callGetMethod(address, methodName, prepareParams(params));
  return parser(parseResponse(stack));
} 