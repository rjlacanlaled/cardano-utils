const bip39 = require('bip39');
import CardanoWasm, {
    BaseAddress,
    BigNum,
    Bip32PrivateKey,
    Bip32PublicKey,
    PointerAddress,
} from '@dcspark/cardano-multiplatform-lib-nodejs';
import { getMnemonic, language } from 'bip39-ts';

export const generateMnemonic = (wordCount: number): string => {
    return bip39.generateMnemonic();
};

export const generateEntropy = (mnemonic: string): string => {
    return bip39.mnemonicToEntropy(mnemonic);
};

export const getRootKeyFromEntropy = (entropy: string): Bip32PrivateKey => {
    return CardanoWasm.Bip32PrivateKey.from_bip39_entropy(Buffer.from(entropy, 'hex'), Buffer.from(''));
};

export const getWalletFromRootKey = (rootKey: Bip32PrivateKey, index: number = 0): Bip32PrivateKey => {
    return rootKey.derive(harden(1852)).derive(harden(1815)).derive(harden(index));
};

export const getUtxoPubKeyFromAccountKey = (
    accountKey: Bip32PrivateKey,
    index: number = 0
): { utxoPrivKey: Bip32PrivateKey; utxoPubkey: Bip32PublicKey } => {
    return {
        utxoPrivKey: accountKey.derive(0).derive(index),
        utxoPubkey: accountKey.derive(0).derive(index).to_public(),
    };
};

export const getStakeKeyFromAccountKey = (accountKey: Bip32PrivateKey, index: number = 0): Bip32PublicKey => {
    return accountKey.derive(2).derive(index).to_public();
};

export const getBaseAddress = (
    utxoPubKey: Bip32PublicKey,
    stakeKey: Bip32PublicKey,
    network: CardanoWasm.NetworkInfo
): BaseAddress => {
    return CardanoWasm.BaseAddress.new(
        network.network_id(),
        CardanoWasm.StakeCredential.from_keyhash(utxoPubKey.to_raw_key().hash()),
        CardanoWasm.StakeCredential.from_keyhash(stakeKey.to_raw_key().hash())
    );
};

export const getPointerAddress = (utxoPubKey: Bip32PublicKey, network: CardanoWasm.NetworkInfo): PointerAddress => {
    return CardanoWasm.PointerAddress.new(
        network.network_id(),
        CardanoWasm.StakeCredential.from_keyhash(utxoPubKey.to_raw_key().hash()),
        CardanoWasm.Pointer.new(BigNum.from_str('100'), BigNum.from_str('2'), BigNum.from_str('0'))
    );
};

// Helper

const harden = (num: number): number => {
    return 0x80000000 + num;
};
