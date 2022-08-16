import CardanoWasm, { BaseAddress, Bip32PrivateKey, Bip32PublicKey, PointerAddress } from '@dcspark/cardano-multiplatform-lib-nodejs';
export declare const generateMnemonic: (wordCount: number) => string;
export declare const generateEntropy: (mnemonic: string) => string;
export declare const getRootKeyFromEntropy: (entropy: string) => Bip32PrivateKey;
export declare const getWalletFromRootKey: (rootKey: Bip32PrivateKey, index?: number) => Bip32PrivateKey;
export declare const getUtxoPubKeyFromAccountKey: (accountKey: Bip32PrivateKey, index?: number) => {
    utxoPrivKey: Bip32PrivateKey;
    utxoPubkey: Bip32PublicKey;
};
export declare const getStakeKeyFromAccountKey: (accountKey: Bip32PrivateKey, index?: number) => Bip32PublicKey;
export declare const getBaseAddress: (utxoPubKey: Bip32PublicKey, stakeKey: Bip32PublicKey, network: CardanoWasm.NetworkInfo) => BaseAddress;
export declare const getPointerAddress: (utxoPubKey: Bip32PublicKey, network: CardanoWasm.NetworkInfo) => PointerAddress;
//# sourceMappingURL=wallet-utils.d.ts.map