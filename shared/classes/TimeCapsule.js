import TimeCapsuleEncryptor from '../classes/TimeCapsuleEncryptor';
import DrandRounds from '../classes/DrandRounds';

export default class TimeCapsule {
    constructor(params = {}) {
        this.id = params.id;
        this._suiObject = params.suiObject || null;
        this._store = params.store;

        this._timeCapsuleEncryptor = new TimeCapsuleEncryptor();

        console.error(this._suiObject);
    }

    get is404() {
        if (!this.forRound) {
            return true;
        }

        return false;
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
        return 'https://'+(this.suiMaster.connectedChain).split('sui:').join('')+'.suivision.xyz/object/'+this.id+'?tab=Fields';
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

    async refresh() {
        await this.suiMaster.objectStorage.push(this._suiObject);
        await this.suiMaster.objectStorage.fetchObjects();

        return true;
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
            return new TextDecoder().decode(new Uint8Array(this._suiObject.fields.prophecy));
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
    async fetch() {
        const SuiObject = this.suiMaster.SuiObject;
        const obj = new SuiObject({
            suiMaster: this.suiMaster,
            id: this.id,
        });

        await this.suiMaster.objectStorage.push(obj);
        await this.suiMaster.objectStorage.fetchObjects();

        this._suiObject = obj;
    }
}

