import config from 'shared/classes/ids.js';
import { bcs } from '@mysten/bcs';
import TimeCapsuleEncryptor from '../TimeCapsuleEncryptor.js';

export default class Staking {
    constructor(params = {}) {
        this._suiMaster = params.suiMaster || null;
    }

    config() {
        const chainName = (this._suiMaster.connectedChain).split('sui:').join('');
        if (config[chainName]) {
            return config[chainName];
        }

        return null;
    }

    async makeKettle() {
        const pkg = this._suiMaster.addPackage({id: this.config().packageId});
        await pkg.isOnChain();
        await pkg.modules.kettle.moveCall('mint', []);

        return true;
    }

    async getYourKettles() {
        const pkg = this._suiMaster.addPackage({id: this.config().packageId});
        await pkg.isOnChain();
        const paginated = await pkg.modules.kettle.getOwnedObjects({ typeName: 'Kettle' });
        const ret = [];
        await paginated.forEach((suiObject)=>{ ret.push(suiObject); });

        return ret;
    }

    async releaseStakeProofFromKettle(kettleId) {
        const packageId = this.config().packageId;
        const sbuckType = this.config().bucket.sBUCK.split('%packageId%').join(packageId);
        const suiType = this.config().SUI;

        const pkg = this._suiMaster.addPackage({id: packageId});
        await pkg.isOnChain();

        // admin cap
        const paginated = await pkg.modules.kettle.fetchEvents({
            eventTypeName: 'MintEvent',
        });
        let adminCapId = null;
        await paginated.forEach((suiEvent)=>{
            if (suiEvent.parsedJson.kettle_id == kettleId) {
                adminCapId = suiEvent.parsedJson.admin_cap_id;
            }
        });

        const args = [
            adminCapId,
            kettleId,
        ];

        const types = [
            sbuckType,
            suiType,
        ];

        await pkg.modules.kettle.moveCall('release_fountain_proof', args, types);
    }


    async attachStakeProofToKettle(kettleId, stakeProofId) {
        const packageId = this.config().packageId;
        const sbuckType = this.config().bucket.sBUCK.split('%packageId%').join(packageId);
        const suiType = this.config().SUI;

        const pkg = this._suiMaster.addPackage({id: packageId});
        await pkg.isOnChain();

        // admin cap
        const paginated = await pkg.modules.kettle.fetchEvents({
            eventTypeName: 'MintEvent',
        });
        let adminCapId = null;
        await paginated.forEach((suiEvent)=>{
            if (suiEvent.parsedJson.kettle_id == kettleId) {
                adminCapId = suiEvent.parsedJson.admin_cap_id;
            }
        });
        // kettle
        // stakeProof

        const args = [
            adminCapId,
            kettleId,
            stakeProofId,
        ];

        const types = [
            sbuckType,
            suiType,
        ];

        await pkg.modules.kettle.moveCall('attach_fountain_proof', args, types);
    }

    async getSBuckCoin() {
        const packageId = this.config().packageId;
        const sbuckType = this.config().bucket.sBUCK.split('%packageId%').join(packageId);
        const coin = this._suiMaster.suiCoins.get(sbuckType);
        await coin.getMetadata();

        return coin;
    }

    async getYourBucketProofs() {
        const packageId = this.config().packageId;
        const fountainPackageId = this.config().bucket.fountainPackageId.split('%packageId%').join(packageId);

        const pkg = this._suiMaster.addPackage({id: fountainPackageId});
        await pkg.isOnChain();
        const paginated = await pkg.modules.fountain_core.getOwnedObjects({ typeName: 'StakeProof' });
        const ret = [];
        await paginated.forEach((suiObject)=>{ ret.push(suiObject); });

        return ret;
    }

