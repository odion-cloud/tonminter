import { TonClient } from "ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";

let clientPromise = null;
let endpointPromise = null;

export function getNetwork() {
  // Check for testnet in URL params or environment
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has("testnet") ? "testnet" : "mainnet";
}

export async function getEndpoint() {
  if (!endpointPromise) {
    endpointPromise = getHttpEndpoint({
      network: getNetwork(),
    });
  }
  return endpointPromise;
}

export async function getTonClient() {
  if (!clientPromise) {
    clientPromise = createTonClient();
  }
  return clientPromise;
}

async function createTonClient() {
  const endpoint = await getEndpoint();
  return new TonClient({
    endpoint,
  });
}

// Utility to reset client (useful for network switching)
export function resetTonClient() {
  clientPromise = null;
  endpointPromise = null;
} 