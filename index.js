document.getElementById('main-screen').style.display="none";

const create_safe_button = document.getElementById('create-safe-button');
create_safe_button.addEventListener('click',screenchangetomain);
async function screenchangetomain()
{
    document.getElementById('main-screen').style.display="block";
    document.getElementById('transaction-screen').style.display="block";
    document.getElementById('invest-screen').style.display ="none";
    document.getElementById('swap-screen').style.display ="none";
    document.getElementById('all-orders-screen').style.display ="none";
    document.getElementById('welcome-screen').style.display ="none";
    document.getElementById('profile-screen').style.display ="none";
    await checkAndCreateSafe();
    await checkBalance();
    await viewTransaction();
}

//transaction pages button are here....
const transaction_button = document.getElementById('transaction-button');
transaction_button.addEventListener('click',screenchangetotransaction1);
function screenchangetotransaction1()
{
    document.getElementById('transaction-screen').style.display="block";
    document.getElementById('invest-screen').style.display ="none";
    document.getElementById('swap-screen').style.display ="none";
    document.getElementById('all-orders-screen').style.display ="none";
    document.getElementById('profile-screen').style.display ="none";
}

// investment page buttons are here...

const invest_button = document.getElementById('invest-button');
invest_button.addEventListener('click',screenchangetoinvest);

function screenchangetoinvest()
{
    document.getElementById('transaction-screen').style.display="none";
    document.getElementById('swap-screen').style.display ="none";
    document.getElementById('all-orders-screen').style.display ="none";
    document.getElementById('invest-screen').style.display ="block";
    document.getElementById('profile-screen').style.display ="none";
}

const swap_button = document.getElementById('swap-button');
swap_button.addEventListener('click',screenchangetoswap);

function screenchangetoswap()
{
    document.getElementById('invest-screen').style.display="none";
    document.getElementById('transaction-screen').style.display="none";
    document.getElementById('all-orders-screen').style.display ="none";
    document.getElementById('swap-screen').style.display ="block";
    document.getElementById('profile-screen').style.display ="none";
}

const all_orders_button = document.getElementById('all-orders-button');
all_orders_button.addEventListener('click',screenchangetoallorders);

function screenchangetoallorders()
{
    document.getElementById('invest-screen').style.display="none";
    document.getElementById('transaction-screen').style.display="none";
    document.getElementById('swap-screen').style.display ="none";
    document.getElementById('all-orders-screen').style.display ="block";
    document.getElementById('profile-screen').style.display ="none";
}

const profile_button = document.getElementById('profile-button');
profile_button.addEventListener('click',screenchangetoallprofile);
function screenchangetoallprofile()
{
    document.getElementById('invest-screen').style.display="none";
    document.getElementById('transaction-screen').style.display="none";
    document.getElementById('swap-screen').style.display ="none";
    document.getElementById('all-orders-screen').style.display ="none";
    document.getElementById('profile-screen').style.display ="block";
}



// All logic below

const {ethers , BigNumber, Signer}  = require("ethers");
const { SafeTransactionDataPartial } = require('@gnosis.pm/safe-core-sdk-types');
const { SafeFactory, SafeAccountConfig, ContractNetworksConfig } = require('@gnosis.pm/safe-core-sdk');
const Safe = require('@gnosis.pm/safe-core-sdk')["default"];
const EthersAdapter = require('@gnosis.pm/safe-ethers-lib')["default"];


//Global variables used
let wallet_signer , provider , addressOfSafe , user_address;

// ADDRESS AND ABI OF CONTRACTS...
const dai_address = "0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa" , 
cDAI_ADDRESS = "0x6D7F0754FFeb405d23C51CE938289d4835bE3b14" , 
uniswap_address="0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D" , 
link_address = "0x01BE23585060835E02B77ef475b0Cc51aA1e0709" ;

const erc20Abi = [
    "function balanceOf(address account) public view returns (uint256)",
    "function transfer(address to, uint256 amount) public returns (bool)",
    "function approve(address spender, uint tokens)public returns (bool success)"
];

const uniswap_abi = [
    "function swapExactTokensForTokens( uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
];

const cerc20Abi = [
    "function balanceOf(address account) public view returns (uint256)",
    "function mint(uint256 mintAmount) public",
    "function redeemUnderlying(uint256 redeemAmount) public"
];

