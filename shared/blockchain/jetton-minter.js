import BN from "bn.js";
import { Cell, beginCell, Address, beginDict, toNano } from "ton";
import { Sha256 } from "@aws-crypto/sha256-js";
import axios from "axios";

// Dynamic contract codes will be generated and compiled at runtime
// No static BOC fallbacks - all contracts are user-generated and compiled with func-js

const ONCHAIN_CONTENT_PREFIX = 0x00;
const OFFCHAIN_CONTENT_PREFIX = 0x01;
const SNAKE_PREFIX = 0x00;

// Dynamic contract codes will be generated and passed in
// No more static imports or fallbacks

export const OPS = {
  ChangeAdmin: 3,
  ReplaceMetadata: 4,
  Mint: 21,
  InternalTransfer: 0x178d4519,
  Transfer: 0xf8a7ea5,
  Burn: 0x595f07bc,
};

export const jettonOnChainMetadataSpec = {
  name: "utf8",
  description: "utf8",
  image: "ascii",
  decimals: "utf8",
  symbol: "utf8",
  image_data: undefined,
  uri: "ascii",
  // Transaction fee configuration
  transaction_fee_percentage: "utf8",
  transaction_fee_buyback_percentage: "utf8",
  transaction_fee_treasury_percentage: "utf8",
  transaction_fee_distribution_type: "utf8",
  // Deflationary mechanism configuration
  deflationary_trigger_type: "utf8",
  deflationary_threshold_amount: "utf8",
  deflationary_time_period: "utf8",
  deflationary_max_buyback_per_tx: "utf8",
  deflationary_enable_auto_buyback: "utf8",
  deflationary_enable_burn_on_buyback: "utf8"
};

// Keys that should be excluded from onchain metadata (handled separately in contract state)
const EXCLUDED_METADATA_KEYS = ['totalSupply', 'initialPrice'];

// Key mappings for compatibility
const KEY_MAPPINGS = {
  'imageUrl': 'image'
};

const sha256 = (str) => {
  const sha = new Sha256();
  sha.update(str);
  return Buffer.from(sha.digestSync());
};

export function buildJettonOnchainMetadata(data) {
  const KEYLEN = 256;
  const dict = beginDict(KEYLEN);

  Object.entries(data).forEach(([k, v]) => {
    // Skip keys that are not part of jetton metadata spec
    if (EXCLUDED_METADATA_KEYS.includes(k)) {
      return;
    }

    // Apply key mappings for compatibility
    const mappedKey = KEY_MAPPINGS[k] || k;

    if (!jettonOnChainMetadataSpec[mappedKey]) {
      throw new Error(`Unsupported onchain key: ${k} (mapped to: ${mappedKey})`);
    }
    if (v === undefined || v === "") return;

    // Convert numeric values to strings
    const stringValue = typeof v === 'number' ? v.toString() : v;
    let bufferToStore = Buffer.from(stringValue, jettonOnChainMetadataSpec[mappedKey]);
    const CELL_MAX_SIZE_BYTES = Math.floor((1023 - 8) / 8);

    const rootCell = new Cell();
    rootCell.bits.writeUint8(SNAKE_PREFIX);
    let currentCell = rootCell;

    while (bufferToStore.length > 0) {
      currentCell.bits.writeBuffer(bufferToStore.slice(0, CELL_MAX_SIZE_BYTES));
      bufferToStore = bufferToStore.slice(CELL_MAX_SIZE_BYTES);
      if (bufferToStore.length > 0) {
        let newCell = new Cell();
        currentCell.refs.push(newCell);
        currentCell = newCell;
      }
    }

    dict.storeRef(sha256(mappedKey), rootCell);
  });

  return beginCell().storeInt(ONCHAIN_CONTENT_PREFIX, 8).storeDict(dict.endDict()).endCell();
}

export function buildJettonOffChainMetadata(contentUri) {
  return beginCell()
    .storeInt(OFFCHAIN_CONTENT_PREFIX, 8)
    .storeBuffer(Buffer.from(contentUri, "ascii"))
    .endCell();
}