    async makeLocalFountain() {
        const packageId = this.config().packageId;
        const fountainPackageId = this.config().bucket.fountainPackageId.split('%packageId%').join(packageId);
        const sbuckType = this.config().bucket.sBUCK.split('%packageId%').join(packageId);
        const suiType = this.config().SUI;

        const pkg = this._suiMaster.addPackage({id: fountainPackageId});
        await pkg.isOnChain();

        const args = [
            // this.config().CLOCK, // clock
            // fountain.id, // fountain: &mut Fountain<S, R>,
            // { type: ''+suiType, amount: amount },

            
            pkg.arg('u64', (1000000000)), // flow_amount
            pkg.arg('u64', (24*60*60*1000)), // flow_interval
            pkg.arg('u64', (0)), // min_lock_time
            pkg.arg('u64', (30*24*60*60*1000)), // max_lock_time
            pkg.arg('u64', (1)), // start_time
            pkg.arg('bool', (true)), // with_admin_cap
        ];

        const types = [
            sbuckType,
            suiType,
        ];

        await pkg.modules.fountain_periphery.moveCall('create_fountain', args, types);
    }



    async getFountainYouHaveAdminCapFor() {
        const packageId = this.config().packageId;
        const fountainPackageId = this.config().bucket.fountainPackageId.split('%packageId%').join(packageId);

        const pkg = this._suiMaster.addPackage({id: fountainPackageId});
        await pkg.isOnChain();

        const paginated = await pkg.modules.fountain_core.getOwnedObjects({
                typeName: 'AdminCap',
            });
        let adminCap = null;
        await paginated.forEach((suiObject)=>{
            adminCap = suiObject;
        });

        if (adminCap) {
            const fountainId = adminCap.fields.fountain_id;
            const fountain = new (this._suiMaster.SuiObject)({ id: fountainId, suiMaster: this._suiMaster });
            await fountain.fetchFields();

            return fountain;
        }

        return null;
    }

    async supplyLocalFountain(amount) {
        const packageId = this.config().packageId;
        const fountainPackageId = this.config().bucket.fountainPackageId.split('%packageId%').join(packageId);
        const sbuckType = this.config().bucket.sBUCK.split('%packageId%').join(packageId);
        const suiType = this.config().SUI;

        const fountain = await this.getFountainYouHaveAdminCapFor();

        const pkg = this._suiMaster.addPackage({id: fountainPackageId});
        await pkg.isOnChain();

        const args = [
            this.config().CLOCK, // clock
            fountain.id, // fountain: &mut Fountain<S, R>,
            { type: ''+suiType, amount: amount },
        ];

        const types = [
            sbuckType,
            suiType,
        ];

        await pkg.modules.fountain_periphery.moveCall('supply', args, types);
    }


    async testCoinFaucet() {
        const packageId = this.config().packageId;
        const fountainPackageId = this.config().bucket.fountainPackageId.split('%packageId%').join(packageId);
        // const testCoinType = this.config().testCoin.type.split('%packageId%').join(packageId);

        const pkg = this._suiMaster.addPackage({id: fountainPackageId});
        await pkg.isOnChain();

        const paginated = await pkg.modules.test_coin.fetchEvents({
            eventTypeName: 'FaucetTreasuryEvent',
        });
        let treasuryCapId = null;
        await paginated.forEach((suiEvent)=>{
            treasuryCapId = suiEvent.parsedJson.treasury_cap_id;
        });

        await pkg.modules.test_coin.moveCall('faucet', [treasuryCapId]);

        // alert(treasuryCapId);
    }

    async stakeTestInYourFountain() {
        const packageId = this.config().packageId;
        const fountainPackageId = this.config().bucket.fountainPackageId.split('%packageId%').join(packageId);
        const sbuckType = this.config().bucket.sBUCK.split('%packageId%').join(packageId);
        const suiType = this.config().SUI;

        const fountain = await this.getFountainYouHaveAdminCapFor();

        const pkg = this._suiMaster.addPackage({id: fountainPackageId});
        await pkg.isOnChain();

        const args = [
            this.config().CLOCK, // clock
            fountain.id, // fountain: &mut Fountain<S, R>,
            { type: ''+sbuckType, amount: '1.0' },
            pkg.arg('u64', (24 * 60 * 60 * 1000)), // lock_time
        ];

        const types = [
            sbuckType,
            suiType,
        ];

        await pkg.modules.fountain_periphery.moveCall('stake', args, types);
    }

