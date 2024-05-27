const argv = require('minimist')(process.argv.slice(2));

let selectedChain = argv.chain || 'local';

const settings = {
    "local": {
        "phrase": "coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin",
        "packageId": "",
        "firstVPackageId": "",
    },
    "mainnet": {
        "phrase": "", // set it as cli parameter
        "packageId": "",
        "firstVPackageId": "",
    }, 
    "testnet": {
        "phrase": "coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin",
        "packageId": "",
        "firstVPackageId": "",
    },
};


settings[selectedChain].chain = selectedChain;
if (argv.phrase) {
    settings[selectedChain].phrase = argv.phrase;
}

module.exports = settings[selectedChain];

// curl --location --request POST 'http://127.0.0.1:9123/gas' --header 'Content-Type: application/json' --data-raw '{"FixedAmountRequest": {"recipient": "0x9e40f545a7d69f1d59c84357a1cf33951bac6f60a9fb6b66e6669188beb4b3a7"}}'