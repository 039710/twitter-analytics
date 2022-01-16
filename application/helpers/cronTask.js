const CronJob = require("cron").CronJob;
const axios = require("axios");
const { Tweet, Get_Search, Author } = require("../models");
const twitterApi = axios.create({
  baseURL: "https://api.twitter.com/2",
  headers: {
    Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
  },
});

// "1 * * * * *" => setiap menit
// "*/30 * * * * *" => setiap 30 detik

const crawl = async (keyword) => {
  try {
    const toConvertJson = [
      "entities",
      "referenced_tweets",
      "context_annotations",
      "attachments",
      "public_metrics",
      "geo",
    ];
    const result = await twitterApi.get("/tweets/search/recent", {
      params: {
        query: keyword,
        max_results: 10,
        "tweet.fields":
          "attachments,author_id,context_annotations,conversation_id,created_at,entities,geo,id,in_reply_to_user_id,lang,possibly_sensitive,referenced_tweets,reply_settings,source,text,withheld,public_metrics",
        "user.fields":
          "created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified,withheld",
      },
    });
    const toInsertTweets = [];
    const toInsertMeta = result.data.meta;
    const resultTweets = result.data.data;
    const get_search = await Get_Search.create({ keyword, ...toInsertMeta });
    const search_id = get_search.id;
    resultTweets.forEach((tweet) => {
      toConvertJson.forEach((column) => {
        if (tweet[column]) {
          tweet[column] = JSON.stringify(tweet[column]);
        }
      });
      tweet.keyword_used = keyword;
      tweet.search_id = search_id;
      tweet.created_time = tweet.created_at;
      toInsertTweets.push(tweet);
    });
    const promiseArr = [];
    toInsertTweets.forEach((tweet, idx) => {
      promiseArr.push(checkAuthor(tweet));
    });

    await Promise.allSettled(promiseArr);
    const twitters = await Tweet.findAll({
      order: [["created_time", "DESC"]],
    });
    const filteredTweets = [];
    const promiseUpdate = toInsertTweets.map(async (tweet, idx) => {
      if (twitters.filter((oldTweet) => oldTweet.id == tweet.id)[0]) {
        await Tweet.update(tweet, {
          where: {
            id: tweet.id,
          },
        });
      } else {
        filteredTweets.push(tweet);
      }
    });
    await Promise.allSettled(promiseUpdate);
    await Tweet.bulkCreate(filteredTweets);
  } catch (err) {
    console.error(err.message);
  }
};
const checkAuthor = async (tweet) => {
  try {
    const findAuthor = await Author.findOne({
      where: {
        id: tweet.author_id,
      },
    });

    if (!findAuthor) {
      const response = await twitterApi.get(`/users/${tweet.author_id}`, {
        params: {
          "user.fields":
            "created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified,withheld",
          expansions: "pinned_tweet_id",
          "tweet.fields":
            "attachments,author_id,context_annotations,conversation_id,created_at,entities,geo,id,in_reply_to_user_id,lang,possibly_sensitive,public_metrics,referenced_tweets,reply_settings,source,text,withheld",
        },
      });
      const author = response.data.data;
      author.public_metrics = JSON.stringify(author.public_metrics);
      if (response.data.includes)
        author.tweets = JSON.stringify(response.data.includes.tweets);

      await Author.create(author);
    }
  } catch (err) {
    return Promise.reject("err");
  }
};

const job = new CronJob(
  // "*/5 * * * * *",
  "*/20 * * * * *",
  async function () {
    await crawl("terserahpolisi");
    await crawl("periksaanaklurah");
  },
  null,
  false,
  "America/Los_Angeles"
);

module.exports = job;
