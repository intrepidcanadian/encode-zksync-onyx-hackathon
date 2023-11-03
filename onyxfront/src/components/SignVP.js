import React, { useState } from "react";
import { ethers } from "ethers";
import EthereumDIDRegistryABI from "./../components/Contract/DIDRegistry.json";
import { Base64 } from 'js-base64';

const Web3 = require("web3").default;
const web3 = new Web3(window.ethereum);
const CONTRACT_ADDRESS = "0x8cb68aF497E8686FbF8b9845115DeDB1BEB608eb";

function SignVP() {
  const [signedVP, setSignedVP] = useState(null);
  const [vcID, setVcID] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const [usrAddress, setUserAddress] = useState("");
const [jwtH, setJwtHash] = useState("");
const [holdr, setHolderSignature] = useState("");

  const signButtonClick = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3001/sign-vpdata", {
        method: "GET",
      });
      const jwtstring = await response.text();
      setSignedVP(jwtstring);
     
    } catch (error) {
      console.log("Error signing VC:", error);
    }
  };


  const decodeJWT = (jwt) => {
    const parts = jwt.split(".");

    console.log(parts);

    if (parts.length !== 3) {
      throw new Error("JWT is not correctly formatted");
    }

    const payload = parts[1];

    console.log(payload);

    const base64UrlDecode = (input) => {
      let base64 = input.replace(/-/g, "+").replace(/_/g, "/");
      console.log("Base64 string before decoding:", base64);
      switch (base64.length % 4) {
          case 2:
              base64 += "==";
              break;
          case 3:
              base64 += "=";
              break;
          default:
             throw new Error("Illegal base64url string!");
      }
      return JSON.parse(Base64.decode(base64));
  };  
    return base64UrlDecode(payload);
  };

  async function hashJWT(jwt) {
    const encoder = new TextEncoder();
    const data = encoder.encode(jwt);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  }

  const verifyVC = async () => {
    try {
      if (!vcID) {
        alert("Please provide a vcID.");
        return;
      }

      if (!signedVP) {
        alert("Please provide a signed VP.");
        return;
      }

      const userAddress = (await web3.eth.getAccounts())[0];
      setUserAddress(userAddress);

      console.log(signedVP);

      const vpData = decodeJWT(signedVP);

      console.log(vpData);

      const vcJWT = vpData.vp.verifiableCredential[0];
      const jwtHash = await hashJWT(vcJWT);
      setJwtHash(jwtHash);

      console.log(jwtHash);
      console.log(vcID);
      console.log(userAddress);

      const privatekey =
        "PROCESS.ENV.PRIVATE_KEY";
      const signature = web3.eth.accounts.sign("0x" + jwtHash, privatekey);

      console.log(signature.signature);

      setHolderSignature(signature.signature);

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        EthereumDIDRegistryABI,
        signer
      );

      const isHolder = await contract.hasHolderClaimedVC(
        vcID,
        userAddress,
        signature.signature
      );

      console.log(isHolder);
      if (!isHolder) {
        setVerificationResult(false);
        return;
      }

      setVerificationResult(true);

    } catch (error) {
      console.error("Error verifying VC:", error);
      setVerificationResult(false);
    }
  };

  const contentStyle = {
    maxHeight: "300px",
    overflowY: "auto",
    overflowX: "auto",
    whiteSpace: "pre-wrap",
    border: "1px solid #ccc",
    padding: "10px",
  };


  return (
    <div>
      <button onClick={signButtonClick}>Create a VP JWT</button>

      {signedVP && (
        <pre style={contentStyle}>{JSON.stringify(signedVP, null, 2)}</pre>
      )}

      <div>
        <input
          type="text"
          placeholder="Enter vcID"
          value={vcID}
          onChange={(e) => setVcID(e.target.value)}
        />
        <button onClick={verifyVC}>Verify VC within VP</button>
      </div>

      {verificationResult !== null && (
        <p>
          Verification Result:{" "}
          {verificationResult ? "Result: Verified" : "Result: Not Verified"}
          <div>
            <p>Current Address: {usrAddress} </p>
            <p>JWT Hash: {jwtH}</p>
            <p>Holder Signature: {holdr}</p>
          </div>
        </p>
      )}
    </div>
  );
}

export default SignVP;
