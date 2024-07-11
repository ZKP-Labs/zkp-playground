import { Mina } from 'o1js';
import { Fibonacci } from './Fibonacci.js';

Error.stackTraceLimit = 1000;

const proofsEnabled = true;

// set up Mina instance and contract we interact with
const Network = await Mina.LocalBlockchain({
  proofsEnabled,
});

const feePayerAccount = Network.testAccounts[0];
const zkAppAccount = Network.testAccounts[1];

Mina.setActiveInstance(Network);

// const Network = Mina.Network(config.url);
const fee = 1e9; // in nanomina (1 billion = 1.0 mina)

Mina.setActiveInstance(Network);

const feepayerAddress = feePayerAccount.key.toPublicKey();
const zkAppAddress = zkAppAccount.key.toPublicKey();

if (proofsEnabled) {
  // compile the contract to create prover keys
  console.log('compile the contract...');
  await Fibonacci.compile();
}

try {
  const zkApp = new Fibonacci(zkAppAddress);

  console.log('deploying...');
  let txd = await Mina.transaction(feepayerAddress, async () => {
    await zkApp.deploy();
  });
  await txd.prove();
  await txd.sign([feePayerAccount.key, zkAppAccount.key]).send();

  // call update() and send transaction
  console.log('build transaction and create proof...');
  let tx = await Mina.transaction(
    { sender: feepayerAddress, fee },
    async () => {
      await zkApp.fibonacci();
    }
  );
  await tx.prove();

  console.log('send transaction...');
  const sentTx = await tx.sign([feePayerAccount.key, zkAppAccount.key]).send();
  console.log(`Txid: ${sentTx.hash}`);
  console.log(
    `Result a: ${zkApp.a.get().toString()} b: ${zkApp.b.get().toString()}`
  );
} catch (err) {
  console.log(err);
}
