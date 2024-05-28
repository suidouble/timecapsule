const argv = require('minimist')(process.argv.slice(2));

let selectedChain = argv.chain || 'local';

const settings = {
    "local": {
        "phrase": "coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin",
        "packageId": "0x5642b6ead93e220b692fbae8be0e865c36ec0d06287d6319889757dc58c25448",
        "firstVPackageId": "0x5642b6ead93e220b692fbae8be0e865c36ec0d06287d6319889757dc58c25448",
    },
    "mainnet": {
        "phrase": "", // set it as cli parameter
        "packageId": "0x020abcd433df2c68f62b794d0751d3a839945dcb6776ecf9fac76d3f0324a274",
        "firstVPackageId": "0x020abcd433df2c68f62b794d0751d3a839945dcb6776ecf9fac76d3f0324a274",
    }, 
    "testnet": {
        "phrase": "coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin",
    },
};


settings[selectedChain].chain = selectedChain;
if (argv.phrase) {
    settings[selectedChain].phrase = argv.phrase;
}

module.exports = settings[selectedChain];

// curl --location --request POST 'http://127.0.0.1:9123/gas' --header 'Content-Type: application/json' --data-raw '{"FixedAmountRequest": {"recipient": "0x9e40f545a7d69f1d59c84357a1cf33951bac6f60a9fb6b66e6669188beb4b3a7"}}'