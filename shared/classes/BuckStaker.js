/* global BigInt */
// import Log from 'shared/classes/Log.js';

export default class BuckStaker {
    constructor(params = {}) {

        this._suiMaster = params.suiMaster || null;
        this._consts = {
            CLOCK: "0x0000000000000000000000000000000000000000000000000000000000000006",
            sBUCK: "0x1798f84ee72176114ddbf5525a6d964c5f8ea1b3738d08d50d0d3de4cf584884::sbuck::SBUCK",
            BUCK: "0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2::buck::BUCK",
            SUI: "0x2::sui::SUI",
            SBUCK_PACKAGE: "0x1798f84ee72176114ddbf5525a6d964c5f8ea1b3738d08d50d0d3de4cf584884", // package with sbuck::deposit
            SBUCK_FLASK_OBJECT_ID: "0xc6ecc9731e15d182bc0a46ebe1754a779a4bfb165c201102ad51a36838a1a7b8", // arg for sbuck::deposit
            SBUCK_FOUNTAIN_PACKAGE_ID: "0x75b23bde4de9aca930d8c1f1780aa65ee777d8b33c3045b053a178b452222e82", // package with fountain_core
            SBUCK_BUCK_LP_REGISTRY_ID: "0xbdf91f558c2b61662e5839db600198eda66d502e4c10c4fc5c683f9caca13359", // arg for fountain_core::stake
        };

        // StakeProof result has a type of:
        // 0x75b23bde4de9aca930d8c1f1780aa65ee777d8b33c3045b053a178b452222e82::fountain_core::StakeProof<0x1798f84ee72176114ddbf5525a6d964c5f8ea1b3738d08d50d0d3de4cf584884::sbuck::SBUCK, 0x2::sui::SUI>

    }

    get stakedProofType() {
        return '0x75b23bde4de9aca930d8c1f1780aa65ee777d8b33c3045b053a178b452222e82::fountain_core::StakeProof<0x1798f84ee72176114ddbf5525a6d964c5f8ea1b3738d08d50d0d3de4cf584884::sbuck::SBUCK, 0x2::sui::SUI>';
    }

    get consts() {
        return this._consts;
    }

    get suiMaster() {
        return this._suiMaster;
    }

    async getFountain() {
        const SuiObject = this.suiMaster.SuiObject;
        const fountain = new SuiObject({id: this.consts.SBUCK_BUCK_LP_REGISTRY_ID, suiMaster: this.suiMaster });
        await fountain.fetchFields();

        return fountain;
    }

    calculateRewardsOfStakeProof(fountain, stakeProof) {
        const DISTRIBUTION_PRECISION = BigInt('0x10000000000000000');

        const currentTime = BigInt((new Date()).getTime());
        const latestReleaseTime = BigInt(fountain.fields.latest_release_time);
        const flowAmount = BigInt(fountain.fields.flow_amount);
        const flowInterval = BigInt(fountain.fields.flow_interval);
        const sourceBalance = BigInt(fountain.fields.source);
        const totalWeight = BigInt(fountain.fields.total_weight);

        let virtualReleasedAmount = BigInt(0);
        //     public fun get_virtual_released_amount<S, R>(fountain: &Fountain<S, R>, current_time: u64): u64 {
        if (currentTime > latestReleaseTime) {
            const interval = currentTime - latestReleaseTime;
            const releasedAmount = (flowAmount * interval + flowInterval / BigInt(2)) / flowInterval;
            if (releasedAmount > sourceBalance) {
                virtualReleasedAmount = sourceBalance;
            } else {
                virtualReleasedAmount = releasedAmount;
            }
        }

        // public fun get_reward_amount<S, R>(
        const stakeWeight = BigInt(stakeProof.fields.stake_weight);
        const startUint = BigInt(stakeProof.fields.start_uint);
        const cumulativeUnit = BigInt(fountain.fields.cumulative_unit);


        const virtualCumulativeUnit = cumulativeUnit + (
                (virtualReleasedAmount * DISTRIBUTION_PRECISION + totalWeight / BigInt(2)) / totalWeight
            );


        const rewardAmount = (stakeWeight * (virtualCumulativeUnit - startUint) + DISTRIBUTION_PRECISION / BigInt(2) ) / DISTRIBUTION_PRECISION;

        // (math::mul_factor_u128((proof.stake_weight as u128), virtual_cumulative_unit - proof.start_uint, DISTRIBUTION_PRECISION) as u64)

        // (number * numerator + denominator / 2) / denominator
        // Log.tag('BuckStaker').info('Calculating rewards', fountain.fields, stakeProof.fields, rewardAmount);
        return rewardAmount;
    }

    async calculateRewards(params = {}) {
        const SuiObject = this.suiMaster.SuiObject;
        const suiObject = params.suiObject;

        const fountain = new SuiObject({id: this.consts.SBUCK_BUCK_LP_REGISTRY_ID, suiMaster: this.suiMaster });
        await fountain.fetchFields();

        const bagId = suiObject.fields.object_bag.fields.id.id;

        const objectBag = new SuiObject({id: bagId, suiMaster: this.suiMaster});
        const objectBagFields = await objectBag.getDynamicFields();

        // Log.tag('BuckStaker').info('StakeProof', objectBagFields);
        let amount = BigInt(0);
        await objectBagFields.forEach(async(field)=>{
            if (field) {
                if (field.name && field.name.value) {
                    if (field.name.value.indexOf('StakeProof') !== -1) {
                        const obj = new SuiObject({id: field.objectId, suiMaster: this.suiMaster});
                        await obj.fetchFields();

                        amount = amount + this.calculateRewardsOfStakeProof(fountain, obj);
                    }
                }
            }
        });

        return amount;
    }

