const { Tweet, Get_Search, Author } = require("../models");
const Sequelize = require("sequelize");
const axios = require("axios");
const { getPagination, getPagingData } = require("../helpers/pagination");
const { set } = require("express/lib/application");
const toParseJSON = [
  "entities",
  "referenced_tweets",
  "context_annotations",
  "attachments",
  "public_metrics",
  "geo",
  "tweets",
];
class Controller {
  static async getAllSearches(req, res) {
    try {
      const result = await Get_Search.findAll({
        attributes: [
          [Sequelize.fn("DISTINCT", Sequelize.col("keyword")), "keyword"],
        ],
        group: ["keyword"],
        limit: 100,
      });
      res.status(200).json(result);
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
  static async getSearchesByKeyword(req, res) {
    const keyword = req.query.keyword;
    console.log(req.query);
    try {
      const result = await Get_Search.findAll({
        where: {
          keyword,
        },
        include: {
          model: Tweet,
        },
        limit: 100,
        order: [["createdAt", "DESC"]],
      });
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
  static async getTweetsByKeyword(req, res) {
    const keyword = req.query.keyword;
    const size = req.query.size;
    const page = req.query.page ? req.query.page : 0;
    if (!keyword) {
      return res.status(400).json({ message: "Please provide a keyword" });
    }
    const { limit, offset } = getPagination(page, size);
    if (!page) {
      try {
        const result = await Tweet.findAll({
          where: {
            keyword_used: keyword,
          },
          limit: size ? size : 10,
          order: [["createdAt", "DESC"]],
        });
        res.status(200).json(result);
      } catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: "Internal Server Error" });
      }
    }
    try {
      const result = await Tweet.findAndCountAll({
        where: {
          keyword_used: keyword,
        },
        limit,
        offset,
        order: [["createdAt", "DESC"]],
      });
      const response = getPagingData(result, page, limit);
      return res.status(200).json(response);
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  static async firstTweetByKeyword(req, res) {
    const keyword = req.query.keyword;
    if (!keyword) {
      return res.status(400).json({ message: "Please provide a keyword" });
    }
    try {
      const result = await Tweet.findOne({
        where: {
          text: {
            [Sequelize.Op.iLike]: `%${keyword}%`,
          },
        },
        order: [["createdAt", "ASC"]],
        limit: 1,
      });
      res.status(200).json(result);
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  static async lastTweetByKeyword(req, res) {
    const keyword = req.query.keyword;
    if (!keyword) {
      return res.status(400).json({ message: "Please provide a keyword" });
    }
    try {
      const result = await Tweet.findOne({
        where: {
          text: {
            [Sequelize.Op.iLike]: `%${keyword}%`,
          },
        },
        order: [["createdAt", "DESC"]],
        limit: 1,
      });
      res.status(200).json(result);
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  static async durationTrend(req, res) {
    const keyword = req.query.keyword;
    if (!keyword) {
      return res.status(400).json({ message: "Please provide a keyword" });
    }
    try {
      const firstCreated = await Tweet.findOne({
        where: {
          text: {
            [Sequelize.Op.iLike]: `%${keyword}%`,
          },
        },
        include: {
          model: Author,
        },
        order: [["createdAt", "ASC"]],
      });
      const lastCreated = await Tweet.findOne({
        where: {
          text: {
            [Sequelize.Op.iLike]: `%${keyword}%`,
          },
        },
        order: [["createdAt", "desc"]],
      });

      const { created_time: startTime } = firstCreated;
      const { created_time: endTime } = lastCreated;
      let duration =
        Math.abs(new Date(startTime) - new Date(endTime)) / (1000 * 3600 * 24);
      if (duration < 1) {
        duration = Math.round(duration * 24) + " hours";
      } else {
        duration = Math.round(duration) + " days";
      }
      const response = {
        keyword,
        first_created_at: startTime,
        last_created_at: endTime,
        duration,
      };
      res.status(200).json(response);
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  static async getTrend(req, res) {
    const keyword = req.query.keyword;
    const start_date = req.query.start_date;
    const end_date = req.query.end_date;
    const query = {
      where: {
        text: {
          [Sequelize.Op.iLike]: `%${keyword}%`,
        },
      },
    };
    if (!keyword) {
      return res.status(400).json({ message: "Please provide a keyword" });
    }
    if (!start_date && end_date) {
      return res.status(400).json({ message: "Please provide a start date" });
    }
    if (start_date && !end_date) {
      query.where.created_time = {
        [Sequelize.Op.gte]: start_date,
      };
    }
    if (start_date && end_date) {
      query.where.createdAt = {
        [Sequelize.Op.between]: [start_date, end_date],
      };
    }
    try {
      const result = await Tweet.findAll(query);
      if (!result.length)
        return res.status(404).json({ message: "No result found" });
      const total_pubic_metrics = {
        retweet_count: 0,
        reply_count: 0,
        like_count: 0,
        quote_count: 0,
      };
      const all_hastaghs = [];
      const all_sources = {
        Android: 0,
        iPhone: 0,
        "Web App": 0,
      };
      const languages = {};
      const word_clouds = {};
      const tweet_by_type = {};
      let total_mentions = 0;
      let total_tweets = 0;
      result.forEach((tweet) => {
        toParseJSON.forEach((column) => {
          if (tweet[column]) {
            tweet[column] = JSON.parse(tweet[column]);
          }
          if (column == "entities") {
            tweet.entities.hashtags.forEach((hashtag) => {
              all_hastaghs.push(hashtag.tag);
            });
          }
        });
        // count sources
        if (tweet.source.includes("App")) {
          all_sources["Web App"] += 1;
        }
        if (tweet.source.includes("iPhone")) {
          all_sources.iPhone += 1;
        }
        if (tweet.source.includes("Android")) {
          all_sources.Android += 1;
        }
        // count languages
        if (languages[tweet.lang]) {
          languages[tweet.lang] += 1;
        } else {
          languages[tweet.lang] = 1;
        }
        // count words
        const all_words = tweet.text.split(" ");
        all_words.forEach((word) => {
          const filter = ["@", "http", "\n", "rt"];
          let flag = true;
          filter.forEach((filterWord) => {
            if (word.toLowerCase().includes(filterWord)) {
              flag = false;
            }
          });
          if (flag) {
            const filtered_word = word
              .replace(/[^a-zA-Z0-9]/g, "")
              .toLowerCase();
            if (filtered_word.length > 1) {
              if (word_clouds[filtered_word]) {
                word_clouds[filtered_word] += 1;
              } else {
                word_clouds[filtered_word] = 1;
              }
            }
          }
        });
        // count tweets type
        if (tweet.referenced_tweets) {
          tweet.referenced_tweets.forEach((ref) => {
            if (tweet_by_type[ref.type]) {
              tweet_by_type[ref.type] += 1;
            } else {
              tweet_by_type[ref.type] = 1;
            }
          });
        }
        // count mentions
        if (tweet.entities.mentions) {
          total_mentions += tweet.entities.mentions.length;
        }
      });
      // count total metrics
      total_pubic_metrics.retweet_count = result.reduce(
        (acc, tweet) => acc + tweet.public_metrics.retweet_count,
        0
      );
      total_pubic_metrics.reply_count = result.reduce(
        (acc, tweet) => acc + tweet.public_metrics.reply_count,
        0
      );
      total_pubic_metrics.like_count = result.reduce(
        (acc, tweet) => acc + tweet.public_metrics.like_count,
        0
      );
      total_pubic_metrics.quote_count = result.reduce(
        (acc, tweet) => acc + tweet.public_metrics.quote_count,
        0
      );
      // filter only unique hastaghs
      const unique_hashtags = [...new Set(all_hastaghs)];
      total_tweets = result.length;
      // get frequency of tweets
      const frequency = {};
      result.forEach((tweet) => {
        if (frequency[tweet.created_time]) {
          frequency[tweet.created_time] += 1;
        } else {
          frequency[tweet.created_time] = 1;
        }
      });
      res.status(200).json({
        total_tweets,
        total_mentions,
        total_pubic_metrics,
        unique_hashtags,
        all_sources,
        tweet_by_type,
        word_clouds,
        languages,
        frequency,
        result,
      });
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

module.exports = Controller;