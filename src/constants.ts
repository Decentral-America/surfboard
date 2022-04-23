export const NETWORKS = {
    STAGENET: {
        url: 'https://nodes-stagenet.wavesnodes.com',
        chainId: 'S',
        faucet: 'https://wavesexplorer.com/stagenet/faucet',
        explorer: 'https://wavesexplorer.com/stagenet'
    },
    TESTNET: {
        url: 'https://testnet-node.decentralchain.io',
        chainId: '!',
        faucet: 'https://decentralscan.com/testnet/faucet',
        explorer: 'https://decentralscan.com/testnet'
    },
    MAINNET: {
        url: 'https://mainnet-node.decentralchain.io',
        chainId: '?',
        explorer: 'https://decentralscan.com'
    },
    PRIVATE: {
        url: 'http://localhost:6869',
        chainId: 'R',
        explorer: 'http://localhost:3000'
    }
};
