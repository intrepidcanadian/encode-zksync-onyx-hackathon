import React, { useState } from "react";
import { ethers } from "ethers";
import EthereumDIDRegistryABI from "./../components/Contract/DIDRegistry.json";
import "./../../src/styles/Home.css";

const Web3 = require('web3').default;
const web3 = new Web3();  


const CONTRACT_ADDRESS = "0x8cb68aF497E8686FbF8b9845115DeDB1BEB608eb";

function SignVC() {
  const [signedVc, setSignedVC] = useState(null);
  const [provider, setProvider] = useState(
    new ethers.providers.Web3Provider(window.ethereum)
  );
  const [vcIDs, setVcIDs] = useState([]);

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

  const computeVCID = (jwtHash, documentID) => {
    const packedDocumentID = ethers.utils.hexZeroPad(documentID, 20); 
    const packedData = jwtHash + packedDocumentID.slice(2); 
    return ethers.utils.keccak256(packedData);
};

const claimVC = async (vcId, jwtHash) => {
  try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          EthereumDIDRegistryABI,
          signer
      );

      const jwtHashData = await contract.vcs(vcId);
      console.log("jwthash in contract: ", jwtHashData.jwtHash);

      // const signature = await signer.signMessage(ethers.utils.arrayify("0x" +jwtHash));
      const privatekey = "0x072a3836fa0bdffff274dcf770c7b415633d7f9c4284fbda4180b86d23faf8c5";

      const signature = web3.eth.accounts.sign(("0x"+jwtHash), privatekey);

      const recoveredPubKey = web3.eth.accounts.recover(
        ("0x"+jwtHash),
        signature.signature
      );

      const publicKey = web3.utils.toChecksumAddress(recoveredPubKey);

      console.log("jwthash: 0x" + jwtHash);
      console.log("signature: ", signature);
      console.log("vcID:", vcId);
      console.log(publicKey);

      await contract.claimVC(vcId, signature.signature);

      alert("VC claimed successfully!");

  } catch (error) {
      console.log("Error claiming VC:", error);
  }
};

  const decodeJWT = (jwt) => {
    const base64UrlDecode = (input) => {
      // Replace `-` with `+` and `_` with `/`
      let base64 = input.replace(/-/g, "+").replace(/_/g, "/");
      switch (base64.length % 4) {
        case 0:
          break;
        case 2:
          base64 += "==";
          break;
        case 3:
          base64 += "=";
          break;
        default:
          throw "Illegal base64url string!";
      }
      return JSON.parse(atob(base64)); // atob decodes base64 encoded string
    };

    const parts = jwt.split(".");
    if (parts.length !== 3) {
      throw new Error("JWT is not correctly formatted");
    }

    const payload = parts[1];
    return base64UrlDecode(payload);
  };

  const signButtonClick = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3001/sign-vcdata", {
        method: "GET",
      });

      const jwtstring = await response.text();

      setSignedVC(jwtstring);

      const jwtData = decodeJWT(jwtstring);

      const didParts = jwtData.jti.split(":");
      if (didParts.length !== 4) {
        throw new Error("Invalid DID format in jti");
      }
      const method = didParts[1];
      const id = didParts[3];

      console.log(method);
      console.log(id);

      const hashedjwtstring = await hashJWT(jwtstring);
      const hashBytes = "0x" + hashedjwtstring;

      console.log(hashedjwtstring);
      console.log(hashBytes);

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        EthereumDIDRegistryABI,
        signer
      );
      await contract.issueVC(id, hashBytes);

      const vcID = computeVCID(hashBytes, id);
      const newVcIDs = [...vcIDs, { id: vcID, jwtHash: hashedjwtstring }];
      console.log(vcID);
      console.log(newVcIDs);
      setVcIDs(newVcIDs);
    } catch (error) {
      console.log("Error signing VC:", error);
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
      <section>
        <h2>Issue VC</h2>
        <button className="button--claimVC" onClick={signButtonClick}>
          Carrier Issues VC to Shipper to Sign
        </button>
        {signedVc && (
          <pre style={contentStyle}>{JSON.stringify(signedVc, null, 2)}</pre>
        )}
      </section>

      <section>
        <h2>Claim VC</h2>
        {vcIDs.map((vcData, index) => (
          <pre key={index} style={contentStyle}>
            {`vcIDs: ${vcData.id}`}
            <button className="button--claimVC" onClick={() => claimVC(vcData.id, vcData.jwtHash)}>Shipper Claim VC</button>
          </pre>
        ))}
      </section>
    </div>
  );
}

export default SignVC;