//PROVIDERS AND RELAYERS ADDRESS...

provider = new ethers.providers.Web3Provider(window.ethereum);
wallet_signer = provider.getSigner();

document.getElementById('metamask-wallet').addEventListener('click',openWallet);

async function openWallet()
{
    await provider.send("eth_requestAccounts", []);
    user_address = await wallet_signer.getAddress();
    document.getElementById('metamask-wallet').innerText = "Connected"; 
    document.getElementById('user_address_span').innerText=`${user_address}`;
    await checkAndCreateSafe();
}

async function checkAndCreateSafe()
{
    const response = await fetch('http://localhost:3030/checkForSafe' , {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            address: user_address
        })
    });
    const content = await response.json();
    const jsonContent = JSON.parse(content);
    const status = jsonContent.status;
    if(status == 'true'){
        addressOfSafe = jsonContent.address;
    }
    else{
        console.log("Creating a new safe since user does not have a safe");
        const response = await fetch('http://localhost:3030/createSafe' , {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                address: user_address
            })
        });
        const content = await response.json();
        const jsonContent = JSON.parse(content);
        addressOfSafe = jsonContent.safeAddress;
    }
    document.getElementById('trx-from-address').innerText = addressOfSafe;
}

async function checkBalance(){
    const response = await fetch('http://localhost:3030/getBalance' , {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                address: addressOfSafe
            })
    });
    const content = await response.json();
    const jsonContent = JSON.parse(content);
    const daiBalance = jsonContent.dai_balance;
    const linkBalance = jsonContent.link_balance;
    const cDaiBalance = jsonContent.cDai_balance;
    let i = "DAI BALANCE : " + daiBalance;
    let j = "LINK BALANCE : " + linkBalance;
    document.getElementById('trx-dai-balance').innerText = `${i}`;
    document.getElementById('invest-dai-balance').innerText = i;
    document.getElementById('redeem-dai-balance').innerText = "cDAI BALANCE : " + cDaiBalance;
    document.getElementById('swap-dai-balance').innerText =`${i}\n${j}`;
}

async function viewTransaction(){
    const response = await fetch('http://localhost:3030/viewTransactions' , {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                address: addressOfSafe
            })
    });
    const content = await response.json();
    const jsonContent = JSON.parse(content);
    const res = jsonContent.res;
    var list = document.getElementById('list');
    list.innerHTML="";
    for(let i = 0 ; i < res.length ; i++){
        const r = res[i];
        const url = `https://rinkeby.etherscan.io/tx/${r.hash}`
        const li = document.createElement('li');
        li.className = "list-group-item";
        const len = res.length;
        const timestamp = r.timeStamp;
        const status=r.txreceipt_status;
        const currTime = parseInt(Date.now())/1000;
        var time = currTime - timestamp;
        var secondsAgo = parseInt(time);
        var minuteAgo = secondsAgo/60;
        var hoursAgo = minuteAgo/60;
        secondsAgo = secondsAgo%60;
        minuteAgo = minuteAgo%60;
        secondsAgo = parseInt(secondsAgo);
        minuteAgo = parseInt(minuteAgo);
        hoursAgo = parseInt(hoursAgo);
        var timeDisplayed = `${secondsAgo}s ago`;
        if(minuteAgo > 0){
            timeDisplayed = `${minuteAgo}m ` + timeDisplayed
        }
        if(hoursAgo > 0){
            timeDisplayed = `${hoursAgo}h ` + timeDisplayed
        }
        secondsAgo = parseInt(secondsAgo);
        li.innerText = `Transaction Number: ${res.length - i}\n Transaction Hash: ${r.hash} \n Time Of Transaction : ${timeDisplayed} \n`;
        const a = document.createElement('a');
        a.href = url;
        if(status=="1")
        {
            a.innerText = `View Successful Transaction`;
            li.style.backgroundColor="#C7E3BD";
        }else{
            a.innerText = `View Failed Transaction`;
            li.style.backgroundColor="#F0B1AC";
        }
        a.target = '_blank';
        li.appendChild(a);
        list.appendChild(li);
    }
}

