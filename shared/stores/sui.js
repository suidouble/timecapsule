import { defineStore } from 'pinia';
import TimeCapsuleEncryptor from '../classes/TimeCapsuleEncryptor';
import DrandRounds from '../classes/DrandRounds';
import TimeCapsuleContract from '../classes/TimeCapsuleContract';
import TimeCapsule from '../classes/TimeCapsule';

import Log from 'shared/classes/Log.js';
import coins from 'shared/classes/coins.js';

export const useSuiStore = defineStore('sui', {
	// convert to a function
	state: () => ({
		address: null,
        connectedChain: null,
        suiMaster: null,

		drandRound: null,
		drandEncryptor: null,

		timeCapsuleContract: null,

		amount_sui: 0,
		amount_sui_string: '-1',
		amount_sui_loading: true,
		amount_sui_time: null,
		amount_sui_timeout: 10000,
	}),
	getters: {
		connectionId: function(){ // using this to watch
			return ''+this.address+'_'+this.connectedChain;
		},
	},
	actions: {
		async timeCapsuleById(id) {
			if (!this.suiMaster) {
				return null;
			}
			
			const timecapsule = new TimeCapsule({
				id: id,
				store: this,
				suiMaster: this.suiMaster,
				contract: this.timeCapsuleContract,
			});
			await timecapsule.fetch();

			return timecapsule;
		},
		async getSuiBalance() {
			if (this.amount_sui_time && this.amount_sui) {
				const now = (new Date()).getTime();
				if ((now - this.amount_sui_time) < this.amount_sui_timeout) {
					return this.amount_sui;
				}
			}

			Log.tag('$store.sui').info('getting current SUI balance');

			this.amount_sui_loading = true;
			try {
				const balance = await this.suiMaster.getBalance('sui');
				this.amount_sui = balance;
				this.amount_sui_string = await this.amountToString(this.amount_sui);

				Log.tag('$store.sui').info('current SUI balance is', this.amount_sui_string);

				// alert(balance);
			} catch(e) {
				console.error(e);
			}
			this.amount_sui_loading = false;
			this.amount_sui_time = (new Date()).getTime();

			return this.amount_sui;
		},
		getDrandRounds() {
			const drandRounds = new DrandRounds();
			return drandRounds;
		},
		getTimeCapsuleEncryptor() {
			if (this.drandEncryptor) {
				return this.drandEncryptor;
			}

			if (this.__drandInterval) {
				clearInterval(this.__drandInterval);
			}

			const encryptor = new TimeCapsuleEncryptor();
			this.drandEncryptor = encryptor;

			this.__drandInterval = setInterval(()=>{
				this.drandRound = encryptor.roundAt((new Date()).getTime());
			}, 1000);

			return encryptor;
		},
		urlToExplorer(params = {}) {
			const id = params.id;
			const type = params.type || 'object';

			const chainString = (''+this.connectedChain).split('sui:').join('');

			if (chainString == 'localnet') {
				return 'https://explorer.polymedia.app/object/'+id+'?network=local'
			}

			return 'https://suiscan.xyz/'+chainString+'/'+type+'/'+id;
		},
		async request() {
			Log.tag('$store.sui').info('sui connection requested');

			if (this.suiMaster && this.suiMaster.address) {
				return true;
			}

			if (!this.__requestConnectionPromise) {
				this.__requestConnectionPromiseResolver = null;
				this.__requestConnectionPromise = new Promise((res)=>{
					this.__requestConnectionPromiseResolver = res;
				});
			}

			await this.__requestConnectionPromise;
			this.__requestConnectionPromise = null;
			this.__requestConnectionPromiseResolver = null;

			return true;
		},
		attachCoins(suiMaster) {
			for (const coinType in coins) {
				const coin = suiMaster.suiCoins.get(coinType);
				coin._metadata = coins[coinType];
			}
		},
		setSuiMaster(suiMaster) {
			clearTimeout(this.__setSuiMasterTimeout);

			let thisTimeoutMs = 800;
			if (suiMaster.address) {
				thisTimeoutMs = 100;
			}

			this.__setSuiMasterTimeout = setTimeout(()=>{
				this.attachCoins(suiMaster);
				
				this.suiMaster = suiMaster;
				if (suiMaster.address) {
					Log.tag('$store.sui').info('your address', suiMaster.address);
					this.address = suiMaster.address;
				} else {
					this.address = null;
				}
				if (suiMaster.connectedChain) {
					
					Log.tag('$store.sui').info('got suiMaster connected to ', suiMaster.connectedChain);
					this.connectedChain = suiMaster.connectedChain;
					this.timeCapsuleContract = new TimeCapsuleContract({
						chain: ''+this.connectedChain,
						suiMaster: suiMaster,
					});
					this.getSuiBalance()
						.then(()=>{
							// all is ready
							if (this.__requestConnectionPromiseResolver) {
								this.__requestConnectionPromiseResolver();
							}
						});
					this.drandEncryptor = null;
					this.getTimeCapsuleEncryptor();
				} else {
					Log.tag('$store.sui').info('suiMaster unset');
					this.connectedChain = null;
					this.timeCapsuleContract = null;
				}
			}, thisTimeoutMs);
		},
		async amountToString(amount) {
			const suiCoin = this.suiMaster.suiCoins.get('sui');
			await suiCoin.getMetadata();

			return suiCoin.amountToString(amount);
		}
	},
});