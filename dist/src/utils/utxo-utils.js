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
exports.convertBlockfrostUtxoToCardanoWasmUtxoAsync = exports.calculateTotalUtxoQuantity = exports.getPureAdaUtxos = exports.getUtxosWithAsset = void 0;
const cardano_multiplatform_lib_nodejs_1 = __importDefault(require("@dcspark/cardano-multiplatform-lib-nodejs"));
const getUtxosWithAsset = (blockfrostApi, address, unit) => __awaiter(void 0, void 0, void 0, function* () {
    let utxos = yield blockfrostApi.addressesUtxosAll(address);
    let utxosWithAsset = [];
    if (utxos.length < 0)
        return utxos;
    for (let utxo of utxos) {
        for (let amount of utxo.amount) {
            if (amount.unit !== unit)
                continue;
            utxosWithAsset.push(utxo);
            break;
        }
    }
    return utxosWithAsset;
});
exports.getUtxosWithAsset = getUtxosWithAsset;
const getPureAdaUtxos = (blockfrostApi, address) => __awaiter(void 0, void 0, void 0, function* () {
    let utxos = yield blockfrostApi.addressesUtxosAll(address);
    if (utxos.length < 0)
        return utxos;
    let pureAdaUtxos = [];
    for (let utxo of utxos) {
        var pureAda = true;
        for (let amount of utxo.amount) {
            if (amount.unit !== 'lovelace')
                pureAda = false;
            break;
        }
        if (pureAda)
            pureAdaUtxos.push(utxo);
    }
    return pureAdaUtxos;
});
exports.getPureAdaUtxos = getPureAdaUtxos;
const calculateTotalUtxoQuantity = (utxos, unit = 'lovelace') => {
    return utxos
        .map((utxo) => utxo.amount)
        .map((amount) => amount
        .filter((a) => a.unit === unit)
        .map((a) => Number(a.quantity))
        .reduce((a, b) => a + b, 0))
        .reduce((a, b) => a + b, 0);
};
exports.calculateTotalUtxoQuantity = calculateTotalUtxoQuantity;
const convertBlockfrostUtxoToCardanoWasmUtxoAsync = (blockfrostAPI, blockfrostUtxo, addr) => __awaiter(void 0, void 0, void 0, function* () {
    const cardanoWasmUtxo = cardano_multiplatform_lib_nodejs_1.default.TransactionUnspentOutputs.new();
    try {
        for (const utxo of blockfrostUtxo) {
            let outputValue = cardano_multiplatform_lib_nodejs_1.default.Value.new(cardano_multiplatform_lib_nodejs_1.default.BigNum.from_str(utxo.amount.filter((u) => u.unit === 'lovelace')[0].quantity));
            let multiAsset = null;
            for (const tx of utxo.amount) {
                if (tx.unit !== 'lovelace') {
                    if (!multiAsset)
                        multiAsset = cardano_multiplatform_lib_nodejs_1.default.MultiAsset.new();
                    const assetDetails = yield blockfrostAPI.assetsById(tx.unit);
                    const asset = cardano_multiplatform_lib_nodejs_1.default.Assets.new();
                    console.log(assetDetails.asset_name);
                    asset.insert(cardano_multiplatform_lib_nodejs_1.default.AssetName.new(Buffer.from(assetDetails.asset_name, 'hex')), cardano_multiplatform_lib_nodejs_1.default.BigNum.from_str(tx.quantity));
                    multiAsset.insert(cardano_multiplatform_lib_nodejs_1.default.ScriptHash.from_hex(assetDetails.policy_id), asset);
                }
            }
            if (multiAsset) {
                outputValue.set_multiasset(multiAsset);
            }
            cardanoWasmUtxo.add(cardano_multiplatform_lib_nodejs_1.default.TransactionUnspentOutput.new(cardano_multiplatform_lib_nodejs_1.default.TransactionInput.new(cardano_multiplatform_lib_nodejs_1.default.TransactionHash.from_hex(utxo.tx_hash), cardano_multiplatform_lib_nodejs_1.default.BigNum.from_str(utxo.output_index.toString())), cardano_multiplatform_lib_nodejs_1.default.TransactionOutput.new(cardano_multiplatform_lib_nodejs_1.default.Address.from_bech32(addr), outputValue)));
        }
    }
    catch (err) {
        console.log(err);
    }
    return cardanoWasmUtxo;
});
exports.convertBlockfrostUtxoToCardanoWasmUtxoAsync = convertBlockfrostUtxoToCardanoWasmUtxoAsync;
//# sourceMappingURL=utxo-utils.js.map