// similarly this function is used for creation of safe sdk object with the owner as the signer...
async function createSafeSdkForOwner()
{
    const wallet_signer1 = provider.getSigner();
    const owner_adapter1 = new EthersAdapter({ethers , signer: wallet_signer1});
    const safeSdk_owner = await Safe.create({ethAdapter : owner_adapter1,safeAddress: addressOfSafe});
    return safeSdk_owner;
}

document.getElementById("send-transaction-button").addEventListener('click',sendTransaction);
// this function is for sending dai tokens to any other address
async function sendTransaction(){
    document.getElementById("transaction-status-text").innerText = "Transaction status: Starting...";
    const value = document.getElementById("trx-screen-token-input").value;
    const address_to_send = document.getElementById("trx-screen-address-input").value;
    const ownerSafeSdk = await createSafeSdkForOwner();
    document.getElementById("transaction-status-text").innerText="Transaction status: Encoding Transaction...";
    const dai_contract = new ethers.Contract(dai_address, erc20Abi, wallet_signer);
    const dataForTransaction = await dai_contract.populateTransaction["transfer"](address_to_send , ethers.utils.parseUnits(value , 18));
    const tx = {
        to: dai_address,
        data: dataForTransaction.data,
        gasLimit: 250000,
        value: '0'
    }
    document.getElementById("transaction-status-text").innerText="Transaction status: Asking For your Approval...";
    const safeTransaction = await ownerSafeSdk.createTransaction(tx);
    await ownerSafeSdk.signTransaction(safeTransaction);
    document.getElementById("transaction-status-text").innerText="Transaction status: Transaction In Progress...";
    const signer = safeTransaction.signatures.get(user_address.toLowerCase()).signer;
    const data = safeTransaction.signatures.get(user_address.toLowerCase()).data;
    const response = await fetch('http://localhost:3030/transferAssets' , {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                address: addressOfSafe,
                value: value,
                toAddress: address_to_send,
                signer: signer,
                data: data
            })
    });
    console.log("Transaction complete");
    await checkBalance();
    document.getElementById("transaction-status-text").innerText="Transaction status: Transaction Complete...";
    document.getElementById("trx-screen-token-input").value = "";
    document.getElementById("trx-screen-address-input").value = "";
}

//for lending to the compound protocol is done here.....

document.getElementById("lend-token-button").addEventListener('click',lendMoney);
async function lendMoney(){
    document.getElementById("lend-status-text").innerText="Transaction status: Starting...";
    let value = document.getElementById("lend-token-input").value;
    value = ethers.utils.parseUnits(value , 18);
    const ownerSafeSdk = await createSafeSdkForOwner();
    const ercDAI = new ethers.Contract(dai_address, erc20Abi, wallet_signer);
    const erccDAI = new ethers.Contract(cDAI_ADDRESS, cerc20Abi, wallet_signer);
    const approveDAI = await ercDAI.populateTransaction["approve"](cDAI_ADDRESS,value);
    const approvecDAI = await erccDAI.populateTransaction["mint"](value);
    const tx = [
        {
            to: dai_address,    // first approval for dai to get transfered....
            value: "0",
            data:approveDAI.data,
        },
        {
            to: cDAI_ADDRESS,
            value: "0",
            data:approvecDAI.data,
        },
    ];
    document.getElementById("lend-status-text").innerText="Transaction status: Seeking Token Approval...";
    const safeTransaction = await ownerSafeSdk.createTransaction(tx);
    await ownerSafeSdk.signTransaction(safeTransaction);
    const signer = safeTransaction.signatures.get(user_address.toLowerCase()).signer;
    const data = safeTransaction.signatures.get(user_address.toLowerCase()).data;
    document.getElementById("lend-status-text").innerText="Transaction status: Transaction In Progress...";
    const response = await fetch('http://localhost:3030/lend' , {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                address: addressOfSafe,
                value: value,
                signer: signer,
                data: data
            })
    });
    console.log("Transaction complete");
    document.getElementById("lend-status-text").innerText="Transaction status: Transaction complete...";
    checkBalance();
    document.getElementById("lend-token-input").value = "";
}

// for redeeming from compound protocol is done here....

const redeem_send_button = document.getElementById("redeem-token-button");
redeem_send_button.addEventListener('click',redeemMoney);

