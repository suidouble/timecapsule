
export default class BuckStaker {
    constructor(params = {}) {

        this._suiMaster = params.suiMaster || null;
        this._consts = {
            CLOCK: "0x0000000000000000000000000000000000000000000000000000000000000006",
            sBUCK: "0x1798f84ee72176114ddbf5525a6d964c5f8ea1b3738d08d50d0d3de4cf584884::sbuck::SBUCK",
            BUCK: "0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2::buck::BUCK",
            SUI: "0x2::sui::SUI",
            SBUCK_PACKAGE: "0x1798f84ee72176114ddbf5525a6d964c5f8ea1b3738d08d50d0d3de4cf584884", // package with sbuck::deposit
            SBUCK_FLASK_OBJECT_ID: "0xc6ecc9731e15d182bc0a46ebe1754a779a4bfb165c201102ad51a36838a1a7b8", // arg for sbuck::deposit
            SBUCK_FOUNTAIN_PACKAGE_ID: "0x75b23bde4de9aca930d8c1f1780aa65ee777d8b33c3045b053a178b452222e82", // package with fountain_core
            SBUCK_BUCK_LP_REGISTRY_ID: "0xbdf91f558c2b61662e5839db600198eda66d502e4c10c4fc5c683f9caca13359", // arg for fountain_core::stake
        };

        // StakeProof result has a type of:
        // 0x75b23bde4de9aca930d8c1f1780aa65ee777d8b33c3045b053a178b452222e82::fountain_core::StakeProof<0x1798f84ee72176114ddbf5525a6d964c5f8ea1b3738d08d50d0d3de4cf584884::sbuck::SBUCK, 0x2::sui::SUI>

    }

    get stakedProofType() {
        return '0x75b23bde4de9aca930d8c1f1780aa65ee777d8b33c3045b053a178b452222e82::fountain_core::StakeProof<0x1798f84ee72176114ddbf5525a6d964c5f8ea1b3738d08d50d0d3de4cf584884::sbuck::SBUCK, 0x2::sui::SUI>';
    }

    get consts() {
        return this._consts;
    }

    get suiMaster() {
        return this._suiMaster;
    }

    async stakeBuckIntoCapsule(params = {}) {
        const amount = params.amount;
        const ownerAddress = this.suiMaster.address;
        const TransactionBlock = this.suiMaster.TransactionBlock;
        const txBlock = new TransactionBlock();

        const coin = await this._suiMaster.suiCoins.get(this.consts.BUCK);
        const txCoinToSend = await coin.coinOfAmountToTxCoin(txBlock, ownerAddress, amount);

        const depositedBalance = txBlock.moveCall({
            target: `${this.consts.SBUCK_PACKAGE}::sbuck::deposit`,
            arguments: [txBlock.pure(this.consts.SBUCK_FLASK_OBJECT_ID), txCoinToSend],
            typeArguments: [this.consts.BUCK],
        });

        const maxLockTimeOfRegistry = 4838400000;
        const stakedProof = txBlock.moveCall({
            target: `${this.consts.SBUCK_FOUNTAIN_PACKAGE_ID}::fountain_core::stake`,
            arguments: [
                    txBlock.pure(this.consts.CLOCK), 
                    txBlock.pure(this.consts.SBUCK_BUCK_LP_REGISTRY_ID), 
                    depositedBalance, 
                    txBlock.pure(maxLockTimeOfRegistry)
                ],
            typeArguments: [this.consts.sBUCK, this.consts.SUI],
        });

        return {
            txBlock: txBlock,
            stakedProof: stakedProof,
        };
    }

}