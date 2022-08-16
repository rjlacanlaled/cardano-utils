import CardanoWasm, { Transaction } from '@dcspark/cardano-multiplatform-lib-nodejs';
import { ProtocolParameters } from '../types/cardano-types';
export declare const mintNativeTokenTransaction: (privKey: string, changeAddress: string, name: string, totalSupply: number, ttlSlot: string, protocolParameters: ProtocolParameters, utxos: CardanoWasm.TransactionUnspentOutputs) => Transaction;
export declare const mintNFTTokenTransaction: () => void;
//# sourceMappingURL=asset-utils.d.ts.map