    async getYourCondensers() {
        const packageId = this.config().packageId;
        const pkg = this._suiMaster.addPackage({id: packageId});
        await pkg.isOnChain();

        const paginated = await pkg.modules.condenser.getOwnedObjects({
            typeName: 'AdminCap',
        });
        const ret = [];
        await paginated.forEach(async (suiObject)=>{
            const condenserId = suiObject.fields.condenser_id;
            const condenser = new (this._suiMaster.SuiObject)({ id: condenserId, suiMaster: this._suiMaster });
            await condenser.fetchFields();
            // @todo: fetch them in bulk
            ret.push(condenser);
        });

        return ret;
    }

    async makeCondenser(params = {}) {
        const type_s = params.type_s;
        const type_r = params.type_r;
        const flow_interval = params.flow_interval;
        const flow_amount = ''+params.flow_amount;
        const max_lock_time = params.max_lock_time;

        const packageId = this.config().packageId;
        const pkg = this._suiMaster.addPackage({id: packageId});
        await pkg.isOnChain();

        const coinS = this._suiMaster.suiCoins.get(type_s);
        await coinS.getMetadata();
        
        const coinR = this._suiMaster.suiCoins.get(type_r);
        await coinR.getMetadata();
        
        const flowAmountNormalized = coinR.normalizeAmount(flow_amount.indexOf('.') == -1 ? (flow_amount + '.0') : flow_amount );

        const args = [
            pkg.arg('u64', flowAmountNormalized), // flow_amount
            pkg.arg('u64', flow_interval), // flow_interval
            pkg.arg('u64', max_lock_time), // max_lock_time
            this.config().CLOCK, // clock
        ];

        const types = [
            type_s,
            type_r,
        ];

        await pkg.modules.condenser.moveCall('mint_condenser', args, types);
    }


    async attachKettleToCondenser(kettleId, condenserId) {
        const packageId = this.config().packageId;
        // const sbuckType = this.config().bucket.sBUCK.split('%packageId%').join(packageId);
        // const suiType = this.config().SUI;

        const pkg = this._suiMaster.addPackage({id: packageId});
        await pkg.isOnChain();

        // admin cap
        const paginated = await pkg.modules.condenser.fetchEvents({
            eventTypeName: 'MintEvent',
        });
        let adminCapId = null;
        let type_s = null;
        let type_r = null;
        await paginated.forEach((suiEvent)=>{
            if (suiEvent.parsedJson.condenser_id == condenserId) {
                adminCapId = suiEvent.parsedJson.admin_cap_id;
                console.error('json', suiEvent.parsedJson);
                type_s =  new TextDecoder().decode(new Uint8Array(suiEvent.parsedJson.type_s)) ;
                type_r =  new TextDecoder().decode(new Uint8Array(suiEvent.parsedJson.type_r)) ;
            }
        });
        // condenser
        // kettle

        const args = [
            adminCapId,
            condenserId,
            kettleId,
        ];

        const types = [
            type_s,
            type_r,
        ];

        await pkg.modules.condenser.moveCall('attach_kettle', args, types);
    }

    async releaseKettleFromCondenser(condenserId) {
        const packageId = this.config().packageId;
        const pkg = this._suiMaster.addPackage({id: packageId});
        await pkg.isOnChain();

        // admin cap
        const paginated = await pkg.modules.condenser.fetchEvents({
            eventTypeName: 'MintEvent',
        });
        let adminCapId = null;
        let type_s = null;
        let type_r = null;
        await paginated.forEach((suiEvent)=>{
            if (suiEvent.parsedJson.condenser_id == condenserId) {
                adminCapId = suiEvent.parsedJson.admin_cap_id;
                console.error('json', suiEvent.parsedJson);
                type_s =  new TextDecoder().decode(new Uint8Array(suiEvent.parsedJson.type_s)) ;
                type_r =  new TextDecoder().decode(new Uint8Array(suiEvent.parsedJson.type_r)) ;
            }
        });

        const args = [
            adminCapId,
            condenserId,
        ];

        const types = [
            type_s,
            type_r,
        ];

        await pkg.modules.condenser.moveCall('release_kettle', args, types);
    }

