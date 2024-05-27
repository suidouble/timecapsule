
export default class DrandRounds {
    constructor() {
        this._chainHash = '52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971';
    }

    urlOfRoundAPI(round) {
        return "https://api.drand.sh/"+this._chainHash+"/public/"+round;
    }

    async getSignature(round) {
        try {
            const response = await fetch(this.urlOfRoundAPI(round));
            const data = await response.json();
            if (data && data.signature) {
                return data.signature;
            }
        } catch (e) {
            return null;
        }
    }
}

