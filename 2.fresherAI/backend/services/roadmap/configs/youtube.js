import dotenv from "dotenv"
dotenv.config()
import axios from "axios"

const BASE_URL = "https://www.googleapis.com/youtube/v3/search"

const getChannelQueries = (topic, role = "") => {
  const target = `${role} ${topic}`.toLowerCase();

  if (/(ai|ml|machine learning|deep learning|data science|nlp|computer vision|aiml)/i.test(target)) {
    return [
      `${topic} CampusX`,
      `${topic} Krish Naik`,
      `${role} ${topic} machine learning tutorial`,
    ];
  }

  if (/(frontend|backend|full stack|mern|react|node|javascript|web|html|css|express|mongodb)/i.test(target)) {
    return [
      `${topic} Chai aur Code`,
      `${topic} CodeWithHarry`,
      `${role} ${topic} web development tutorial`,
    ];
  }

  if (/(dsa|data structures|algorithms|coding interview|system design)/i.test(target)) {
    return [
      `${topic} CodeWithHarry`,
      `${topic} GeeksforGeeks`,
      `${topic} coding interview tutorial`,
    ];
  }

  return [
    `${role} ${topic} tutorial`,
    `${topic} tutorial`,
  ];
}

const isPreferredChannel = (channelTitle = "", role = "") => {
  const channel = channelTitle.toLowerCase();
  const target = role.toLowerCase();

  if (/(ai|ml|machine learning|deep learning|data science|aiml)/i.test(target)) {
    return channel.includes("campusx") || channel.includes("krish naik");
  }

  if (/(frontend|backend|full stack|mern|react|node|javascript|web)/i.test(target)) {
    return channel.includes("chai aur code") || channel.includes("codewithharry");
  }

  return true;
}

const searchVideo = async (topic, role = "") => {
  try {
    const queries = getChannelQueries(topic, role);
    let fallback = null;

    for (const query of queries) {
      const { data } = await axios.get(BASE_URL, {
        params: {
          key: process.env.YOUTUBE_API_KEY,
          part: "snippet",
          q: query,
          maxResults: 3,
          type: "video",
        },
      })

      for (const video of data.items || []) {
        const result = {
          title: video.snippet.title,
          channel: video.snippet.channelTitle,
          url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
        };

        fallback ||= result;

        if (isPreferredChannel(video.snippet.channelTitle, role)) {
          return result;
        }
      }
    }

    return fallback;
  } catch (error) {
    console.log(error)
    return null;
  }
}

export default searchVideo