export async function readJettonMetadata(contentCell) {
  const contentSlice = contentCell.beginParse();

  switch (contentSlice.readUint(8).toNumber()) {
    case ONCHAIN_CONTENT_PREFIX: {
      const res = parseJettonOnchainMetadata(contentSlice);
      let persistenceType = "onchain";

      if (res.metadata.uri) {
        const offchainMetadata = await getJettonMetadataFromExternalUri(res.metadata.uri);
        persistenceType = offchainMetadata.isIpfs ? "offchain_ipfs" : "offchain_private_domain";
        res.metadata = {
          ...res.metadata,
          ...offchainMetadata.metadata,
        };
      }

      return {
        persistenceType: persistenceType,
        ...res,
      };
    }
    case OFFCHAIN_CONTENT_PREFIX: {
      const { metadata, isIpfs } = await parseJettonOffchainMetadata(contentSlice);
      return {
        persistenceType: isIpfs ? "offchain_ipfs" : "offchain_private_domain",
        metadata,
      };
    }
    default:
      throw new Error("Unexpected jetton metadata content prefix");
  }
}

async function parseJettonOffchainMetadata(contentSlice) {
  return getJettonMetadataFromExternalUri(contentSlice.readRemainingBytes().toString("ascii"));
}

async function getJettonMetadataFromExternalUri(uri) {
  const jsonURI = uri.replace("ipfs://", "https://ipfs.io/ipfs/");

  return {
    metadata: (await axios.get(jsonURI)).data,
    isIpfs: /(^|\/)ipfs[.:]/.test(jsonURI),
  };
}

function parseJettonOnchainMetadata(contentSlice) {
  const toKey = (str) => new BN(str, "hex").toString(10);
  const KEYLEN = 256;

  let isJettonDeployerFaultyOnChainData = false;

  const dict = contentSlice.readDict(KEYLEN, (s) => {
    let buffer = Buffer.from("");

    const sliceToVal = (s, v, isFirst) => {
      s.toCell().beginParse();
      if (isFirst && s.readUint(8).toNumber() !== SNAKE_PREFIX)
        throw new Error("Only snake format is supported");

      v = Buffer.concat([v, s.readRemainingBytes()]);
      if (s.remainingRefs === 1) {
        v = sliceToVal(s.readRef(), v, false);
      }

      return v;
    };

    if (s.remainingRefs === 0) {
      isJettonDeployerFaultyOnChainData = true;
      return sliceToVal(s, buffer, true);
    }

    return sliceToVal(s.readRef(), buffer, true);
  });

  const res = {};

  Object.keys(jettonOnChainMetadataSpec).forEach((k) => {
    const val = dict
      .get(toKey(sha256(k).toString("hex")))
      ?.toString(jettonOnChainMetadataSpec[k]);
    if (val) res[k] = val;
  });

  return {
    metadata: res,
    isJettonDeployerFaultyOnChainData,
  };
}

export function initData(owner, data, offchainUri, jettonWalletCode) {
  if (!data && !offchainUri) {
    throw new Error("Must either specify onchain data or offchain uri");
  }

  if (!jettonWalletCode) {
    throw new Error("Jetton wallet code must be provided - no fallbacks allowed");
  }

  return beginCell()
    .storeCoins(0)
    .storeAddress(owner)
    .storeRef(
      offchainUri ? buildJettonOffChainMetadata(offchainUri) : buildJettonOnchainMetadata(data)
    )
    .storeRef(jettonWalletCode)
    .endCell();
}

export function mintBody(owner, jettonValue, transferToJWallet, queryId) {
  return beginCell()
    .storeUint(OPS.Mint, 32)
    .storeUint(queryId, 64)
    .storeAddress(owner)
    .storeCoins(transferToJWallet)
    .storeRef(
      beginCell()
        .storeUint(OPS.InternalTransfer, 32)
        .storeUint(0, 64)
        .storeCoins(jettonValue)
        .storeAddress(null)
        .storeAddress(owner)
        .storeCoins(toNano(0.001))
        .storeBit(false)
        .endCell()
    )
    .endCell();
}

export function burn(amount, responseAddress) {
  return beginCell()
    .storeUint(OPS.Burn, 32)
    .storeUint(1, 64)
    .storeCoins(amount)
    .storeAddress(responseAddress)
    .storeDict(null)
    .endCell();
}

export function transfer(to, from, jettonAmount) {
  return beginCell()
    .storeUint(OPS.Transfer, 32)
    .storeUint(1, 64)
    .storeCoins(jettonAmount)
    .storeAddress(to)
    .storeAddress(from)
    .storeBit(false)
    .storeCoins(toNano(0.001))
    .storeBit(false)
    .endCell();
}

export function changeAdminBody(newAdmin) {
  return beginCell()
    .storeUint(OPS.ChangeAdmin, 32)
    .storeUint(0, 64)
    .storeAddress(newAdmin)
    .endCell();
}

export function updateMetadataBody(metadata) {
  return beginCell()
    .storeUint(OPS.ReplaceMetadata, 32)
    .storeUint(0, 64)
    .storeRef(metadata)
    .endCell();
}