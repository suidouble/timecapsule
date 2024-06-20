/* global BigInt */
import TimeCapsuleEncryptor from '../classes/TimeCapsuleEncryptor';
import DrandRounds from '../classes/DrandRounds';
import BuckStaker from './BuckStaker';

export default class TimeCapsule {
    constructor(params = {}) {
        this.id = params.id;
        this._suiObject = params.suiObject || null;
        this._store = params.store;

        this._timeCapsuleEncryptor = new TimeCapsuleEncryptor();

        this._stakeProofs = [];
        this._stakeProofsIds = {};
    }


    get is404() {
        if (!this.forRound) {
            return true;
        }

        return false;
    }

    get level() {
        if (this._suiObject && this._suiObject.fields && this._suiObject.fields.level) {
            return this._suiObject.fields.level;
        }
        return 0;        
    }

    get contentSuiAmount() {
        if (this._suiObject && this._suiObject.fields && this._suiObject.fields.sui) {
            return this._suiObject.fields.sui;
        }
        return null;

    }

    get ownedByYou() {
        if (!this.ownerAddress) {
            return false;
        }
        const connectedAddress = this.suiMaster.address;
        if (connectedAddress && connectedAddress == this.ownerAddress) {
            return true;
        }

        return false;
    }

    get suiMaster() {
        return this._store.suiMaster;
    }

    get contract() {
        return this._store.timeCapsuleContract;
    }

    get displayId() {
        const id = ''+this._suiObject.id;
        const id_length = id.length;
        return id.substring(0,4) + '..' + id.substring(id_length-3);
    }

    get longDisplayId() {
        const id = ''+this._suiObject.id;
        const id_length = id.length;
        return id.substring(0,8) + '..' + id.substring(id_length-10);
    }

    get urlOnExplorer() {
        return 'https://'+(this.suiMaster.connectedChain).split('sui:').join('').split('mainnet').join('www')+'.suivision.xyz/object/'+this.id+'?tab=Fields';
    }

    get ownerUrlOnExplorer() {
        return 'https://'+(this.suiMaster.connectedChain).split('sui:').join('')+'.suivision.xyz/account/'+this.ownerAddress+'?tab=NFT';
    }

    get ownerAddress() {
        if (this._suiObject && this._suiObject._owner && this._suiObject._owner.AddressOwner) {
            return this._suiObject._owner.AddressOwner;
        }

        return null;
    }

    get longDisplayOwnerAddress() {
        const id = ''+this.ownerAddress;
        const id_length = id.length;
        return id.substring(0,8) + '..' + id.substring(id_length-10);
    }

    async fetch() {
        const SuiObject = this.suiMaster.SuiObject;
        const obj = new SuiObject({
            suiMaster: this.suiMaster,
            id: this.id,
        });

        // await this.suiMaster.objectStorage.push(obj);
        // await this.suiMaster.objectStorage.fetchObjects();

        this._suiObject = obj;

        await this.refresh();
    }

    async refresh() {
        this._stakeProofs = [];
        this._stakeProofsIds = {};

        await this.suiMaster.objectStorage.push(this._suiObject);
        await this.suiMaster.objectStorage.fetchObjects();

        try {
            // get Buck's StakedProof objects in timecapsule Bag
            const SuiObject = this.suiMaster.SuiObject;
            const bagId = this._suiObject.fields.object_bag.fields.id.id;
    
            const objectBag = new SuiObject({id: bagId, suiMaster: this.suiMaster});
            const objectBagFields = await objectBag.getDynamicFields();
    
            await objectBagFields.forEach(async(field)=>{
                if (field) {
                    if (field.name && field.name.value) {
                        if (field.name.value.indexOf('StakeProof') !== -1) {
                            const obj = new SuiObject({id: field.objectId, suiMaster: this.suiMaster});
                            if (!this._stakeProofsIds[obj.id]) {
                                await obj.fetchFields();
                                this._stakeProofs.push(obj);
                                this._stakeProofsIds[obj.id] = true;
                            }
                        }
                    }
                }
            });
        } catch (e) {
            console.error(e);
        }

        return true;
    }

    async getExpectedStakedRewards() {
        const buckStaker = new BuckStaker({suiMaster: this.suiMaster});
        const fountain = await buckStaker.getFountain();
        let rewards = BigInt(0);

        for (const stakeProof of this._stakeProofs) {
            rewards = rewards + buckStaker.calculateRewardsOfStakeProof(fountain, stakeProof);
        }

        const coin = await this.suiMaster.suiCoins.get('sui');
        await coin.getMetadata();
        return coin.amountToString(rewards);
    }

    async decrypt() {
        const drandRounds = new DrandRounds();
        const roundSignature = await drandRounds.getSignature(this.forRound);
        const roundSignatureAsArray = this._timeCapsuleEncryptor.hexStringToUint8Array(roundSignature);
        const decrypted = await this.contract.decrypt({
            timeCapsuleId: this.id,
            roundSignature: roundSignatureAsArray,
        });

        if (decrypted) {
            await new Promise((res)=>setTimeout(res, 5000));
            await this.refresh();

            return true;
        }

        return false;
    }


