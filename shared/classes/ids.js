
export default {
    'localnet': {
        packageId: '0xca6b4ed0e5eaceeddbc4f970717f5ffbe26fa5e04a1ef8af21918a654111b89e',
        SUI: "0x2::sui::SUI",
        CLOCK: "0x0000000000000000000000000000000000000000000000000000000000000006",
        bucket: {
            fountainPackageId: '%packageId%',
            sBUCK: '%packageId%::test_coin::TEST_COIN',
            //0x2f199391c6cdc4bbc2ef721a5af3c0fd46ff6bcbdfdfd17a2334bf6b11647231
        },
        testCoin: {
            type: '%packageId%::test_coin::TEST_COIN',
        },
        timecapsule: {
            packageId: '%packageId%',
        },
    },
    'mainnet': {
        packageId: '0xbb8425a506b54f9382a8ec4c540478334f10f67b7f1ae2218489ce0aaea831eb',
        // packageId: '0x80b92600ee5e10cf728cb8e2f6443ad1aa73d87c3f237da206c3fdcf2813ec04',
        
        SUI: "0x2::sui::SUI",
        CLOCK: "0x0000000000000000000000000000000000000000000000000000000000000006",
        bucket: {
            sBUCK: '0x1798f84ee72176114ddbf5525a6d964c5f8ea1b3738d08d50d0d3de4cf584884::sbuck::SBUCK',
            CLOCK: "0x0000000000000000000000000000000000000000000000000000000000000006",
            BUCK: "0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2::buck::BUCK",
            SUI: "0x2::sui::SUI",
            BUCK_TO_SBUCK_PACKAGE: "0xb71c0893203d0f59622fc3fac849d0833de559d7503af21c5daf880d60d754ed",
            BUCK_PROTOCOL_ID: "0x9e3dab13212b27f5434416939db5dec6a319d15b89a84fd074d03ece6350d3df",
            SBUCK_PACKAGE: "0x1798f84ee72176114ddbf5525a6d964c5f8ea1b3738d08d50d0d3de4cf584884", // package with sbuck::deposit
            SBUCK_FLASK_OBJECT_ID: "0xc6ecc9731e15d182bc0a46ebe1754a779a4bfb165c201102ad51a36838a1a7b8", // arg for sbuck::deposit
            SBUCK_FOUNTAIN_PACKAGE_ID: "0x75b23bde4de9aca930d8c1f1780aa65ee777d8b33c3045b053a178b452222e82", // package with fountain_core
            SBUCK_BUCK_LP_REGISTRY_ID: "0xbdf91f558c2b61662e5839db600198eda66d502e4c10c4fc5c683f9caca13359", // arg for fountain_core::stake
            stakedProofType: "0x75b23bde4de9aca930d8c1f1780aa65ee777d8b33c3045b053a178b452222e82::fountain_core::StakeProof<0x1798f84ee72176114ddbf5525a6d964c5f8ea1b3738d08d50d0d3de4cf584884::sbuck::SBUCK, 0x2::sui::SUI>",
        },
        timecapsule: {
            packageId: '0x9f246ed250ccdac3e04c1b677d22ae33c69bec173f7a647cd26a6275b492d5e0',
            storeId: '0xbd1124c2183396d47b3c7c2f286880eb4992cca624f7cd2a1dfae8bc8a6fe421',
        },
        tokens: {
            fud: '0x76cb819b01abed502bee8a702b4c2d547532c12f25001c9dea795a5e631c26f1::fud::FUD',
            buck: '0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2::buck::BUCK',
            meta: '0x3c680197c3d3c3437f78a962f4be294596c5ebea6cea6764284319d5e832e8e4::meta::META',
            fomo: '0xa340e3db1332c21f20f5c08bef0fa459e733575f9a7e2f5faca64f72cd5a54f2::fomo::FOMO',
        },
    },
    'testnet': {
        packageId: '0xcde69e01bd9cf0338880945d8f873f7afad23d911d9535cc3de89beedf8a34e9',
        SUI: "0x2::sui::SUI",
        CLOCK: "0x0000000000000000000000000000000000000000000000000000000000000006",
        bucket: {
            fountainPackageId: '%packageId%',
            sBUCK: '%packageId%::test_coin::TEST_COIN',
            //0x2f199391c6cdc4bbc2ef721a5af3c0fd46ff6bcbdfdfd17a2334bf6b11647231
        },
        testCoin: {
            type: '%packageId%::test_coin::TEST_COIN',
        },
        timecapsule: {
            // packageId: '0x95715c5f309fc2e64192d079652380282d1157fa048e711afc7878afd4af1bf1',
            "packageId": "0x308e141e6f760adfe6773be39d0cdd79ca274b639e0b438cec1156a392306199",
            "firstVPackageId": "0x5642b6ead93e220b692fbae8be0e865c36ec0d06287d6319889757dc58c25448",
            storeId: '0x6657d601d835715114894717ba3b87bc7a9bd3a1fbbd5e042f53d5438b8ee390',
        },
        tokens: {
            fud: '0xc797288b493acb9c18bd9e533568d0d88754ff617ecc6cc184d4a66bce428bdc::suidouble_liquid_coin::SUIDOUBLE_LIQUID_COIN',
            buck: '0xc797288b493acb9c18bd9e533568d0d88754ff617ecc6cc184d4a66bce428bdc::suidouble_liquid_coin::SUIDOUBLE_LIQUID_COIN',
            meta: '0x1d4a80381ecca0ea3ea458bf9f0d633323f7226070b85d2de45c091938cfc0fa::meta::META',
        },
    },
};