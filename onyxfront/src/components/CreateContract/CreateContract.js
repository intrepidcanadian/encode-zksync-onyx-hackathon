import React, { useState, useEffect } from 'react';
import DIDRegistry from "./../Contract/DIDRegistry.json";
import "./../../styles/Home.css";
import { Web3Provider } from "zksync-web3";
import { ethers } from "ethers";

const contractAddress = "0x8cb68aF497E8686FbF8b9845115DeDB1BEB608eb";

function CreateDID() {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [account, setAccount] = useState(null);
    const [contract, setContract] = useState(null);
    const [didData, setDidData] = useState({
        didIdentifier: '',
        holderDID: '',
        shipper: '',
        consignee: '0xC1e40b1C6d209912fAF5C68D59BBD8516323C9cd',
        amountForCarrier: '',
        amountForGoods: '',
    });


    useEffect(() => {
        if (window.ethereum) {
            const web3Provider = new Web3Provider(window.ethereum);
            setProvider(web3Provider);
            const signerInstance = web3Provider.getSigner();
            setSigner(signerInstance);
        } else {
            console.log("Please install MetaMask!");
        }
    }, []);

    useEffect(() => {
        if (signer) {
            signer.getAddress().then((address) => {
                setAccount(address);
            });

            const didRegistry = new ethers.Contract(contractAddress, DIDRegistry, signer);
            setContract(didRegistry);
        }
    }, [signer]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setDidData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { didIdentifier, shipper, consignee, amountForCarrier, amountForGoods } = didData;
        const amountForCarrierformatted = ethers.utils.parseEther(amountForCarrier);
        const amountForGoodsformatted = ethers.utils.parseEther(amountForGoods);

        try {
            const tx = await contract.createDID(didIdentifier, shipper, consignee, amountForCarrierformatted, amountForGoodsformatted);
            await tx.wait();
            console.log(`DID Created Successfully! ${didIdentifier}`);
        } catch (error) {
            console.error('Error creating DID:', error);
        }
    };

    return (
        <div className = "container__contract">
            <form onSubmit={handleSubmit}>
                <label className = "container__contract--inputs">
                    Document DID:
                    <input type="text" name="didIdentifier" value={didData.didIdentifier} onChange={handleInputChange} />
                </label>
                <label className = "container__contract--inputs">
                    Shipper DID:
                    <input type="text" name="shipper" value={didData.shipper} onChange={handleInputChange} />
                </label>
                <label className = "container__contract--inputs">
                    Consignee DID:
                    <input type="text" name="consignee" value={didData.consignee} onChange={handleInputChange} />
                </label>
                <label className = "container__contract--inputs">
                    Amount For Carrier:
                    <input type="number" name="amountForCarrier" value={didData.amountForCarrier} onChange={handleInputChange} />
                </label>
                <label className = "container__contract--inputs">
                    Amount For Goods:
                    <input type="number" name="amountForGoods" value={didData.amountForGoods} onChange={handleInputChange} />
                </label>
                <button type="submit">Upload Smart Contract Into zkSync Blockchain</button>
            </form>
        </div>
    );
}

export default CreateDID;
