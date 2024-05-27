import Log from 'shared/classes/Log.js';
// import TimeCapsuleEncryptor from 'shared/classes/TimeCapsule';
import TimeCapsule from './TimeCapsule';

export default class TimeCapsuleContract {
    constructor(params = {}) {
        this._chain = params.chain || 'sui:testnet';
        this._suiMaster = params.suiMaster || null;
        this._packageId = null;
        this._module = null;
        this._storeId = null;
        this._log = params.log || null;

        if (!this._packageId && this._chain == 'sui:testnet') {
            this._packageId = '0x0e0eee4f5f47c162a7eb2fc4edd7e9ade611ddd80ee004bd77fd1f04067e16ec';
        }
        
        Log.tag('TimeCapsuleContract').info('chain', this._chain, 'packageId', this._packageId);

        this._moduleName = 'timecapsule';

        this.initPackage();

        this._timeCapsules = [];
        this._timeCapsulesIds = {};
        this._hasMoreTimeCapsules = true;
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

    async decrypt(params = {}) {
        const timeCapsuleId = params.timeCapsuleId;
        const roundSignature = params.roundSignature;

        try {
            const params = [timeCapsuleId, String.fromCharCode.apply(null, roundSignature)];
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

    async putCoin(params = {}) {
        const timeCapsuleId = params.timeCapsuleId;

        try {
            const params = [timeCapsuleId, {type: 'SUI', amount: '0.02'}];
            Log.tag('TimeCapsuleContract').info('goint to put coin into time capsule: ', params);
            // @todo we'd better check messageEncrypted here somehow
            const res = await this._module.moveCall('put_coin_to_bag', params);
            // const res = await this._module.moveCall('mint', [this._storeId, treasury.id, {type: 'SUI', amount: '10.0'}]);
            if (res && res.status && res.status == 'success') {
                return true;
            }

        } catch (e) {
            return false;
        }

        return false;

    }

    async mint(params = {}) {
        const messageEncrypted = params.messageEncrypted;
        const targetDrandRound = params.targetDrandRound;
        const sui = params.sui;

        if (targetDrandRound < 1) {
            return false;
        }

        try {
            const mintParams = [this._storeId, String.fromCharCode.apply(null, messageEncrypted), targetDrandRound];
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
