import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import CardanoWasm, { BaseAddress, Transaction } from '@dcspark/cardano-multiplatform-lib-nodejs';
import { ProtocolParameters, UTXO } from '../types/cardano-types';
import { getTransactionBuilder } from './tx-utils';

export const mintNativeTokenTransaction = (
    privKey: string,
    changeAddress: string,
    name: string,
    totalSupply: number,
    ttlSlot: string,
    protocolParameters: ProtocolParameters,
    utxos: CardanoWasm.TransactionUnspentOutputs
): Transaction => {
    const nativeScripts = CardanoWasm.NativeScripts.new();
    const scriptPubKey = CardanoWasm.NativeScript.new_script_pubkey(
        CardanoWasm.ScriptPubkey.new(CardanoWasm.PrivateKey.from_bech32(privKey).to_public().hash())
    );
    const scriptTtl = CardanoWasm.NativeScript.new_timelock_expiry(
        CardanoWasm.TimelockExpiry.new(CardanoWasm.BigNum.from_str(ttlSlot))
    );

    nativeScripts.add(scriptPubKey);
    nativeScripts.add(scriptTtl);

    const mintScript = CardanoWasm.NativeScript.new_script_all(CardanoWasm.ScriptAll.new(nativeScripts));
    const policyId = Buffer.from(mintScript.hash(0).to_bytes()).toString('hex');

    console.log({ policyId });

    const assetName = CardanoWasm.AssetName.new(Buffer.from(name, 'utf-8'));
    const assetSupply = CardanoWasm.Int.new_i32(totalSupply);

    const txBuilder = getTransactionBuilder(protocolParameters);
    txBuilder.add_mint_asset(mintScript, assetName, assetSupply);
    txBuilder.add_inputs_from(utxos, 0);
    txBuilder.set_ttl(CardanoWasm.BigNum.from_str(ttlSlot));
    txBuilder.add_change_if_needed(CardanoWasm.Address.from_bech32(changeAddress));

    const txBody = txBuilder.build();
    const txHash = CardanoWasm.hash_transaction(txBody);
    const witnesses = CardanoWasm.TransactionWitnessSet.new();

    const vkeyWitnesses = CardanoWasm.Vkeywitnesses.new();
    const vkeyWitness = CardanoWasm.make_vkey_witness(txHash, CardanoWasm.PrivateKey.from_bech32(privKey));

    vkeyWitnesses.add(vkeyWitness);
    witnesses.set_vkeys(vkeyWitnesses);

    const mintNativeScripts = CardanoWasm.NativeScripts.new();
    mintNativeScripts.add(mintScript);
    witnesses.set_native_scripts(mintNativeScripts);

    const tx = CardanoWasm.Transaction.new(txBody, witnesses, undefined);

    console.log({ txHash: txHash.to_hex() });

    return tx;
};

export const mintNFTTokenTransaction = () => {};
