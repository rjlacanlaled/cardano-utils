"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const blockfrost_js_1 = require("@blockfrost/blockfrost-js");
const wallet_utils_1 = require("../utils/wallet-utils");
const blockfrostAPI = new blockfrost_js_1.BlockFrostAPI({
    projectId: 'testnet2G4i1WtQqUP382VkwQXs0bYqTRYCFsBQ',
    isTestnet: true,
});
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        // const protocolParameters = await getLatestProtocolParametersAsync(blockfrostAPI);
        const entropy = (0, wallet_utils_1.generateEntropy)(process.env.MNEMONIC);
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
    });
})();
//# sourceMappingURL=app.js.map