import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { Address, Transaction, TransactionBuilder, TransactionHash } from '@dcspark/cardano-multiplatform-lib-nodejs';
import { ProtocolParameters, UTXO } from '../types/cardano-types';
export declare const getTransactionBuilder: (config: ProtocolParameters) => TransactionBuilder;
export declare const getLatestProtocolParametersAsync: (BlockFrostAPI: BlockFrostAPI) => Promise<ProtocolParameters>;
export declare const getProtocolParametersAsync: (blockfrostAPI: BlockFrostAPI, epochNumber: number) => Promise<ProtocolParameters>;
export declare const createTxBodyFromUtxosAsync: (protocolParams: ProtocolParameters, inputs: UTXO[], outputs: {
    address: Address;
    amount: string;
}[], privateKey: string, accountPrivateKey: string, changeAddress: string, blockfrostAPI: BlockFrostAPI) => Promise<{
    finalTx: Transaction | null;
    finalTxHash: TransactionHash | null;
    inputAmount: number;
    outputAmount: number;
    inputUtxos: UTXO[];
    outputData: {
        address: Address;
        amount: string;
    }[];
}>;
export declare const confirmTransactionAsync: (txHashString: string, blockfrostAPI: BlockFrostAPI, confirmationCount: number) => Promise<boolean>;
//# sourceMappingURL=tx-utils.d.ts.map