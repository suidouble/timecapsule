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
        "adminCapId": "0xbcad83ff70a4d135ff2170490d5bd3718af9687af7da4902babac20d9f64288c",
        "storeId": "0xbd1124c2183396d47b3c7c2f286880eb4992cca624f7cd2a1dfae8bc8a6fe421",
    }, 
    "testnet": {
        "phrase": "coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin coin",
        "packageId": "0xa7b4558a20c85dc0f76f2c9f1d6fa36ff6bc7a5083c8499117e4b01fce902fcc",
        "storeId": "0x530136c8897391819fc6e8e7f3f3df7777e7d3843fb71b6ee3773240e8b0d0ef",
        "adminCapId": "0x638742f6832003cb743a6ef9ccd0ee03fd839e47c5d8a52ea86f2661d544a7e8",
    },
};


settings[selectedChain].chain = selectedChain;
if (argv.phrase) {
    settings[selectedChain].phrase = argv.phrase;
}

module.exports = settings[selectedChain];
