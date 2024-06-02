import Log from 'shared/classes/Log.js';
// import TimeCapsuleEncryptor from 'shared/classes/TimeCapsule';
import TimeCapsule from './TimeCapsule';
import { bcs } from '@mysten/bcs';

export default class TimeCapsuleContract {
    constructor(params = {}) {
        this._chain = params.chain || 'sui:testnet';
        this._suiMaster = params.suiMaster || null;
        this._packageId = null;
        this._module = null;
        this._storeId = null;
        this._log = params.log || null;

        this._tokens = {};

        const chains = {
            'testnet': {
                packageId: '0x5642b6ead93e220b692fbae8be0e865c36ec0d06287d6319889757dc58c25448',
                tokens: {
                    fud: '0xc797288b493acb9c18bd9e533568d0d88754ff617ecc6cc184d4a66bce428bdc::suidouble_liquid_coin::SUIDOUBLE_LIQUID_COIN',
                    buck: '0xc797288b493acb9c18bd9e533568d0d88754ff617ecc6cc184d4a66bce428bdc::suidouble_liquid_coin::SUIDOUBLE_LIQUID_COIN',
                },
            },
            'mainnet': {
                packageId: '0x020abcd433df2c68f62b794d0751d3a839945dcb6776ecf9fac76d3f0324a274',
                tokens: {
                    fud: '0x76cb819b01abed502bee8a702b4c2d547532c12f25001c9dea795a5e631c26f1::fud::FUD',
                    buck: '0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2::buck::BUCK',
                },
            },
        };

        const chainName = (this._chain).split('sui:').join('');
        if (chains[chainName]) {
            this._packageId = chains[chainName].packageId;
            this._tokens = chains[chainName].tokens;
        }
        
        Log.tag('TimeCapsuleContract').info('chain', this._chain, 'packageId', this._packageId, 'tokens', this._tokens);

        this._moduleName = 'timecapsule';

        this.initPackage();

        this._timeCapsules = [];
        this._timeCapsulesIds = {};
        this._hasMoreTimeCapsules = true;
    }

    get tokens() {
        return this._tokens;
    }

    get suiMaster() {
        return this._suiMaster;
    }

    get contract() {
        return this;
    }

    get timeCapsules() {
        return this._timeCapsules;
    }

    async getMoreTimeCapsules() {
        if (!this._module) {
            return false;
        }

        try {
            Log.tag('TimeCapsuleContract').info('querying Timecapsule objects...');
    
            const paginatedResponseOwned = await this._module.getOwnedObjects({ typeName: 'Timecapsule' });
            let foundCount = 0;
            let addedCount = 0;
            await paginatedResponseOwned.forEach(async (item)=>{
                foundCount++;
    
                if (!this._timeCapsulesIds[item.id]) {
                    addedCount++;
                    const timeCapsule = new TimeCapsule({suiObject: item, id: item.id, store: this });
                    this._timeCapsulesIds[item.id] = timeCapsule;
                    this._timeCapsules.push(timeCapsule);
                }
            }, 50);
            Log.tag('TimeCapsuleContract').info('Timecapsule objects, found: '+foundCount+', added: '+addedCount);

        } catch (e) {
            Log.tag('TimeCapsuleContract').error(e);

        }



        const paginatedResponseEvents = await this._module.fetchEvents({eventTypeName: 'NewTimecapsuleEvent', order: 'descending'});
        const additionalObjects = [];
        await paginatedResponseEvents.forEach(async (suiEvent)=>{
            const objectId = suiEvent.parsedJson.id;
            if (!this._timeCapsulesIds[objectId]) {
                const obj = new (this.suiMaster.SuiObject)({
                    suiMaster: this.suiMaster,
                    id: objectId,
                });
                additionalObjects.push(obj);
                await this.suiMaster.objectStorage.push(obj);
            }
    
            Log.tag('TimeCapsuleContract').info(suiEvent);
        }, 50);
    
        await this.suiMaster.objectStorage.fetchObjects();

        for (const obj of additionalObjects) {
            if (!this._timeCapsulesIds[obj.id]) {
                const timeCapsule = new TimeCapsule({suiObject: obj, id: obj.id, store: this });
                this._timeCapsulesIds[obj.id] = timeCapsule;
                this._timeCapsules.push(timeCapsule);
            }

        }


        this._timeCapsules.sort((a, b) => {
            if (a.ownedByYou < b.ownedByYou) {
              return 1;
            }
            if (a.ownedByYou > b.ownedByYou) {
              return -1;
            }
            // If property1 is equal, then compare property2
            if (a.forRound < b.forRound) {
              return 1;
            } else {
                return -1;
            }
          });

        // this._timeCapsules = this._timeCapsules.sort((a,b) => (a.forRound > b.forRound) ? -1 : 1);
    }

