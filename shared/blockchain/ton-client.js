import { TonClient } from "ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";

let clientPromise = null;
let endpointPromise = null;

export function getNetwork(network = 'testnet') {
  // Accept network parameter instead of reading from URL
  return network || 'testnet';
}

export async function getEndpoint(network = 'testnet') {
  if (!endpointPromise) {
    endpointPromise = getHttpEndpoint({
      network: getNetwork(network),
    });
  }
  return endpointPromise;
}

export async function getTonClient(network = 'testnet') {
  if (!clientPromise) {
    clientPromise = createTonClient(network);
  }
  return clientPromise;
}

async function createTonClient(network = 'testnet') {
  const endpoint = await getEndpoint(network);
  return new TonClient({
    endpoint,
  });
}

// Utility to reset client (useful for network switching)
export function resetTonClient() {
  clientPromise = null;
  endpointPromise = null;
} 