    get displayReadyTimer() {
        const timeNow = (new Date()).getTime();
        const readyAt = this.mayBeDecryptedAt;
        const diff = readyAt-timeNow;

        if (diff < 0) {
            return 'ready';
        }

        let hours = Math.floor( diff / (60*60*1000) );
        let minutes = Math.floor ( (diff % (60*60*1000)) / (60*1000) );
        let seconds = Math.floor ( (diff % (60*1000)) / (1000) ); 
        
        return ''+(''+hours).padStart(2, '0')+':'+(''+minutes).padStart(2, '0')+':'+(''+seconds).padStart(2, '0');
    }

    get decrypted() {
        if (this._suiObject && this._suiObject.fields && this._suiObject.fields.decrypted) {
            return true;
        }
        return false;
    }

    get prophecy() {
        if (this.decrypted && this._suiObject.fields && this._suiObject.fields.prophecy) {
            // console.error(this._suiObject.fields.prophecy);
            // return String.fromCharCode.apply(null, this._suiObject.fields.prophecy);
            // return new TextDecoder().decode(new Uint8Array(this._suiObject.fields.prophecy));

            return this._suiObject.fields.prophecy;
        }

        return null;
    }

    get forRound() {
        if (this._suiObject && this._suiObject.fields && this._suiObject.fields.for_round) {
            return this._suiObject.fields.for_round;
        }
        return null;
    }

    get urlOfRoundAPI() {
        const drandRounds = new DrandRounds();
        return drandRounds.urlOfRoundAPI(this.forRound);
    }

    get mayBeDecryptedAt() {
        return this._timeCapsuleEncryptor.roundTime(this.forRound);
    }

    get mayBeDecryptedAtAsDate() {
        return new Date( this._timeCapsuleEncryptor.roundTime(this.forRound) );
    }


    get readyToBeDecrypted() {
        const timeNow = (new Date()).getTime();
        if (timeNow > this.mayBeDecryptedAt) {
            return true;
        }
        return false;
    }

// decrypted
// : 
// false
// encrypted_prophecy
// : 
// (398) [48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 99, 54, 48, 48, 48, 48, 48, 48, 98, 99, 48, 49, 48, 48, 51, 55, 48, 48, 48, 48, 48, 48, 50, 57, 48, 48, 48, 48, 48, 48, 50, 48, 49, 99, 49, 56, 97, 98, 54, 53, 97, 57, 98, 49, 49, 50, 54, 53, 101, 48, 51, 55, 101, 53, 48, 55, 99, 50, 52, 52, 51, 51, 101, 51, 52, 57, 101, 100, 54, 56, 48, 50, 56, 52, 100, 57, 53, 97, 56, 100, 97, 48, 51, 53, 98, 57, 102, 56, 54, 97, …]
// for_round
// : 
// "7960311"
// metadata
// : 
// []
// object_bag
// : 
// {type: '0x2::object_bag::ObjectBag', fields: {…}}
// prophecy
// : 
// []
// sui
// : 
// "100000000"

    async getStoredBuckAmount() {
        if (this.contract && this.contract.tokens && this.contract.tokens.buck) {
            return await this.getStoredCoinAmount({ coinType: this.contract.tokens.buck });
        }
    }

    async getStoredFUDAmount() {
        if (this.contract && this.contract.tokens && this.contract.tokens.fud) {
            return await this.getStoredCoinAmount({ coinType: this.contract.tokens.fud });
        }
    }


    async getStakedBuckAmount() {
        const SuiObject = this.suiMaster.SuiObject;
        const bagId = this._suiObject.fields.object_bag.fields.id.id;

        const objectBag = new SuiObject({id: bagId, suiMaster: this.suiMaster});
        const objectBagFields = await objectBag.getDynamicFields();

        let amount = BigInt(0);
        await objectBagFields.forEach(async(field)=>{
            if (field) {
                if (field.name && field.name.value) {
                    if (field.name.value.indexOf('StakeProof') !== -1) {
                        const obj = new SuiObject({id: field.objectId, suiMaster: this.suiMaster});
                        await obj.fetchFields();

                        this._stakeProofs.push(obj);

                        amount = amount + BigInt(obj.fields.stake_amount);
                    }
                }
            }
        });

        const coin = await this.suiMaster.suiCoins.get('0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2::buck::BUCK');
        await coin.getMetadata();
        return coin.amountToString(amount);
    }

    async getStoredCoinAmount(params = {}) {
        
        // console.log(params);
        const coinType = params.coinType;// '0xc797288b493acb9c18bd9e533568d0d88754ff617ecc6cc184d4a66bce428bdc::suidouble_liquid_coin::SUIDOUBLE_LIQUID_COIN';
        const coin = await this.suiMaster.suiCoins.get(coinType);
        await coin.getMetadata();

        const SuiObject = this.suiMaster.SuiObject;
        const bagId = this._suiObject.fields.object_bag.fields.id.id;

        const objectBag = new SuiObject({id: bagId, suiMaster: this.suiMaster});
        const objectBagFields = await objectBag.getDynamicFields();

        let amount = 0;
        await objectBagFields.forEach(async(field)=>{
            if (field) {
                if (field.name && field.name.value) {
                    if (field.name.value == coinType ||
                        field.name.value == coinType.split('0x').join('')) {
                            const obj = new SuiObject({id: field.objectId, suiMaster: this.suiMaster});
                            await obj.fetchFields();
                            console.error(obj);
                            console.error(coin.amountToString(obj.fields.balance));

                            amount = coin.amountToString(obj.fields.balance);
                        }
                }
            }

            console.error(field);
        });

        return amount;
    }
}

