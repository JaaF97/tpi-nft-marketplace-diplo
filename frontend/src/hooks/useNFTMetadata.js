import { useState, useEffect } from "react";

// Un gateway público de IPFS
const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

const formatIpfsUrl = (ipfsUrl) => {
  if (!ipfsUrl || !ipfsUrl.startsWith("ipfs://")) {
    return ipfsUrl; // Retornar original si no es una URL IPFS válida
  }
  const cid = ipfsUrl.substring(7);
  return `${IPFS_GATEWAY}${cid}`;
};

export const useNftMetadata = (tokenUri) => {
  const [metadata, setMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tokenUri) return;

    const fetchMetadata = async () => {
      setIsLoading(true);
      setError(null);
      
      const metadataUrl = formatIpfsUrl(tokenUri);
      
      try {
        const response = await fetch(metadataUrl);
        if (!response.ok) {
          throw new Error("Failed to fetch metadata");
        }
        
        const data = await response.json();
        
        // También formatear la URL de la imagen para que sea un enlace HTTP utilizable
        if (data.image) {
          data.image = formatIpfsUrl(data.image);
        }
        
        setMetadata(data);
      } catch (e) {
        console.error("Failed to fetch NFT metadata:", e);
        setError("Could not load metadata.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, [tokenUri]);

  return { metadata, isLoading, error };
};