    async initPackage() {
        if (!this._packageId) {
            return false;
        }

        const addedPackage = this._suiMaster.addPackage({
            id: this._packageId,
        });
        const mod = await addedPackage.getModule(this._moduleName);
        this._module = mod;
        if (!this._storeId) {
            await this.findStore();
        }

        mod.pushObject(this._storeId);
        await this._suiMaster.objectStorage.fetchObjects();

        Log.tag('TimeCapsuleContract').info('store', this._storeId);

        this.getMoreTimeCapsules();
    }

    async findStore() {
        const eventsResponse = await this._module.fetchEvents({eventTypeName: 'NewStoreEvent', order: 'descending'});
        if (eventsResponse && eventsResponse.data && eventsResponse.data[0]) {
            const suiEvent = eventsResponse.data[0];
            this._storeId = suiEvent.parsedJson.id;

            return this._storeId;
        }

        return null;
    }

    async collectFees() {
        // find if you own AdminCap
        Log.tag('TimeCapsuleContract').info('querying AdminCap objects...');
        const paginatedResponseOwned = await this._module.getOwnedObjects({ typeName: 'AdminCap' });
        let adminCapId = null;
        await paginatedResponseOwned.forEach((item)=>{
            adminCapId = item.id;
        });

        if (!adminCapId) {
            Log.tag('TimeCapsuleContract').info('Seems you do not own any AdminCap');
            return false;
        }

        const params = [this._storeId, adminCapId];
        try {
            Log.tag('TimeCapsuleContract').info('goint to call collect_fees', params);
            const res = await this._module.moveCall('collect_fees', params);
            if (res && res.status && res.status == 'success') {
                return true;
            }
        } catch (e) {
            return false;
        }

        return false;
    }

    async decrypt(params = {}) {
        const timeCapsuleId = params.timeCapsuleId;
        const roundSignature = params.roundSignature;

        try {
            const signatureBCS = bcs.vector(bcs.u8()).serialize(roundSignature).toBytes();

            const params = [this._storeId, timeCapsuleId, signatureBCS];
            Log.tag('TimeCapsuleContract').info('goint to decrypt a capsule: ', params);
            // @todo we'd better check messageEncrypted here somehow
            const res = await this._module.moveCall('decrypt', params);
            // const res = await this._module.moveCall('mint', [this._storeId, treasury.id, {type: 'SUI', amount: '10.0'}]);
            if (res && res.status && res.status == 'success') {
                return true;
            }

        } catch (e) {
            return false;
        }

        return false;
    }

    async takeOutCoin(params = {}) {
        const timeCapsuleId = params.timeCapsuleId;
        let coinType = null;
        if (params.coin == 'fud') {
            coinType = this.tokens['fud'];
        }
        if (params.coin == 'buck') {
            coinType = this.tokens['buck'];
        }
        // const coinType = '0xc797288b493acb9c18bd9e533568d0d88754ff617ecc6cc184d4a66bce428bdc::suidouble_liquid_coin::SUIDOUBLE_LIQUID_COIN';

        try {
            Log.tag('TimeCapsuleContract').info('goint to take out token from capsule');
            const TransactionBlock = this.suiMaster.TransactionBlock;
            const txBlock = new TransactionBlock();
            const callArgs = [];
            callArgs.push(txBlock.pure(this._storeId));
            callArgs.push(txBlock.pure(timeCapsuleId));

            txBlock.moveCall({
                target: `${this._module._package.address}::${this._module._moduleName}::take_out_coin`,
                arguments: callArgs,
                typeArguments: [coinType],
            });

            const res = await this._module.moveCall('take_out_coin', {tx: txBlock});
            if (res && res.status && res.status == 'success') {
                return true;
            }
        } catch (e) {
            console.error(e);

            return false;
        }
    } 

