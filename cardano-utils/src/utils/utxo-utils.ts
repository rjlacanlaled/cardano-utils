import { BlockFrostAPI, Responses } from '@blockfrost/blockfrost-js';
import { UTXO } from '../types/cardano-types';
import CardanoWasm, { Block, MultiAsset } from '@dcspark/cardano-multiplatform-lib-nodejs';

export const getUtxosWithAsset = async (
    blockfrostApi: BlockFrostAPI,
    address: string,
    unit: string
): Promise<Responses['address_utxo_content']> => {
    let utxos: Responses['address_utxo_content'] = await blockfrostApi.addressesUtxosAll(address);
    let utxosWithAsset: Responses['address_utxo_content'] = [];

    if (utxos.length < 0) return utxos;

    for (let utxo of utxos) {
        for (let amount of utxo.amount) {
            if (amount.unit !== unit) continue;
            utxosWithAsset.push(utxo);
            break;
        }
    }

    return utxosWithAsset;
};

export const getPureAdaUtxos = async (
    blockfrostApi: BlockFrostAPI,
    address: string
): Promise<Responses['address_utxo_content']> => {
    let utxos: Responses['address_utxo_content'] = await blockfrostApi.addressesUtxosAll(address);
    if (utxos.length < 0) return utxos;

    let pureAdaUtxos: Responses['address_utxo_content'] = [];

    for (let utxo of utxos) {
        var pureAda = true;
        for (let amount of utxo.amount) {
            if (amount.unit !== 'lovelace') pureAda = false;
            break;
        }

        if (pureAda) pureAdaUtxos.push(utxo);
    }

    return pureAdaUtxos;
};

export const calculateTotalUtxoQuantity = (utxos: UTXO[], unit: string = 'lovelace'): number => {
    return utxos
        .map((utxo) => utxo.amount)
        .map((amount) =>
            amount
                .filter((a) => a.unit === unit)
                .map((a) => Number(a.quantity))
                .reduce((a, b) => a + b, 0)
        )
        .reduce((a, b) => a + b, 0);
};

export const convertBlockfrostUtxoToCardanoWasmUtxoAsync = async (
    blockfrostAPI: BlockFrostAPI,
    blockfrostUtxo: UTXO[],
    addr: string
): Promise<CardanoWasm.TransactionUnspentOutputs> => {
    const cardanoWasmUtxo = CardanoWasm.TransactionUnspentOutputs.new();

    try {
        for (const utxo of blockfrostUtxo) {
            let outputValue = CardanoWasm.Value.new(
                CardanoWasm.BigNum.from_str(utxo.amount.filter((u) => u.unit === 'lovelace')[0].quantity)
            );

            let multiAsset: MultiAsset | null = null;

            for (const tx of utxo.amount) {
                if (tx.unit !== 'lovelace') {
                    if (!multiAsset) multiAsset = CardanoWasm.MultiAsset.new();
                    const assetDetails = await blockfrostAPI.assetsById(tx.unit);
                    const asset = CardanoWasm.Assets.new();
                    console.log(assetDetails.asset_name);
                    asset.insert(
                        CardanoWasm.AssetName.new(Buffer.from(assetDetails.asset_name!, 'hex')),
                        CardanoWasm.BigNum.from_str(tx.quantity)
                    );
                    multiAsset.insert(CardanoWasm.ScriptHash.from_hex(assetDetails.policy_id), asset);
                }
            }

            if (multiAsset) {
                outputValue.set_multiasset(multiAsset);
            }

            cardanoWasmUtxo.add(
                CardanoWasm.TransactionUnspentOutput.new(
                    CardanoWasm.TransactionInput.new(
                        CardanoWasm.TransactionHash.from_hex(utxo.tx_hash),
                        CardanoWasm.BigNum.from_str(utxo.output_index.toString())
                    ),
                    CardanoWasm.TransactionOutput.new(CardanoWasm.Address.from_bech32(addr), outputValue)
                )
            );
        }
    } catch (err) {
        console.log(err);
    }

    return cardanoWasmUtxo;
};
