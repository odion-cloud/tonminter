import { Address, toNano } from '@ton/core';
import { TONToken } from '../wrappers/TONToken';
import { NetworkProvider, compile } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    // Compile the contract
    const tokenCode = await compile('token');
    
    // Parameters for the token
    const totalSupply = toNano('2100000000'); // 2.1 billion with 9 decimals
    
    // Treasury address will collect 50% of transaction fees
    const treasuryAddress = Address.parse('UQDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    
    // Convert decimals to "nanotoken" factor
    const decimals = 9; // 9 decimals (like TON)
    
    console.log(`Deploying token contract with:`);
    console.log(`- Total supply: 2,100,000,000 tokens`);
    console.log(`- Decimals: ${decimals}`);
    console.log(`- Initial price: $0.01 per token`);
    console.log(`- Transaction fee: 2% (1% buyback & burn, 1% treasury)`);
    
    // Deploy the contract
    const token = provider.open(
        TONToken.createDeployMessage(
            0, // Workchain ID
            totalSupply,
            treasuryAddress,
            provider.sender()
        )
    );
    
    await token.sendDeploy(provider.sender(), toNano('0.1'));
    
    console.log(`Token contract deployed at address: ${token.address.toString()}`);
    
    // Verify deployment by checking total supply
    const tokenInfo = await token.getTokenInfo();
    console.log(`Total supply: ${tokenInfo.totalSupply.toString()}`);
    console.log(`Circulating supply: ${tokenInfo.circulatingSupply.toString()}`);
    
    console.log('Token deployment completed successfully');
}
