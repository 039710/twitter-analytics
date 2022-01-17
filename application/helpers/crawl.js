const CronJob = require("cron").CronJob;
const Sequelize = require("sequelize");
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
const toConvertJson = [
  "entities",
  "referenced_tweets",
  "context_annotations",
  "attachments",
  "public_metrics",
  "geo",
];
const crawl = async (keyword, max_result) => {
  console.log(max_result, "ini max_result");
  try {
    const result = await twitterApi.get("/tweets/search/recent", {
      params: {
        query: keyword,
        max_results: max_result,
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
    const toLookUpTweets = [];
    resultTweets.forEach((tweet) => {
      toConvertJson.forEach((column) => {
        if (tweet[column]) {
          tweet[column] = JSON.stringify(tweet[column]);
        }
      });
      tweet.keyword_used = keyword;
      tweet.search_id = search_id;
      tweet.created_time = tweet.created_at;
      if (tweet.conversation_id !== tweet.id) {
        toLookUpTweets.push(tweet);
      }
      toInsertTweets.push(tweet);
    });
    const promiseCheckAuthor = [];
    const promiseInsertTweetsLookUp = [];
    toLookUpTweets.forEach((tweet) => {
      promiseInsertTweetsLookUp.push(
        insertSingleTweet(tweet, keyword, search_id)
      );
    });
    toInsertTweets.forEach((tweet, idx) => {
      promiseCheckAuthor.push(checkAuthor(tweet));
    });
    await Promise.allSettled(promiseCheckAuthor);
    await Promise.allSettled(promiseInsertTweetsLookUp);
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
    console.error(err.message, "<< bulk create");
  }
};
const insertSingleTweet = async (tweet, keyword, search_id) => {
  try {
    let isFound = await Tweet.findOne({
      where: {
        id: tweet.conversation_id,
      },
    });
    if (!isFound) {
      const result = await twitterApi.get(`/tweets/${tweet.conversation_id}`, {
        params: {
          "tweet.fields":
            "attachments,author_id,context_annotations,conversation_id,created_at,entities,geo,id,in_reply_to_user_id,lang,possibly_sensitive,referenced_tweets,reply_settings,source,text,withheld,public_metrics",
          "user.fields":
            "created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified,withheld",
        },
      });
      const toInsertTweet = await result.data.data;
      toConvertJson.forEach((column) => {
        if (toInsertTweet[column]) {
          toInsertTweet[column] = JSON.stringify(toInsertTweet[column]);
        }
      });
      toInsertTweet.keyword_used = keyword;
      toInsertTweet.search_id = search_id;
      toInsertTweet.created_time = toInsertTweet.created_at;

      if (toInsertTweet.conversation_id !== toInsertTweet.id) {
        // await checkAuthor(toInsertTweet);
        // await insertSingleTweet(toInsertTweet, keyword, search_id);
      } else {
        await checkAuthor(toInsertTweet);
        let found = await Tweet.findOne({
          where: {
            id: toInsertTweet.id,
          },
        });
        if (!found) {
          await Tweet.create(toInsertTweet);
        }
      }
    }
  } catch (err) {
    console.error(err.message, "<< single");
  }
};

const checkAuthor = async (tweet) => {
  if (tweet.author_id) {
    try {
      let findAuthor = await Author.findOne({
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
        findAuthor = await Author.findOne({
          where: {
            id: author.id,
          },
        });
        if (!findAuthor) {
          await Author.create(author);
        }
      }
    } catch (err) {
      console.error(err.message, "<< author");
      return Promise.reject("err");
    }
  }
};

const allSchedulers = {};
module.exports = { allSchedulers, crawl };