    async supplyCondenser(condenserId, amount) {
        const packageId = this.config().packageId;
        const pkg = this._suiMaster.addPackage({id: packageId});
        await pkg.isOnChain();

        // admin cap
        const paginated = await pkg.modules.condenser.fetchEvents({
            eventTypeName: 'MintEvent',
        });
        let adminCapId = null;
        let type_s = null;
        let type_r = null;
        await paginated.forEach((suiEvent)=>{
            if (suiEvent.parsedJson.condenser_id == condenserId) {
                adminCapId = suiEvent.parsedJson.admin_cap_id;
                console.error('json', suiEvent.parsedJson);
                type_s =  new TextDecoder().decode(new Uint8Array(suiEvent.parsedJson.type_s)) ;
                type_r =  new TextDecoder().decode(new Uint8Array(suiEvent.parsedJson.type_r)) ;
            }
        });

        const args = [
            this.config().CLOCK, // clock
            condenserId,
            { type: ''+type_r, amount: amount },
        ];

        const types = [
            type_s,
            type_r,
        ];

        await pkg.modules.condenser.moveCall('supply_coin', args, types);
    }


    async stake(params = {}) {
        const packageId = this.config().packageId;

        const coinType = this.config().bucket.sBUCK.split('%packageId%').join(packageId);
        const amount = '1.0';
        const condenserId = params.condenserId;
        const stakeFor = 1*24*60*60*1000;

        const encryptor = new TimeCapsuleEncryptor();
        const forRound = encryptor.roundAt( (new Date()).getTime() + stakeFor );

        const timecapsulePackageId = this.config().timecapsule.packageId.split('%packageId%').join(packageId);

        const pkg = this._suiMaster.addPackage({id: timecapsulePackageId});
        await pkg.isOnChain();

        const condenserPackage = this._suiMaster.addPackage({id: packageId});
        await condenserPackage.isOnChain();

        // find timecapsule store
        const paginated = await pkg.modules.timecapsule.fetchEvents({
            eventTypeName: 'NewStoreEvent',
        });
        let timecapsuleStoreId = null;
        await paginated.forEach((suiEvent)=>{
            timecapsuleStoreId = suiEvent.parsedJson.id;
        });

        // alert(timecapsuleStoreId);
        const messageEncrypted = new Uint8Array([2,2]);
        const messageEncryptedBCS = bcs.vector(bcs.u8()).serialize(messageEncrypted).toBytes();


        // const args = [
        //     timecapsuleStoreId,
        //     messageEncryptedBCS,
        //     pkg.arg('u64', forRound), // forRound
        //     {type: 'SUI', amount: '1.0'},
        // ];
        const types = [];

        const Transaction = (this._suiMaster.Transaction);
        const tx = new Transaction();
        const suiCoin = await this._suiMaster.suiCoins.get('SUI');
        const txCoinToSend = await suiCoin.coinOfAmountToTxCoin(tx, this._suiMaster.address, '1.0');

        const args = [
            tx.object(timecapsuleStoreId),
            tx.pure('vector<u8>', messageEncrypted),
            tx.pure('u64', forRound),
            txCoinToSend,
        ];

        const moveCallResult = tx.moveCall({
            target: `${timecapsulePackageId}::timecapsule::mint_with_sui_no_entry`,
            arguments: args,
        });

        const stakeCoin = await this._suiMaster.suiCoins.get(coinType);
        const txStakeCoinToSend = await stakeCoin.coinOfAmountToTxCoin(tx, this._suiMaster.address, amount);


        const moveCallResultPutCoin = tx.moveCall({
            target: `${timecapsulePackageId}::timecapsule::put_coin_to_bag`,
            arguments: [
                tx.object(timecapsuleStoreId),
                moveCallResult,
                txStakeCoinToSend,                
            ],
            typeArguments: [coinType]
        });

        // condenser
        const paginated2 = await condenserPackage.modules.condenser.fetchEvents({
            eventTypeName: 'MintEvent',
        });
        // let adminCapId = null;
        let type_s = null;
        let type_r = null;
        await paginated2.forEach((suiEvent)=>{
            if (suiEvent.parsedJson.condenser_id == condenserId) {
                // adminCapId = suiEvent.parsedJson.admin_cap_id;
                // console.error('json', suiEvent.parsedJson);
                type_s =  new TextDecoder().decode(new Uint8Array(suiEvent.parsedJson.type_s)) ;
                type_r =  new TextDecoder().decode(new Uint8Array(suiEvent.parsedJson.type_r)) ;
            }
        });

        // clock: &Clock,
        // condenser: &mut Condenser<S, R>,
        // time_capsule_ref: &timecapsule::Timecapsule,

        const moveCallResultStake = tx.moveCall({
            target: `${packageId}::condenser::stake`,
            arguments: [
                tx.object(this.config().CLOCK),
                tx.object(condenserId),
                moveCallResult,                
            ],
            typeArguments: [type_s, type_r]
        });

        // public entry fun put_coin_to_bag<T>(store: &mut TimecapsuleStore, timecapsule: &mut Timecapsule, mut coin:  Coin<T>, ctx: &mut TxContext) {

        tx.transferObjects([moveCallResult], this._suiMaster.address);

        await pkg.modules.timecapsule.moveCall('mint_with_sui_no_entry', {tx: tx}, types);


        //encrypted_prophecy

        // const args = [
        //     pkg.arg('u64', 1000000000), // flow_amount
        //     pkg.arg('u64', (24 * 60 * 60 * 1000)), // flow_interval
        //     pkg.arg('u64', 1), // min_lock_time
        //     pkg.arg('u64', (48 * 60 * 60 * 1000)), // max_lock_time
        //     pkg.arg('u64', 0), // start_time
        //     pkg.arg('bool', true), // with_admin_cap
        // ];

        // const types = [
        //     sbuckType,
        //     suiType,
        // ];

        // await pkg.modules.fountain_periphery.moveCall('create_fountain', args, types);
    }

