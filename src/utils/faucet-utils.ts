import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import CardanoWasm from '@dcspark/cardano-multiplatform-lib-nodejs';
import { setTimeout } from 'timers/promises';
import { ProtocolParameters, UTXO } from '../types/cardano-types';
import { toHex } from './string-utils';
import { confirmTransactionAsync, createTxBodyFromUtxosAsync } from './tx-utils';
import { calculateTotalUtxoQuantity } from './utxo-utils';
import {
    generateEntropy,
    generateMnemonic,
    getBaseAddress,
    getRootKeyFromEntropy,
    getStakeKeyFromAccountKey,
    getUtxoPubKeyFromAccountKey,
    getWalletFromRootKey,
} from './wallet-utils';
const prompt = require('prompt-sync')();

export const requestTestAdaAsync = async (
    requestCount: number,
    address: string,
    blockfrostAPI: BlockFrostAPI,
    protocolParameters: ProtocolParameters
): Promise<void> => {
    const mnemonic = generateMnemonic(15);
    const entropy = generateEntropy(mnemonic);
    const rootKey = getRootKeyFromEntropy(entropy); // input -> ed25519e_sk13z833xpg4aj4wzqs0syrzvptyt98st23vll0q5crasjshh07fd0cqcz3j83a9vyxvwue588lc8463j4qy4q56el3285jwd42wlatqkc9q7ugd

    for (let i = 0; i < requestCount; i++) {
        const accountKey = getWalletFromRootKey(rootKey, i);
        const utxoKeys = getUtxoPubKeyFromAccountKey(accountKey);
        const stakeKey = getStakeKeyFromAccountKey(accountKey);
        const baseAddress = getBaseAddress(utxoKeys.utxoPubkey, stakeKey, CardanoWasm.NetworkInfo.testnet());

        const requestURL = `${process.env.CARDANO_TESTNET_FAUCET_URL}${baseAddress.to_address().to_bech32()}`;

        console.log({ xxxx: utxoKeys.utxoPrivKey.to_raw_key().to_bech32() });

        const res = await prompt(`Sent test ada to ${baseAddress.to_address().to_bech32()} ?\n(y/n):`);

        if (res === 'n') break;

        const isFunded = await waitForFundsAsync(baseAddress.to_address().to_bech32(), blockfrostAPI);

        if (isFunded) {
            console.log(`Sending tAda to ${address}`);
            const utxos: UTXO[] = await blockfrostAPI.addressesUtxosAll(baseAddress.to_address().to_bech32());
            const output = 995 * 1_000_000; // lovelace
            const txBody = await createTxBodyFromUtxosAsync(
                protocolParameters,
                utxos,
                [{ address: CardanoWasm.Address.from_bech32(address), amount: output.toFixed() }],
                utxoKeys.utxoPrivKey.to_raw_key().to_bech32(),
                accountKey.to_raw_key().to_bech32(),
                baseAddress.to_address().to_bech32(),
                blockfrostAPI
            );
            let retries = 0;
            let tx = null;

            while (true) {
                if (retries > 5) break;

                try {
                    tx = await blockfrostAPI.txSubmit(txBody.finalTx!.to_bytes());
                    break;
                } catch (err) {
                    console.log(err);
                    console.log('Error sending transaction...');
                    retries++;
                }
            }

            if (tx) {
                console.log(`Transaction sent for txHash: ${txBody.finalTxHash?.to_hex()}`);
                // console.log(`Ada successfully sent to ${address}, here's the txHash: ${txBody.finalTxHash!.to_hex()}`);
                const isConfirmed = await confirmTransactionAsync(txBody.finalTxHash!.to_hex(), blockfrostAPI, 1);

                console.log(`Transaction ${isConfirmed ? 'confirmed' : 'not confirmed'}`);
                console.log(`Transaction hash: ${txBody.finalTxHash!.to_hex()}`);
            } else {
                console.log('Error sending transaction...');
            }
        } else {
            console.log('Not enough funds...');
        }
    }
};

export const waitForFundsAsync = async (address: string, blockfrostAPI: BlockFrostAPI): Promise<boolean> => {
    const MAX_RETRIES = 30;
    let retries = 0;

    while (true) {
        try {
            if (retries >= MAX_RETRIES) {
                console.log(`Failed to fund address ${address} after ${MAX_RETRIES} retries`);
                return false;
            }

            const utxos: UTXO[] = await blockfrostAPI.addressesUtxosAll(address);
            const totalAda = calculateTotalUtxoQuantity(utxos);

            if (totalAda > 0) {
                console.log(`Successfully funded address ${address} with ${totalAda / 1_000_000} ADA`);
                return true;
            }

            console.log(`Waiting for funds...`);
        } catch (err) {
            console.log(`Error waiting for funds...retrying...`);
        }

        retries++;
        await setTimeout(10000);
    }
};