    async unstakeBuckFromCapsule(params = {}) {
        const moveModule = params.moveModule;
        const timeCapsulePackageId = moveModule._package.address;

        const timeCapsuleId = params.timeCapsuleId;
        const storeId = params.storeId;

        const ownerAddress = this.suiMaster.address;
        const TransactionBlock = this.suiMaster.TransactionBlock;
        const txBlock = new TransactionBlock();

        // 1st step - get the StakeProof object out of Capsule
        const stakeProof = txBlock.moveCall({
            target: `${timeCapsulePackageId}::timecapsule::take_out_object_no_entry`,
            arguments: [txBlock.pure(storeId), txBlock.pure(timeCapsuleId)],
            typeArguments: [this.stakedProofType],
        });

        // 2nd step - unstake it from the fountain
        txBlock.moveCall({
            target: `${this.consts.SBUCK_FOUNTAIN_PACKAGE_ID}::fountain_core::force_unstake`,
            arguments: [
                    txBlock.pure(this.consts.CLOCK), 
                    txBlock.pure(this.consts.SBUCK_BUCK_LP_REGISTRY_ID), 
                    stakeProof
                ],
            typeArguments: [this.consts.sBUCK, this.consts.SUI],
        });

        // unstaked[0] is sBuck balance
        // unstaked[1] is SUI balance ( rewards )

        const coinSBuck = txBlock.moveCall({
            target: `0x0000000000000000000000000000000000000000000000000000000000000002::coin::from_balance`,
            arguments: [{kind: "NestedResult",index: 1,resultIndex: 0}],
            typeArguments: [this.consts.sBUCK],
        });

        const coinSui = txBlock.moveCall({
            target: `0x0000000000000000000000000000000000000000000000000000000000000002::coin::from_balance`,
            arguments: [{kind: "NestedResult",index: 1,resultIndex: 1}],
            typeArguments: [this.consts.SUI],
        });

        // transfer SUI for the owner:
        txBlock.transferObjects([coinSui], txBlock.pure(ownerAddress));

        // withdraw sBUCK to BUCK:
        const buckBalance = txBlock.moveCall({
            target: `${this.consts.SBUCK_PACKAGE}::sbuck::withdraw`,
            arguments: [txBlock.pure(this.consts.SBUCK_FLASK_OBJECT_ID), coinSBuck],
            typeArguments: [this.consts.BUCK],
        });

        const coinBuck = txBlock.moveCall({
            target: `0x0000000000000000000000000000000000000000000000000000000000000002::coin::from_balance`,
            arguments: [buckBalance],
            typeArguments: [this.consts.BUCK],
        });

        // transfer Buck for the owner:
        txBlock.transferObjects([coinBuck], txBlock.pure(ownerAddress));

        // const sims = await this.suiMaster._signer._provider.devInspectTransactionBlock({
        //     transactionBlock: txBlock,
        //     sender: this.suiMaster.address,
        // });

        // console.error('sims', sims);

        const res = await moveModule.moveCall('take_out_object_no_entry', {tx: txBlock});
        if (res && res.status && res.status == 'success') {
            return true;
        }
        return false;
    }

    async stakeBuckIntoCapsule(params = {}) {
        const moveModule = params.moveModule;
        const timeCapsulePackageId = moveModule._package.address;

        const timeCapsuleId = params.timeCapsuleId;
        const storeId = params.storeId;

        const amount = params.amount;
        const ownerAddress = this.suiMaster.address;
        const TransactionBlock = this.suiMaster.TransactionBlock;
        const txBlock = new TransactionBlock();

        const coin = await this._suiMaster.suiCoins.get(this.consts.BUCK);
        const txCoinToSend = await coin.coinOfAmountToTxCoin(txBlock, ownerAddress, amount);

        const depositedBalance = txBlock.moveCall({
            target: `${this.consts.SBUCK_PACKAGE}::sbuck::deposit`,
            arguments: [txBlock.pure(this.consts.SBUCK_FLASK_OBJECT_ID), txCoinToSend],
            typeArguments: [this.consts.BUCK],
        });

        const maxLockTimeOfRegistry = 4838400000;
        const stakedProof = txBlock.moveCall({
            target: `${this.consts.SBUCK_FOUNTAIN_PACKAGE_ID}::fountain_core::stake`,
            arguments: [
                    txBlock.pure(this.consts.CLOCK), 
                    txBlock.pure(this.consts.SBUCK_BUCK_LP_REGISTRY_ID), 
                    depositedBalance, 
                    txBlock.pure(maxLockTimeOfRegistry)
                ],
            typeArguments: [this.consts.sBUCK, this.consts.SUI],
        });

        const callArgs = [];
        callArgs.push(txBlock.pure(storeId));
        callArgs.push(txBlock.pure(timeCapsuleId));
        callArgs.push(stakedProof);

        txBlock.moveCall({
            target: `${timeCapsulePackageId}::${moveModule._moduleName}::put_object_to_bag`,
            arguments: callArgs,
            typeArguments: [this.stakedProofType],
        });


        const res = await moveModule.moveCall('take_out_object_no_entry', {tx: txBlock});
        if (res && res.status && res.status == 'success') {
            return true;
        }
        return false;
    }

}