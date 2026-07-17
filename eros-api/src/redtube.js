export async function searchRedtube(query, options = {}) {
  const page = options.page || 1;
  const url = `https://api.redtube.com/?data=redtube.Videos.searchVideos&search=${encodeURIComponent(query)}&page=${page}&output=json`;
  
  try {
    const res = await fetch(url);
    const json = await res.json();
    
    // Convert Redtube format to Eros format
    const videos = (json.videos || []).map(v => v.video).map(v => ({
      id: String(v.video_id),
      title: v.title,
      views: v.views,
      rating: v.rating,
      duration: v.duration,
      added: v.publish_date,
      default_thumb: v.default_thumb,
      thumb: v.thumb,
      keywords: (v.tags || []).map(t => t.tag_name).join(', '),
      embed: v.embed_url || `https://embed.redtube.com/?id=${v.video_id}`
    }));
    
    return {
      success: true,
      data: {
        query,
        count: json.count || videos.length,
        total_pages: Math.ceil((json.count || 20) / 20),
        page,
        videos
      }
    };
  } catch (err) {
    throw err;
  }
}

export async function getRedtubeDetails(id) {
  const url = `https://api.redtube.com/?data=redtube.Videos.getVideoById&video_id=${id}&output=json`;
  
  try {
    const res = await fetch(url);
    const json = await res.json();
    
    if (!json.video) {
      throw new Error("Video not found");
    }
    
    const v = json.video;
    
    return {
      success: true,
      data: {
        id: String(v.video_id),
        title: v.title,
        views: v.views,
        rating: v.rating,
        duration: v.duration,
        added: v.publish_date,
        default_thumb: v.default_thumb,
        thumb: v.thumb,
        keywords: (v.tags || []).map(t => t.tag_name).join(', '),
        embed: v.embed_url || `https://embed.redtube.com/?id=${v.video_id}`
      }
    };
  } catch (err) {
    throw err;
  }
}