    async getOwnedTimecapsulesIds() {
        const packageId = this.config().packageId;
        const timecapsulePackageId = this.config().timecapsule.packageId.split('%packageId%').join(packageId);

        const pkg = this._suiMaster.addPackage({id: timecapsulePackageId});
        await pkg.isOnChain();

        const paginated = await pkg.modules.timecapsule.getOwnedObjects({ typeName: 'Timecapsule' });
        const ret = [];
        await paginated.forEach((suiObject)=>{ ret.push(suiObject.id); });

        console.error('owned capsules', ret);

        return ret;
    }

    async boilCondenser(condenserId) {
        const packageId = this.config().packageId;

        const sbuckType = this.config().bucket.sBUCK.split('%packageId%').join(packageId);

        const condenserPackage = this._suiMaster.addPackage({id: packageId});
        await condenserPackage.isOnChain();

        const paginated2 = await condenserPackage.modules.condenser.fetchEvents({
            eventTypeName: 'MintEvent',
        });
        let type_s = null;
        let type_r = null;
        const type_t = sbuckType;
        await paginated2.forEach((suiEvent)=>{
            if (suiEvent.parsedJson.condenser_id == condenserId) {
                type_s =  new TextDecoder().decode(new Uint8Array(suiEvent.parsedJson.type_s)) ;
                type_r =  new TextDecoder().decode(new Uint8Array(suiEvent.parsedJson.type_r)) ;
            }
        });

        const args = [
            condenserId,
            this.config().CLOCK, // clock
            '0x06649c8d6a20f97b1079cc34e03ec424d7d961480b5a7bf5ec167647f5a29998',
        ];

        const types = [
            type_s,
            type_r,
            type_t,
        ];

        await condenserPackage.modules.condenser.moveCall('boil_kettle_with_fountain', args, types);

    }

