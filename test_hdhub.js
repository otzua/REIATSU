const url = "https://gadgetsweb.xyz/?id=OGVXQnlDZFJGMTBxNXFYdTN5MnEwaHhReTllUXcyaHNMczdJUWpnbTNNRENyUGJrbHJIQTJCVVhMM1BhMmNxeFNjdzRjN0FPTFUrQSs3OEVvbFczV25pbXdVeCttTDdZaWZWbGRKNTZlYkE9";
fetch("https://cinema-api-rho.vercel.app/api/hdhub4u/extractor?url=" + encodeURIComponent(url))
  .then(r => r.json())
  .then(console.log);
