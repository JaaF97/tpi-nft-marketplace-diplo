export const uploadToIPFS = async (file, metadata) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", metadata.name);
  formData.append("description", metadata.description);

  const res = await fetch("http://localhost:5000/api/nft/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to upload to IPFS via backend");

  const data = await res.json();
  return data.ipfsCID; // Solo retornamos el CID (no la URL completa)
};