    async claim(params = {}) {
        const condenserId = params.condenserId;
        const timecapsuleId = params.timecapsuleId;

        const packageId = this.config().packageId;
        const condenserPackage = this._suiMaster.addPackage({id: packageId});
        await condenserPackage.isOnChain();

        const paginated2 = await condenserPackage.modules.condenser.fetchEvents({
            eventTypeName: 'MintEvent',
        });
        let type_s = null;
        let type_r = null;
        await paginated2.forEach((suiEvent)=>{
            if (suiEvent.parsedJson.condenser_id == condenserId) {
                type_s =  new TextDecoder().decode(new Uint8Array(suiEvent.parsedJson.type_s)) ;
                type_r =  new TextDecoder().decode(new Uint8Array(suiEvent.parsedJson.type_r)) ;
            }
        });

        const Transaction = (this._suiMaster.Transaction);
        const tx = new Transaction();

        alert(condenserId);
        alert(timecapsuleId);
        alert(type_s);
        alert(type_r);

        const moveCall = tx.moveCall({
            target: `${packageId}::condenser::claim`,
            arguments: [
                tx.object(this.config().CLOCK),
                tx.object(condenserId),
                tx.object(timecapsuleId),
            ],
            typeArguments: [type_s, type_r],
        });

        const coin = tx.moveCall({
            target: `0x0000000000000000000000000000000000000000000000000000000000000002::coin::from_balance`,
            arguments: [moveCall],
            typeArguments: [type_r],
        });

        tx.transferObjects([coin], this._suiMaster.address);

        await condenserPackage.modules.condenser.moveCall('claim', {tx: tx});
    }

    async getExpectedRewardForCapsule(params = {}) {
        const condenserId = params.condenserId;
        const timecapsuleId = params.timecapsuleId;

        const packageId = this.config().packageId;
        const condenserPackage = this._suiMaster.addPackage({id: packageId});
        await condenserPackage.isOnChain();

        const Transaction = (this._suiMaster.Transaction);
        const tx = new Transaction();

        // const args = [
        //     tx.object(timecapsuleStoreId),
        //     tx.pure('vector<u8>', messageEncrypted),
        //     tx.pure('u64', forRound),
        //     txCoinToSend,
        // ];

        const curTime = (new Date()).getTime();

        const paginated2 = await condenserPackage.modules.condenser.fetchEvents({
            eventTypeName: 'MintEvent',
        });
        let type_s = null;
        let type_r = null;
        await paginated2.forEach((suiEvent)=>{
            if (suiEvent.parsedJson.condenser_id == condenserId) {
                type_s =  new TextDecoder().decode(new Uint8Array(suiEvent.parsedJson.type_s)) ;
                type_r =  new TextDecoder().decode(new Uint8Array(suiEvent.parsedJson.type_r)) ;
            }
        });

        const moveCall = tx.moveCall({
            target: `${packageId}::condenser::get_reward_info`,
            arguments: [
                tx.object(condenserId),
                tx.object(timecapsuleId),
                tx.pure('u64', curTime),     
            ],
            typeArguments: [type_s, type_r],
        });

        // public fun get_reward_amount<S, R>(
        //     condenser: &Condenser<S, R>,
        //     time_capsule_key: address,
        //     current_time: u64,
        // ): u64 {

        const sims = await this._suiMaster.client.devInspectTransactionBlock({
            transactionBlock: tx,
            sender: this._suiMaster.address,
        });

        if (sims && sims.results && sims.results[0] && sims.results[0].returnValues && sims.results[0].returnValues[0]  && sims.results[0].returnValues[0][0]) {
            const b = sims.results[0].returnValues[0][0];
            const v = bcs.u64().parse(new Uint8Array(b));
            console.error('sims.results ', sims.results);

            return {
                rewards: bcs.u64().parse(new Uint8Array(sims.results[0].returnValues[0][0])),
                rewardsPerMinute: bcs.u64().parse(new Uint8Array(sims.results[0].returnValues[1][0])),
                stakeWeight: bcs.u64().parse(new Uint8Array(sims.results[0].returnValues[2][0])),
                stakeAmount: bcs.u64().parse(new Uint8Array(sims.results[0].returnValues[3][0])),
                lockUntil: bcs.u64().parse(new Uint8Array(sims.results[0].returnValues[4][0])),
            };

            return v;
        }

        return 0;
    }
}
