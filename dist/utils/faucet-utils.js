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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForFundsAsync = exports.requestTestAdaAsync = void 0;
const cardano_multiplatform_lib_nodejs_1 = __importDefault(require("@dcspark/cardano-multiplatform-lib-nodejs"));
const promises_1 = require("timers/promises");
const tx_utils_1 = require("./tx-utils");
const utxo_utils_1 = require("./utxo-utils");
const wallet_utils_1 = require("./wallet-utils");
const prompt = require('prompt-sync')();
const requestTestAdaAsync = (requestCount, address, blockfrostAPI, protocolParameters) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const mnemonic = (0, wallet_utils_1.generateMnemonic)(15);
    const entropy = (0, wallet_utils_1.generateEntropy)(mnemonic);
    const rootKey = (0, wallet_utils_1.getRootKeyFromEntropy)(entropy); // input -> ed25519e_sk13z833xpg4aj4wzqs0syrzvptyt98st23vll0q5crasjshh07fd0cqcz3j83a9vyxvwue588lc8463j4qy4q56el3285jwd42wlatqkc9q7ugd
    for (let i = 0; i < requestCount; i++) {
        const accountKey = (0, wallet_utils_1.getWalletFromRootKey)(rootKey, i);
        const utxoKeys = (0, wallet_utils_1.getUtxoPubKeyFromAccountKey)(accountKey);
        const stakeKey = (0, wallet_utils_1.getStakeKeyFromAccountKey)(accountKey);
        const baseAddress = (0, wallet_utils_1.getBaseAddress)(utxoKeys.utxoPubkey, stakeKey, cardano_multiplatform_lib_nodejs_1.default.NetworkInfo.testnet());
        const requestURL = `${process.env.CARDANO_TESTNET_FAUCET_URL}${baseAddress.to_address().to_bech32()}`;
        console.log({ xxxx: utxoKeys.utxoPrivKey.to_raw_key().to_bech32() });
        const res = yield prompt(`Sent test ada to ${baseAddress.to_address().to_bech32()} ?\n(y/n):`);
        if (res === 'n')
            break;
        const isFunded = yield (0, exports.waitForFundsAsync)(baseAddress.to_address().to_bech32(), blockfrostAPI);
        if (isFunded) {
            console.log(`Sending tAda to ${address}`);
            const utxos = yield blockfrostAPI.addressesUtxosAll(baseAddress.to_address().to_bech32());
            const output = 995 * 1000000; // lovelace
            const txBody = yield (0, tx_utils_1.createTxBodyFromUtxosAsync)(protocolParameters, utxos, [{ address: cardano_multiplatform_lib_nodejs_1.default.Address.from_bech32(address), amount: output.toFixed() }], utxoKeys.utxoPrivKey.to_raw_key().to_bech32(), accountKey.to_raw_key().to_bech32(), baseAddress.to_address().to_bech32(), blockfrostAPI);
            let retries = 0;
            let tx = null;
            while (true) {
                if (retries > 5)
                    break;
                try {
                    tx = yield blockfrostAPI.txSubmit(txBody.finalTx.to_bytes());
                    break;
                }
                catch (err) {
                    console.log(err);
                    console.log('Error sending transaction...');
                    retries++;
                }
            }
            if (tx) {
                console.log(`Transaction sent for txHash: ${(_a = txBody.finalTxHash) === null || _a === void 0 ? void 0 : _a.to_hex()}`);
                // console.log(`Ada successfully sent to ${address}, here's the txHash: ${txBody.finalTxHash!.to_hex()}`);
                const isConfirmed = yield (0, tx_utils_1.confirmTransactionAsync)(txBody.finalTxHash.to_hex(), blockfrostAPI, 1);
                console.log(`Transaction ${isConfirmed ? 'confirmed' : 'not confirmed'}`);
                console.log(`Transaction hash: ${txBody.finalTxHash.to_hex()}`);
            }
            else {
                console.log('Error sending transaction...');
            }
        }
        else {
            console.log('Not enough funds...');
        }
    }
});
exports.requestTestAdaAsync = requestTestAdaAsync;
const waitForFundsAsync = (address, blockfrostAPI) => __awaiter(void 0, void 0, void 0, function* () {
    const MAX_RETRIES = 30;
    let retries = 0;
    while (true) {
        try {
            if (retries >= MAX_RETRIES) {
                console.log(`Failed to fund address ${address} after ${MAX_RETRIES} retries`);
                return false;
            }
            const utxos = yield blockfrostAPI.addressesUtxosAll(address);
            const totalAda = (0, utxo_utils_1.calculateTotalUtxoQuantity)(utxos);
            if (totalAda > 0) {
                console.log(`Successfully funded address ${address} with ${totalAda / 1000000} ADA`);
                return true;
            }
            console.log(`Waiting for funds...`);
        }
        catch (err) {
            console.log(`Error waiting for funds...retrying...`);
        }
        retries++;
        yield (0, promises_1.setTimeout)(10000);
    }
});
exports.waitForFundsAsync = waitForFundsAsync;
