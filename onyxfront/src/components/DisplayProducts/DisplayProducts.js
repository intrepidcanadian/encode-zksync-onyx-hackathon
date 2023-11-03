import React, { useState, useEffect } from "react";
import DIDRegistry from "./../Contract/DIDRegistry.json";
import { Web3Provider } from "zksync-web3";
import { ethers } from "ethers";


const contractAddress = "0x8cb68aF497E8686FbF8b9845115DeDB1BEB608eb";

function DisplayProducts() {
  const [walletData, setWalletData] = useState({});
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoveredWallet, setHoveredWallet] = useState(null);
  const [activeWalletAddress, setActiveWalletAddress] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3002/data-endpoint?walletAddress=${activeWalletAddress}`);
        const data = await response.json();

        if (contract) {
          const updatedData = {};

          for (const [walletAddress, locationData] of Object.entries(data)) {
            const vcs = await contract.getVCsForHolder(walletAddress);
            updatedData[walletAddress] = {
              ...locationData,
              vcs: vcs
            };
          }

          setWalletData(updatedData);
        }
      } catch (error) {
        console.error("Error fetching wallet data:", error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 10 * 1000);
    return () => clearInterval(intervalId);
  }, [contract]);

  useEffect(() => {
    if (window.ethereum) {
      const web3Provider = new Web3Provider(window.ethereum);
      setProvider(web3Provider);
      window.ethereum.request({ method: 'eth_accounts' })
      .then((accounts) => {
        if (accounts.length > 0) {
          setActiveWalletAddress(accounts[0]);  // set the first account as the active wallet address
        }
      });

      const didRegistry = new ethers.Contract(
        contractAddress,
        DIDRegistry,
        web3Provider
      );
      setContract(didRegistry);
    } else {
      console.log("Please install MetaMask!");
    }
  }, []);

  return (
    <div>
      <h2>DIDs for Bill of Lading</h2>
      <table border="1" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Wallet Address</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Timestamp</th>
            <th>Verified VCs</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(walletData).map(([walletAddress, locationData]) => {
            console.log(locationData.vcs);
            return (
              <tr key={walletAddress}>
                <td>{walletAddress}</td>
                <td>{locationData.lat}</td>
                <td>{locationData.lng}</td>
                <td>{new Date(locationData.timestamp).toLocaleString()}</td>
                <td
                  onMouseEnter={() => setHoveredWallet(walletAddress)}
                  onMouseLeave={() => setHoveredWallet(null)}
                >
                  VCs
                  {hoveredWallet === walletAddress && (
                    <span
                      style={{
                        position: "absolute",
                        border: "1px solid black",
                        padding: "5px",
                        zIndex: 1000,  
                        backgroundColor: "white", 
                        maxWidth: "200px", 
                        overflow: "auto"
                      }}
                    >
                      {locationData.vcs.join(", ")}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DisplayProducts;