async function redeemMoney(){
    document.getElementById("redeem-status-text").innerText="Transaction status: Starting...";
    let value = document.getElementById("redeem-token-input").value;
    value = ethers.utils.parseUnits(value , 18);
    const ownerSafeSdk = await createSafeSdkForOwner();
    const erccDAI = new ethers.Contract(cDAI_ADDRESS, cerc20Abi, wallet_signer);
    const redeemDAI = await erccDAI.populateTransaction["redeemUnderlying"](value);
    const tx = {
        to: cDAI_ADDRESS,
        value: '0',
        data: redeemDAI.data,
        gasLimit: 250000
    };
    document.getElementById("redeem-status-text").innerText="Transaction status: Seeking Token Approval...";
    const safeTransaction = await ownerSafeSdk.createTransaction(tx);
    await ownerSafeSdk.signTransaction(safeTransaction);
    document.getElementById("redeem-status-text").innerText="Transaction status: Transaction In Progress...";
    const signer = safeTransaction.signatures.get(user_address.toLowerCase()).signer;
    const data = safeTransaction.signatures.get(user_address.toLowerCase()).data;
    const response = await fetch('http://localhost:3030/redeem' , {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                address: addressOfSafe,
                value: value,
                signer: signer,
                data: data
            })
    });
    console.log("transaction complete");
    checkBalance();
    document.getElementById("redeem-status-text").innerText="Transaction status: Transaction complete";
    document.getElementById("redeem-token-input").value = "";
}

//swap of tokens using uniswap is done here....

const swap_send_button = document.getElementById("swap-token-button");
swap_send_button.addEventListener('click',swapMoney);

async function swapMoney(){
    let value = document.getElementById("swap-token-input").value;
    document.getElementById('swap-status-text').innerText = "Transaction status: Please Approve Token First...."
    const value2 = ethers.utils.parseUnits(value , 18);
    const ownerSafeSdk = await createSafeSdkForOwner();
    const uniswapSmartContract = new ethers.Contract(uniswap_address, uniswap_abi, wallet_signer);
    const ercDAI = new ethers.Contract(dai_address, erc20Abi, wallet_signer);
    const dataForTransaction = await ercDAI.populateTransaction["approve"](uniswap_address , value2.toString());
    const tx = {
        to: dai_address,
        value: '0',
        data: dataForTransaction.data,
        gasLimit: 250000
    };
    const safeTransaction = await ownerSafeSdk.createTransaction(tx);
    await ownerSafeSdk.signTransaction(safeTransaction);
    document.getElementById('swap-status-text').innerText = "Transaction status: Processing Token Approval...."
    const signer = safeTransaction.signatures.get(user_address.toLowerCase()).signer;
    const data = safeTransaction.signatures.get(user_address.toLowerCase()).data;
    const response = await fetch('http://localhost:3030/approve' , {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                address: addressOfSafe,
                value: value,
                signer: signer,
                data: data
            })
    });
    console.log("Approval given successfully");
    document.getElementById('swap-status-text').innerText = "Transaction status: Approved successfully..."
    const path = [dai_address , link_address];
    const deadline = Math.floor(Date.now()/1000 + 180000);
    const uniswap_data = await uniswapSmartContract.populateTransaction["swapExactTokensForTokens"](value2.toString() , '0' , path, addressOfSafe , deadline);
    const tx2 = {
        to: uniswap_address,
        data: uniswap_data.data,
        value: '0',
        gasLimit: 250000
    }
    const ownerSafeSdk1 = await createSafeSdkForOwner(); 
    const safeTransaction1 = await ownerSafeSdk1.createTransaction(tx2);
    await ownerSafeSdk1.signTransaction(safeTransaction1);
    const signer1 = safeTransaction1.signatures.get(user_address.toLowerCase()).signer;
    const data1 = safeTransaction1.signatures.get(user_address.toLowerCase()).data;
    document.getElementById('swap-status-text').innerText = "Transaction status: Starting Swap transaction..."
    const response1 = await fetch('http://localhost:3030/swap' , {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                address: addressOfSafe,
                value: value,
                signer: signer1,
                data: data1,
                deadline: deadline
            })
    });
    console.log("Swap done");
    checkBalance();
    document.getElementById('swap-status-text').innerText = "Transaction status: Transaction Completed"
    document.getElementById("swap-token-input").value = "";
}
