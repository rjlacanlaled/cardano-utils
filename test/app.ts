import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { mnemonicToEntropy } from 'bip39';
import { mintNativeTokenTransaction } from '../utils/asset-utils';
import { requestTestAdaAsync } from '../utils/faucet-utils';
import { getLatestProtocolParametersAsync } from '../utils/tx-utils';
import {
    generateEntropy,
    getBaseAddress,
    getRootKeyFromEntropy,
    getStakeKeyFromAccountKey,
    getUtxoPubKeyFromAccountKey,
    getWalletFromRootKey,
} from '../utils/wallet-utils';
import CardanoWasm, { MultiAsset } from '@dcspark/cardano-multiplatform-lib-nodejs';
import { UTXO } from '../types/cardano-types';
import { convertBlockfrostUtxoToCardanoWasmUtxoAsync } from '../utils/utxo-utils';

const blockfrostAPI = new BlockFrostAPI({
    projectId: 'testnet2G4i1WtQqUP382VkwQXs0bYqTRYCFsBQ',
    isTestnet: true,
});

(async function () {
    // const protocolParameters = await getLatestProtocolParametersAsync(blockfrostAPI);
    const entropy = generateEntropy(process.env.MNEMONIC as string);
    console.log(entropy);
    // const rootKey = getRootKeyFromEntropy(entropy);
    // const accountKey = getWalletFromRootKey(rootKey, 0);
    // const utxoKeys = getUtxoPubKeyFromAccountKey(accountKey);
    // const stakeKey = getStakeKeyFromAccountKey(accountKey);
    // const baseAddress = getBaseAddress(utxoKeys.utxoPubkey, stakeKey, CardanoWasm.NetworkInfo.testnet());
    // // await requestTestAdaAsync(
    // //     5,
    // //     'addr_test1qpwd8kfnuw8j75z0tcu7xm2s257w73xjymkyns2pnjf9tvfh2qp827tfcgjeuazr5m9pwkuyxhfgsv83yn6jtrlyxfaqlrmqzy',
    // //     blockfrostAPI,
    // //     protocolParameters
    // // );
    // const block = await blockfrostAPI.blocksLatest();
    // const utxos = await blockfrostAPI.addressesUtxosAll(baseAddress.to_address().to_bech32());
    // console.log('here 1');
    // const txUtxos = await convertBlockfrostUtxoToCardanoWasmUtxoAsync(
    //     blockfrostAPI,
    //     utxos,
    //     baseAddress.to_address().to_bech32()
    // );
    // console.log('here');
    // const getMintTx = mintNativeTokenTransaction(
    //     utxoKeys.utxoPrivKey.to_raw_key().to_bech32(),
    //     baseAddress.to_address().to_bech32(),
    //     'CNCLV_TEST',
    //     1_000_000_000,
    //     (block.slot! + 1_000_000).toString(),
    //     protocolParameters,
    //     txUtxos
    // );
    // const tx = await blockfrostAPI.txSubmit(getMintTx.to_bytes());

    // const rootKey = getRootKeyFromEntropy(entropy);
    // const accountKey = getWalletFromRootKey(rootKey, 0);
    // const utxoKeys = getUtxoPubKeyFromAccountKey(accountKey);
    // const stakeKey = getStakeKeyFromAccountKey(accountKey);
    // const baseAddress = getBaseAddress(utxoKeys.utxoPubkey, stakeKey, CardanoWasm.NetworkInfo.testnet());

    // console.log(baseAddress.to_address().to_bech32());
})();
