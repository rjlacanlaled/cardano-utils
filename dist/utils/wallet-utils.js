"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPointerAddress = exports.getBaseAddress = exports.getStakeKeyFromAccountKey = exports.getUtxoPubKeyFromAccountKey = exports.getWalletFromRootKey = exports.getRootKeyFromEntropy = exports.generateEntropy = exports.generateMnemonic = void 0;
const bip39 = require('bip39');
const cardano_multiplatform_lib_nodejs_1 = __importStar(require("@dcspark/cardano-multiplatform-lib-nodejs"));
const generateMnemonic = (wordCount) => {
    return bip39.generateMnemonic();
};
exports.generateMnemonic = generateMnemonic;
const generateEntropy = (mnemonic) => {
    return bip39.mnemonicToEntropy(mnemonic);
};
exports.generateEntropy = generateEntropy;
const getRootKeyFromEntropy = (entropy) => {
    return cardano_multiplatform_lib_nodejs_1.default.Bip32PrivateKey.from_bip39_entropy(Buffer.from(entropy, 'hex'), Buffer.from(''));
};
exports.getRootKeyFromEntropy = getRootKeyFromEntropy;
const getWalletFromRootKey = (rootKey, index = 0) => {
    return rootKey.derive(harden(1852)).derive(harden(1815)).derive(harden(index));
};
exports.getWalletFromRootKey = getWalletFromRootKey;
const getUtxoPubKeyFromAccountKey = (accountKey, index = 0) => {
    return {
        utxoPrivKey: accountKey.derive(0).derive(index),
        utxoPubkey: accountKey.derive(0).derive(index).to_public(),
    };
};
exports.getUtxoPubKeyFromAccountKey = getUtxoPubKeyFromAccountKey;
const getStakeKeyFromAccountKey = (accountKey, index = 0) => {
    return accountKey.derive(2).derive(index).to_public();
};
exports.getStakeKeyFromAccountKey = getStakeKeyFromAccountKey;
const getBaseAddress = (utxoPubKey, stakeKey, network) => {
    return cardano_multiplatform_lib_nodejs_1.default.BaseAddress.new(network.network_id(), cardano_multiplatform_lib_nodejs_1.default.StakeCredential.from_keyhash(utxoPubKey.to_raw_key().hash()), cardano_multiplatform_lib_nodejs_1.default.StakeCredential.from_keyhash(stakeKey.to_raw_key().hash()));
};
exports.getBaseAddress = getBaseAddress;
const getPointerAddress = (utxoPubKey, network) => {
    return cardano_multiplatform_lib_nodejs_1.default.PointerAddress.new(network.network_id(), cardano_multiplatform_lib_nodejs_1.default.StakeCredential.from_keyhash(utxoPubKey.to_raw_key().hash()), cardano_multiplatform_lib_nodejs_1.default.Pointer.new(cardano_multiplatform_lib_nodejs_1.BigNum.from_str('100'), cardano_multiplatform_lib_nodejs_1.BigNum.from_str('2'), cardano_multiplatform_lib_nodejs_1.BigNum.from_str('0')));
};
exports.getPointerAddress = getPointerAddress;
// Helper
const harden = (num) => {
    return 0x80000000 + num;
};
//# sourceMappingURL=wallet-utils.js.map