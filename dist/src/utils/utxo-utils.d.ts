import { BlockFrostAPI, Responses } from '@blockfrost/blockfrost-js';
import { UTXO } from '../types/cardano-types';
import CardanoWasm from '@dcspark/cardano-multiplatform-lib-nodejs';
export declare const getUtxosWithAsset: (blockfrostApi: BlockFrostAPI, address: string, unit: string) => Promise<Responses['address_utxo_content']>;
export declare const getPureAdaUtxos: (blockfrostApi: BlockFrostAPI, address: string) => Promise<Responses['address_utxo_content']>;
export declare const calculateTotalUtxoQuantity: (utxos: UTXO[], unit?: string) => number;
export declare const convertBlockfrostUtxoToCardanoWasmUtxoAsync: (blockfrostAPI: BlockFrostAPI, blockfrostUtxo: UTXO[], addr: string) => Promise<CardanoWasm.TransactionUnspentOutputs>;
//# sourceMappingURL=utxo-utils.d.ts.map