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
    const size = req.query.size ? req.query.size : 10;
    const page = req.query.page ? req.query.page : 0;
    if (!keyword) {
      return res.status(400).json({ message: "keyword is required" });
    }
    const { limit, offset } = getPagination(page, size);
    if (!page) {
      try {
        const result = await Get_Search.findAll({
          where: {
            keyword: {
              [Sequelize.Op.iLike]: `%${keyword}%`,
            },
          },
          include: {
            model: Tweet,
            attributes: [
              "id",
              "text",
              "created_time",
              "author_id",
              "conversation_id",
              "public_metrics",
            ],
            include: [
              {
                model: Author,
                attributes: [
                  "id",
                  "name",
                  "profile_image_url",
                  "location",
                  "verified",
                  "public_metrics",
                ],
              },
              {
                model: Tweet,
                as: "conversation",
                attributes: [
                  "id",
                  "text",
                  "created_time",
                  "author_id",
                  "conversation_id",
                  "public_metrics",
                ],
                include: {
                  model: Author,
                  attributes: [
                    "id",
                    "name",
                    "profile_image_url",
                    "location",
                    "verified",
                    "public_metrics",
                  ],
                },
              },
            ],
          },
          limit: size ? size : 10,
          order: [["createdAt", "DESC"]],
        });

        if (result.length == 0) {
          return res.status(404).json({ message: "Not found" });
        }
        result.forEach((tweet) => {
          Object.keys(tweet.dataValues).forEach((key) => {
            if (toParseJSON.includes(key)) {
              tweet.dataValues[key] = JSON.parse(tweet.dataValues[key]);
            }
          });
        });
        return res.status(200).json(result);
      } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
      }
    } else {
      try {
        const result = await Get_Search.findAndCountAll({
          where: {
            keyword: {
              [Sequelize.Op.iLike]: `%${keyword}%`,
            },
          },
          include: [
            {
              model: Tweet,
              attributes: [
                "id",
                "text",
                "created_time",
                "author_id",
                "conversation_id",
                "public_metrics",
              ],
              include: [
                {
                  model: Author,
                  attributes: [
                    "id",
                    "name",
                    "profile_image_url",
                    "location",
                    "verified",
                    "public_metrics",
                  ],
                },
                {
                  model: Tweet,
                  as: "conversation",
                  attributes: [
                    "id",
                    "text",
                    "created_time",
                    "author_id",
                    "conversation_id",
                    "public_metrics",
                  ],
                  include: {
                    model: Author,
                    attributes: [
                      "id",
                      "name",
                      "profile_image_url",
                      "location",
                      "verified",
                      "public_metrics",
                    ],
                  },
                },
              ],
            },
          ],
          limit,
          offset,
          order: [["createdAt", "DESC"]],
        });
        if (result.rows.length == 0)
          return res.status(404).json({ message: "Not found" });
        result.rows.forEach((tweet) => {
          Object.keys(tweet.dataValues).forEach((key) => {
            if (toParseJSON.includes(key)) {
              tweet.dataValues[key] = JSON.parse(tweet.dataValues[key]);
            }
          });
        });
        const response = getPagingData(result, page, limit);
        res.status(200).json(response);
      } catch (err) {
        console.log("err", err);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }
  static async getMultipleId(req, res) {
    const ids = req.body.ids;
    const query = {
      where: {
        id: {
          [Sequelize.Op.in]: ids,
        },
      },

      include: [
        {
          model: Author,
          attributes: [
            "id",
            "name",
            "profile_image_url",
            "location",
            "verified",
            "public_metrics",
          ],
        },
        {
          model: Tweet,
          as: "conversation",
          attributes: [
            "id",
            "text",
            "created_time",
            "author_id",
            "conversation_id",
            "public_metrics",
          ],
          include: {
            model: Author,
            attributes: [
              "id",
              "name",
              "profile_image_url",
              "location",
              "verified",
              "public_metrics",
            ],
          },
        },
      ],
    };
    try {
      const listConversations = [];
      const response = {};
      const result = await Tweet.findAll(query);
      if (result.length == 0) {
        return res.status(404).json({ message: "Not found" });
      }
      result.forEach((tweet) => {
        Object.keys(tweet.dataValues).forEach((key) => {
          if (toParseJSON.includes(key)) {
            tweet.dataValues[key] = JSON.parse(tweet.dataValues[key]);
          }
        });
        if (
          tweet.id != tweet.conversation_id &&
          tweet.conversation_id !== null
        ) {
          listConversations.push(tweet.conversation_id);
        }
      });
      if (listConversations.length > 0) {
        const queryConversation = {
          where: {
            id: {
              [Sequelize.Op.in]: listConversations,
            },
          },
          include: {
            model: Author,
            attributes: [
              "id",
              "name",
              "profile_image_url",
              "location",
              "verified",
              "public_metrics",
            ],
          },
        };
        const resultConversation = await Tweet.findAll(queryConversation);
        resultConversation.forEach((tweet) => {
          Object.keys(tweet.dataValues).forEach((key) => {
            if (toParseJSON.includes(key)) {
              tweet.dataValues[key] = JSON.parse(tweet.dataValues[key]);
            }
          });
          const { id, ...rest } = tweet.dataValues;
          response[id] = rest;
          response[id].tweets = result.filter(
            (tweet) => tweet.conversation_id == id
          );
        });
      }

      return res.status(200).json(response);
    } catch (err) {
      console.log("err", err);
      res.status(500).json({ message: err.message });
    }
  }
  static async getTweetsByKeyword(req, res) {
    const keyword = req.query.keyword;
    const size = req.query.size ? req.query.size : 10;
    const page = req.query.page ? req.query.page : 0;
    if (!keyword) {
      return res.status(400).json({ message: "Please provide a keyword" });
    }
    const { limit, offset } = getPagination(page, size);
    if (!page) {
      try {
        const result = await Tweet.findAll({
          where: {
            text: {
              [Sequelize.Op.iLike]: `%${keyword}%`,
            },
          },
          include: [
            {
              model: Author,
              attributes: [
                "id",
                "name",
                "profile_image_url",
                "location",
                "verified",
                "public_metrics",
              ],
            },
            {
              model: Tweet,
              as: "conversation",
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
              include: {
                model: Author,
                attributes: [
                  "id",
                  "name",
                  "profile_image_url",
                  "location",
                  "verified",
                  "public_metrics",
                ],
              },
            },
          ],

          limit: size ? size : 10,
          order: [["createdAt", "DESC"]],
        });
        if (result.length == 0)
          return res.status(404).json({ message: "Not found" });
        result.forEach((tweet) => {
          Object.keys(tweet.dataValues).forEach((key) => {
            if (toParseJSON.includes(key)) {
              tweet.dataValues[key] = JSON.parse(tweet.dataValues[key]);
            }
          });
        });
        res.status(200).json(result);
      } catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: "Internal Server Error" });
      }
    } else {
      try {
        const result = await Tweet.findAndCountAll({
          where: {
            text: {
              [Sequelize.Op.iLike]: `%${keyword}%`,
            },
          },
          include: [
            {
              model: Author,
              attributes: [
                "id",
                "name",
                "profile_image_url",
                "location",
                "verified",
                "public_metrics",
              ],
            },
            {
              model: Tweet,
              as: "conversation",
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
              include: {
                model: Author,
                attributes: [
                  "id",
                  "name",
                  "profile_image_url",
                  "location",
                  "verified",
                  "public_metrics",
                ],
              },
            },
          ],
          limit,
          offset,
          order: [["createdAt", "DESC"]],
        });
        if (result.rows.length == 0)
          return res.status(404).json({ message: "Not found" });
        result.rows.forEach((tweet) => {
          Object.keys(tweet.dataValues).forEach((key) => {
            if (toParseJSON.includes(key)) {
              tweet.dataValues[key] = JSON.parse(tweet.dataValues[key]);
            }
          });
        });
        const response = getPagingData(result, page, limit);
        return res.status(200).json(response);
      } catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: "Internal Server Error" });
      }
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
        include: [
          {
            model: Author,
            attributes: [
              "id",
              "name",
              "profile_image_url",
              "location",
              "verified",
              "public_metrics",
            ],
          },
          {
            model: Tweet,
            as: "conversation",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
            include: {
              model: Author,
              attributes: [
                "id",
                "name",
                "profile_image_url",
                "location",
                "verified",
                "public_metrics",
              ],
            },
          },
        ],
        order: [["createdAt", "ASC"]],
        limit: 1,
      });
      if (!result) return res.status(404).json({ message: "Not found" });
      return res.status(200).json(result);
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
        include: [
          {
            model: Author,
            attributes: [
              "id",
              "name",
              "profile_image_url",
              "location",
              "verified",
              "public_metrics",
            ],
          },
          {
            model: Tweet,
            as: "conversation",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
            include: {
              model: Author,
              attributes: [
                "id",
                "name",
                "profile_image_url",
                "location",
                "verified",
                "public_metrics",
              ],
            },
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: 1,
      });
      if (!result) return res.status(404).json({ message: "Not found" });
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
      if (!firstCreated) return res.status(404).json({ message: "Not found" });
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
      order: [["createdAt", "DESC"]],
    };
    if (!keyword) {
      return res.status(400).json({ message: "Please provide a keyword" });
    }
    if (new Date(start_date) > new Date(end_date)) {
      return res
        .status(400)
        .json({ message: "Start date must be before end date" });
    }
    if (start_date) {
      if (new Date(start_date) == "Invalid Date") {
        return res.status(400).json({ message: "Invalid start date" });
      }
    }
    if (end_date) {
      if (new Date(end_date) == "Invalid Date") {
        return res.status(400).json({ message: "Invalid end date" });
      }
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
      query.where.created_time = {
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
        "Twitter for Android": 0,
        "Twitter for iPhone": 0,
        "Twitter for Web App": 0,
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
            if (tweet.entities && tweet.entities.hashtags) {
              tweet.entities.hashtags.forEach((hashtag) => {
                all_hastaghs.push(hashtag.tag);
              });
            }
          }
        });
        // count sources
        if (tweet.source.includes("App")) {
          all_sources["Twitter Web App"] += 1;
        } else if (tweet.source.includes("iPhone")) {
          all_sources["Twitter for iPhone"] += 1;
        } else if (tweet.source.includes("Android")) {
          all_sources["Twitter for Android"] += 1;
        } else {
          if (all_sources[tweet.source]) {
            all_sources[tweet.source] += 1;
          } else {
            all_sources[tweet.source] = 1;
          }
        }
        // count languages
        if (languages[tweet.lang]) {
          languages[tweet.lang] += 1;
        } else {
          languages[tweet.lang] = 1;
        }
        // count words
        if (tweet.text) {
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
                .replace(/[^a-zA-Z]/g, "")
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
        }
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
        if (tweet.entities && tweet.entities.mentions) {
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
      let frequency = {};
      result.forEach((tweet) => {
        const date = new Date(tweet.created_time.split(".000")[0]);
        date.setSeconds(0, 0);
        tweet.created_time = new Date(
          date.setMinutes(Math.round(date.getMinutes() / 5) * 5)
        ).toISOString();
        const temp = {
          tweet_id: tweet.id,
          author_id: tweet.author_id,
          "public metrics": 0,
        };
        Object.keys(tweet.public_metrics).forEach((key) => {
          temp["public metrics"] =
            temp["public metrics"] + tweet.dataValues["public_metrics"][key];
        });
        if (!frequency[tweet.created_time]) {
          frequency[tweet.created_time] = [temp.tweet_id];
        } else {
          frequency[tweet.created_time].push(temp.tweet_id);
        }
      });
      frequency = Object.keys(frequency)
        .sort()
        .reduce((obj, key) => {
          obj[key] = frequency[key];
          return obj;
        }, {});
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
      });
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  static async topTweetByKeyword(req, res) {
    const keyword = req.query.keyword;
    const start_date = req.query.start_date;
    const end_date = req.query.end_date;
    const query = {
      where: {
        text: {
          [Sequelize.Op.iLike]: `%${keyword}%`,
        },
      },
      include: {
        model: Author,
      },
      limit: 1,
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
      let result = await Tweet.findAll(query);
      if (!result.length)
        return res.status(404).json({ message: "No result found" });
      result.forEach((tweet) => {
        toParseJSON.forEach((column) => {
          if (tweet[column]) {
            tweet[column] = JSON.parse(tweet[column]);
          }
          if (column === "public_metrics") {
            tweet.dataValues.total_metrics = 0;
            Object.keys(tweet[column]).forEach((key) => {
              tweet.dataValues.total_metrics += tweet.dataValues[column][key];
            });
          }
        });
        tweet.created_time = new Date(tweet.created_time).toLocaleTimeString();
      });
      result.sort((a, b) => {
        return b.dataValues.total_metrics - a.dataValues.total_metrics;
      });

      res.status(200).json(result[0]);
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async test(req, res) {
    const keyword = req.query.keyword;
    const result = await Tweet.findAll({
      where: {
        text: {
          [Sequelize.Op.iLike]: `%${keyword}%`,
        },
      },
      include: [
        {
          model: Author,
        },
        {
          model: Tweet,
          as: "conversation",
        },
      ],
      limit: 20,
      attributes: [
        "id",
        "text",
        "created_time",
        "author_id",
        "conversation_id",
      ],
    });
    res.status(200).json(result);
  }
}

module.exports = Controller;
