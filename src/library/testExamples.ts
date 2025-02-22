export type sampleTypes = 'basic' | 'wallet';

export const testExamples: {
    [id in sampleTypes]: string
} = {
    basic: `/* 
    This is example test file. 
    Test are written in plain javascript and are run via 'mocha' library

    Functions available in global scope:
    1. 'describe', 'it' from mocha. https://mochajs.org/
    2. 'expect' from chai. https://www.chaijs.com/
    3.  Functions from @decentralchain/waves-transactions. https://github.com/Decentral-America/waves-transactions#readme. 
    These functions use current account and current node as defaults 
    4.  'address', 'privateKey', 'publicKey' from  @waves/waves-crypto. Current account is used as default
*/

// You can write singe test using 'it' syntax
it('Single test waits for tx to be mined', async function(){
    // All functions available in console are also available in tests
    // E.g.: transaction creating functions
    const ttx = transfer({ amount: 1000, recipient: address() })
    // Or broadcast function
    await broadcast(ttx)
    // There is special waitForTx function that waits
    // for transaction to be mined in block. 
    // Optional timeout can be passed as second argument.
    // Default timeout is 20 seconds
    await waitForTx(ttx.id)
})
// You can define test suites with 'describe' syntax
describe('My first test suite', () => {
    // And define tests inside suites
    // As you can see, we can use async functions to write async tests. sync functions have default timeout = 20s
    it('Aks balance and height', async function(){
        // You can set timeout. If you set it to zero, test won't finish untill function resolves
        this.timeout(0)
        // You can ask balance or currentHeigh
        const b = await balance();
        const h = await currentHeight()
        // Console methods avalilable in test. Everything will be printed in repl
        console.log(b, h)
    })

    it('Assertions', async function(){
        const ttx = transfer({ amount: 100000000000000, recipient: address()})
        // Synchonous assertion
        expect(ttx.proofs.length).to.equal(1)
        // Async assertion. Expect broadcast to fail
         await expect(broadcast(ttx)).rejectedWith()
    })
})`,
    wallet: `const wvs = 10 ** 8;

describe('wallet test suite', async function () {

    this.timeout(100000);

    before(async function () {
        await setupAccounts({foo: 1 * wvs, bar: 2 * wvs, wallet: 0.05 * wvs});
        const script = compile(file('wallet.ride'));
        const ssTx = setScript({script}, accounts.wallet);
        await broadcast(ssTx);
        await waitForTx(ssTx.id)
        console.log('Script has been set')
    });
    
    it('Can deposit', async function () {
        const iTxFoo = invokeScript({
            dApp: address(accounts.wallet),
            call: {function: "deposit"},
            payment: [{assetId: null, amount: 0.9 * wvs}]
        }, accounts.foo);
        const iTxBar = invokeScript({
            dApp: address(accounts.wallet),
            call: {function: "deposit"},
            payment: [{assetId: null, amount: 1.9 * wvs}]
        }, accounts.bar)
        await broadcast(iTxFoo);
        await broadcast(iTxBar);
        await waitForTx(iTxFoo.id);
        await waitForTx(iTxBar.id);
    })

    it('Cannot withdraw more than was deposited', async function () {
        const iTxFoo = invokeScript({
            dApp: address(accounts.wallet),
            call: {
                function: "withdraw",
                args: [{type:'integer', value: 2 * wvs}]
            },

        }, accounts.foo);

        expect(broadcast(iTxFoo)).to.be.rejectedWith("Not enough balance")
    })

    it('Can withdraw', async function () {
        const iTxFoo = invokeScript({
            dApp: address(accounts.wallet),
            call: {
                function: "withdraw",
                args: [{ type: 'integer', value: 0.9 * wvs }]
            },

        }, accounts.foo);
        await broadcast(iTxFoo)
    })
})`
};
