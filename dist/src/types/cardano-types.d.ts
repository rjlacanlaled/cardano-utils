import { LinearFee } from '@dcspark/cardano-multiplatform-lib-nodejs';
export declare type ProtocolParameters = {
    linearFee: LinearFee;
    poolDeposit: string;
    keyDeposit: string;
    maxValueSize: number;
    maxTxSize: number;
    coinsPerUtxoWord: string;
};
export declare type UTXO = {
    /** @description Transaction hash of the UTXO */
    tx_hash: string;
    /**
     * @deprecated
     * @description UTXO index in the transaction
     */
    tx_index: number;
    /** @description UTXO index in the transaction */
    output_index: number;
    amount: {
        /**
         * Format: Lovelace or concatenation of asset policy_id and hex-encoded asset_name
         * @description The unit of the value
         */
        unit: string;
        /** @description The quantity of the unit */
        quantity: string;
    }[];
    /** @description Block hash of the UTXO */
    block: string;
    /** @description The hash of the transaction output datum */
    data_hash: string | null;
    /**
     * @description CBOR encoded inline datum
     * @example 19a6aa
     */
    inline_datum: string | null;
    /**
     * @description The hash of the reference script of the output
     * @example 13a3efd825703a352a8f71f4e2758d08c28c564e8dfcce9f77776ad1
     */
    reference_script_hash: string | null;
};
//# sourceMappingURL=cardano-types.d.ts.map