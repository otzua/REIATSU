fetch('http://localhost:5173/api/beyond/details?slug=overflow-episode-1')
  .then(res => res.json())
  .then(data => {
    if(data.success) {
      console.log("Stream:", data.data.info[0].best_stream);
      console.log("Streams:", data.data.info[0].streams.map(s => s.resolution));
    } else {
      console.log("Error", data);
    }
  }).catch(console.error);
