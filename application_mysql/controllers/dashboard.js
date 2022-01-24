const db = require("../models/index").sequelize;
const checkDiskSpace = require("check-disk-space").default;
class Controller {
  static getDashboardByKeyword = async (req, res) => {
    const keyword = req.query.keyword.split(",");
    if (!keyword) {
      return res.status(400).json({
        message: "Please provide a keyword",
      });
    }
    let response_all = [];
    // return res.send(querySearch);

    try {
      const allPromise = keyword.map(async (key, idx) => {
        const twitter = await db.query(
          "select * from TW_Tweets where text like '%" + key + "%'"
        );
        const twitter_positive = await db.query(
          "select * from TW_Tweets where text like '%" +
            key +
            "%' and sentiment = 'P'"
        );
        const twitter_negative = await db.query(
          "select * from TW_Tweets where text like '%" +
            key +
            "%' and sentiment = 'N'"
        );
        const telegram = await db.query(
          "select * from telegramchats where message like '%" + key + "%'"
        );
        const telegram_positive = await db.query(
          "select * from telegramchats where message like '%" +
            key +
            "%' and sentiment = 'P'"
        );
        const telegram_negative = await db.query(
          "select * from telegramchats where message like '%" +
            key +
            "%' and sentiment = 'N'"
        );

        const facebook = await db.query(
          "select * from facebook_crawlers where post_text like '%" + key + "%'"
        );
        const facebook_positive = await db.query(
          "select * from facebook_crawlers where post_text like '%" +
            key +
            "%' and sentiment = 'P'"
        );
        const facebook_negative = await db.query(
          "select * from facebook_crawlers where post_text like '%" +
            key +
            "%' and sentiment = 'N'"
        );
        const whatsapp = await db.query(
          "select * from whatsappmessages where body like '%" + key + "%'"
        );
        const whatsapp_positive = await db.query(
          "select * from whatsappmessages where body like '%" +
            key +
            "%' and sentiment = 'P'"
        );
        const whatsapp_negative = await db.query(
          "select * from whatsappmessages where body like '%" +
            key +
            "%' and sentiment = 'N'"
        );

        const beritaonline = await db.query(
          "select * from beritaonlines where content like '%" + key + "%'"
        );
        const beritaonline_positive = await db.query(
          "select * from beritaonlines where content like '%" +
            key +
            "%' and sentiment = 'P'"
        );
        const beritaonline_negative = await db.query(
          "select * from beritaonlines where content like '%" +
            key +
            "%' and sentiment = 'N'"
        );

        const beritaoffline = await db.query(
          "select * from beritaofflines where ocr_result like '%" + key + "%'"
        );
        const beritaoffline_positive = await db.query(
          "select * from beritaofflines where ocr_result like '%" +
            key +
            "%' and sentiment = 'P'"
        );
        const beritaoffline_negative = await db.query(
          "select * from beritaofflines where ocr_result like '%" +
            key +
            "%' and sentiment = 'N'"
        );

        const response = {
          statistic: {
            twitter: {
              count: twitter[0].length,
              sentiment_positive: twitter_positive[0].length
                ? twitter_positive[0].length
                : 0,
              sentiment_negative: twitter_negative[0].length
                ? twitter_negative[0].length
                : 0,
            },
            telegram: {
              count: telegram[0].length,
              sentiment_positive: telegram_positive[0].length
                ? telegram_positive[0].length
                : 0,
              sentiment_negative: telegram_negative[0].length
                ? telegram_negative[0].length
                : 0,
            },
            facebook: {
              count: facebook[0].length,
              sentiment_positive: facebook_positive[0].length
                ? facebook_positive[0].length
                : 0,
              sentiment_negative: facebook_negative[0].length
                ? facebook_negative[0].length
                : 0,
            },
            whatsapp: {
              count: whatsapp[0].length,
              sentiment_positive: whatsapp_positive[0].length
                ? whatsapp_positive[0].length
                : 0,
              sentiment_negative: whatsapp_negative[0].length
                ? whatsapp_negative[0].length
                : 0,
            },
            beritaonline: {
              count: beritaonline[0].length,
              sentiment_positive: beritaonline_positive[0].length
                ? beritaonline_positive[0].length
                : 0,
              sentiment_negative: beritaonline_negative[0].length
                ? beritaonline_negative[0].length
                : 0,
            },
            beritaoffline: {
              count: beritaoffline[0].length,
              sentiment_positive: beritaoffline_positive[0].length
                ? beritaoffline_positive[0].length
                : 0,
              sentiment_negative: beritaoffline_negative[0].length
                ? beritaoffline_negative[0].length
                : 0,
            },
          },
          sentiment_meter: {
            negative:
              twitter_negative[0].length +
              telegram_negative[0].length +
              facebook_negative[0].length +
              whatsapp_negative[0].length +
              beritaonline_negative[0].length +
              beritaoffline_negative[0].length,
            positive:
              twitter_positive[0].length +
              telegram_positive[0].length +
              facebook_positive[0].length +
              whatsapp_positive[0].length +
              beritaonline_positive[0].length +
              beritaoffline_positive[0].length,
          },
        };

        return response;
      });
      console.log(allPromise.length);
      Promise.all(allPromise).then((result) => {
        // console.log(JSON.stringify(result, null, 2));
        if (allPromise.length == 1) res.status(200).json(result);
        else {
          let response = {
            statistic: {
              twitter: {
                count: 0,
                sentiment_positive: 0,
                sentiment_negative: 0,
              },
              telegram: {
                count: 0,
                sentiment_positive: 0,
                sentiment_negative: 0,
              },
              facebook: {
                count: 0,
                sentiment_positive: 0,
                sentiment_negative: 0,
              },
              whatsapp: {
                count: 0,
                sentiment_positive: 0,
                sentiment_negative: 0,
              },
              beritaonline: {
                count: 0,
                sentiment_positive: 0,
                sentiment_negative: 0,
              },
              beritaoffline: {
                count: 0,
                sentiment_positive: 0,
                sentiment_negative: 0,
              },
            },
            sentiment_meter: {
              negative: 0,
              positive: 0,
            },
          };
          result.forEach((res) => {
            response.statistic.twitter.count += res.statistic.twitter.count;
            response.statistic.twitter.sentiment_positive +=
              res.statistic.twitter.sentiment_positive;
            response.statistic.twitter.sentiment_negative +=
              res.statistic.twitter.sentiment_negative;
            response.statistic.telegram.count += res.statistic.telegram.count;
            response.statistic.telegram.sentiment_positive +=
              res.statistic.telegram.sentiment_positive;
            response.statistic.telegram.sentiment_negative +=
              res.statistic.telegram.sentiment_negative;
            response.statistic.facebook.count += res.statistic.facebook.count;
            response.statistic.facebook.sentiment_positive +=
              res.statistic.facebook.sentiment_positive;
            response.statistic.facebook.sentiment_negative +=
              res.statistic.facebook.sentiment_negative;
            response.statistic.whatsapp.count += res.statistic.whatsapp.count;
            response.statistic.whatsapp.sentiment_positive +=
              res.statistic.whatsapp.sentiment_positive;
            response.statistic.whatsapp.sentiment_negative +=
              res.statistic.whatsapp.sentiment_negative;
            response.statistic.beritaonline.count +=
              res.statistic.beritaonline.count;
            response.statistic.beritaonline.sentiment_positive +=
              res.statistic.beritaonline.sentiment_positive;
            response.statistic.beritaonline.sentiment_negative +=
              res.statistic.beritaonline.sentiment_negative;
            response.statistic.beritaoffline.count +=
              res.statistic.beritaoffline.count;
            response.statistic.beritaoffline.sentiment_positive +=
              res.statistic.beritaoffline.sentiment_positive;
            response.statistic.beritaoffline.sentiment_negative +=
              res.statistic.beritaoffline.sentiment_negative;
          });
          res.status(200).json(response);
        }
      });
      //
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  static getDashboardTwitter = async (req, res) => {
    try {
      const twitter = await db.query(
        "select count(*) as count_tweets from TW_Tweets"
      );
      const authors = await db.query(
        "select count(*) as count_authors from TW_Authors"
      );
      const response = {
        count_tweets: twitter[0][0].count_tweets,
        count_authors: authors[0][0].count_authors,
      };
      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  static getDashboardWhatsapp = async (req, res) => {
    try {
      const whatsapp = await db.query(
        "select count(*) as count_text from whatsappmessages"
      );
      const authors = await db.query(
        "select count(*) as count_authors from whatsappaccounts"
      );
      const response = {
        count_text: whatsapp[0][0].count_text,
        count_authors: authors[0][0].count_authors,
      };
      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  static getDashboardFacebook = async (req, res) => {
    try {
      const facebook = await db.query(
        "select count(*) as count_posts from facebook_crawlers"
      );
      const authors = await db.query(
        "select count(distinct(fbid)) as count_authors from facebook_crawlers"
      );
      const response = {
        count_posts: facebook[0][0].count_posts,
        count_authors: authors[0][0].count_authors,
      };
      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  static getDashboardTelegram = async (req, res) => {
    try {
      const telegram = await db.query(
        "select count(*) as count_text from telegramchats"
      );
      const authors = await db.query(
        "select count(*) as count_authors from telegramaccounts"
      );
      const response = {
        count_text: telegram[0][0].count_text,
        count_authors: authors[0][0].count_authors,
      };
      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  static getDashboardOnlineNews = async (req, res) => {
    try {
      const news = await db.query(
        "select count(*) as count_text from beritaonlines"
      );
      const categories = await db.query(
        "select count(distinct(category_id)) as count_categories from beritaonlines"
      );
      const response = {
        count_text: news[0][0].count_text,
        count_authors: categories[0][0].count_categories,
      };
      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  static getDashboardOflineNews = async (req, res) => {
    try {
      const news = await db.query(
        "select count(*) as count_text from beritaofflines"
      );
      const categories = await db.query(
        "select count(distinct(category_id)) as count_categories from beritaofflines"
      );
      const response = {
        count_text: news[0][0].count_text,
        count_authors: categories[0][0].count_categories,
      };
      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  static getDashboardMemorySpace = async (req, res) => {
    try {
      checkDiskSpace("/mnt/").then((diskSpace) => {
        console.log(diskSpace);
        // {
        //     diskPath: '/',
        //     free: 12345678,
        //     size: 98756432
        // }
        // Note: `free` and `size` are in bytes
        const response = {
          free: (diskSpace.free / 1024 / 1024 / 1024).toFixed(2) + " GB",
          total: (diskSpace.size / 1024 / 1024 / 1024).toFixed(2) + " GB",
          ram_used: process.memoryUsage().heapUsed / 1024 / 1024,
        };
        res.status(200).json(response);
      });
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
}

module.exports = Controller;