    async putCoin(params = {}) {
        const timeCapsuleId = params.timeCapsuleId;
        let coinType = params.coinType; // '0xc797288b493acb9c18bd9e533568d0d88754ff617ecc6cc184d4a66bce428bdc::suidouble_liquid_coin::SUIDOUBLE_LIQUID_COIN';
        if (params.coin == 'fud') {
            coinType = this.tokens['fud'];
        }        
        if (params.coin == 'buck') {
            coinType = this.tokens['buck'];
        }
        const amount = params.amount;
        const ownerAddress = this.suiMaster.address;

        try {
            Log.tag('TimeCapsuleContract').info('goint to put coin into time capsule');
            const TransactionBlock = this.suiMaster.TransactionBlock;
            const txBlock = new TransactionBlock();
            const callArgs = [];
            callArgs.push(txBlock.pure(this._storeId));
            callArgs.push(txBlock.pure(timeCapsuleId));

            const coin = await this._suiMaster.suiCoins.get(coinType);
            const txCoinToSend = await coin.coinOfAmountToTxCoin(txBlock, ownerAddress, amount);
            callArgs.push(txCoinToSend);

            txBlock.moveCall({
                target: `${this._module._package.address}::${this._module._moduleName}::put_coin_to_bag`,
                arguments: callArgs,
                typeArguments: [coinType],
            });

            const res = await this._module.moveCall('put_coin_to_bag', {tx: txBlock});
            if (res && res.status && res.status == 'success') {
                return true;
            }
        } catch (e) {
            console.error(e);

            return false;
        }

        return false;
    }

    // async putCoin(params = {}) {
    //     const timeCapsuleId = params.timeCapsuleId;

    //     try {
    //         const params = [timeCapsuleId, {type: 'SUI', amount: '0.02'}];
    //         Log.tag('TimeCapsuleContract').info('goint to put coin into time capsule: ', params);
    //         // @todo we'd better check messageEncrypted here somehow
    //         const res = await this._module.moveCall('put_coin_to_bag', params);
    //         // const res = await this._module.moveCall('mint', [this._storeId, treasury.id, {type: 'SUI', amount: '10.0'}]);
    //         if (res && res.status && res.status == 'success') {
    //             return true;
    //         }

    //     } catch (e) {
    //         return false;
    //     }

    //     return false;

    // }


    async mint(params = {}) {
        const messageEncrypted = params.messageEncrypted;
        const targetDrandRound = params.targetDrandRound;
        const sui = params.sui;

        const messageEncryptedBCS = bcs.vector(bcs.u8()).serialize(messageEncrypted).toBytes();

        try {
            const mintParams = [this._storeId, messageEncryptedBCS, targetDrandRound];
            let method = 'mint';
            if (sui) {
                mintParams.push({type: 'SUI', amount: sui});
                method = 'mint_with_sui';
            }

            Log.tag('TimeCapsuleContract').info('goint to execute mint method, params: ', mintParams);
            // @todo we'd better check messageEncrypted here somehow
            const res = await this._module.moveCall(method, mintParams);
            // const res = await this._module.moveCall('mint', [this._storeId, treasury.id, {type: 'SUI', amount: '10.0'}]);
            if (res && res.results && res.results.created && res.results.created[0] && res.results.created[0].id) {
                return res.results.created[0].id;
            }

        } catch (e) {
            console.error(e);

            return false;
        }

        return false;
    }
}
