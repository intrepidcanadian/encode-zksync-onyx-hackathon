import { ConnectWallet } from "@thirdweb-dev/react";
import "./styles/Home.css";
import { Web3Provider } from "zksync-web3";
import React, { useEffect, useState } from "react";
import CreateVC from "./components/CreateVC";
import SignVC from "./components/SignVC";
import CreateVP from "./components/CreateVP";
import SignVP from "./components/SignVP";
import { ethers } from "ethers";

import DisplayProducts from "./components/DisplayProducts/DisplayProducts";
import SendLocation from "./components/SendLocation/SendLocation";

export default function Home() {
  const [accounts, setAccounts] = useState([]);
  const [issuer, setIssuer] = useState("");

  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState("");

  return (
    <main className="main">
      <div className="container">
        <div className="header">
          <h1 className="title">
            Digital Identity:{" "}
            <span className="gradient-text-1">Product Passport on ZkSync Era Powered by Onyx SDK</span>
          </h1>
          <div className="connect">
            <ConnectWallet
              modalSize="wide"
              dropdownPosition={{
                side: "bottom",
                align: "center",
              }}
            />
          </div>
          <SendLocation />
          <DisplayProducts />
          <div className="header">
            <h1 className="title">
              DID Process:{" "}
              <span className="gradient-text-2">
                Verified Credentials Issued by Carriers
              </span>
            </h1>
          </div>
        </div>

        <div className="grid">
          <div className="card">
            <p className="card-title">Carrier: Create a Verified Credential</p>
            <CreateVC />
          </div>
        </div>
        <div className="grid">
          <div className="card">
            <p className="card-title">Shipper: Verify and Sign a Verified Credential to DID Registry into zKSync Era Blockchain</p>
            <SignVC />
          </div>
        </div>
        <div className="grid">
          <div className="card">
            <p className="card-title">Create a Verified Presentation</p>
            <CreateVP />
          </div>
        </div>
        <div className="grid">
          <div className="card">
            <p className="card-title">Proove to Recipients, Custom Officials, etc. ownership</p>
            <SignVP />
          </div>
        </div>
      </div>

    </main>
  );
}
