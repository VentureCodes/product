import axios from 'axios'
import * as cheerio from 'cheerio'
import { News } from '../typings/news'

// coinbaseurl
const baseURL = 'https://pro-api.coinmarketcap.com'

// coinmarketClient
export const coinmarketClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
    'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY,
  },
})

export const getNews = async () => {
  let news: News[] = []

  try {
    // Fetch news from businessdailyafrica.com
    const businessDailyPromise = await axios
      .get('https://www.businessdailyafrica.com/bd/markets/currencies')
      .then((response) => {
        const html = response.data
        const $ = cheerio.load(html)
        const articles = $('.article-collection li')

        const businessDailyPromises = articles
          .map(async (_index, element) => {
            const title = $(element)
              .find('.teaser-image-left_title')
              .contents()
              .not('.prime-teaser-label')
              .text()
              .trim()
            const description = $(element).find('.text-block').text().trim()

            const link = $(element).find('a').attr('href')

            if (title && description && link) {
              const mainNews = await axios.get(
                `https://www.businessdailyafrica.com${link}`,
              )
              const mainHtml = mainNews.data
              const $main = cheerio.load(mainHtml)
              const date = $main('.grid-container-medium time')
                .contents()
                .not('.read-time')
                .text()
                .split(' — updated')[0]
                .trim()
              let imageUrl = $main('.article-picture img').attr('src')

              const imgList = $main('.article-picture img').attr('srcset')
              if (imgList) {
                const imgListArray = imgList.split(',')
                imageUrl = imgListArray[imgListArray.length - 1]
                  .replace('\n', '')
                  .split(' ')[0]
              }

              if (!imageUrl) {
                // Handle lazy-loaded image
                imageUrl = $(element)
                  .find('.article-picture img')
                  .attr('data-src')
              }
              if (date && imageUrl) {
                news.push({
                  title,
                  description,
                  imageUrl: `https://www.businessdailyafrica.com${imageUrl}`,
                  link: `https://www.businessdailyafrica.com${link}`,
                  date,
                })
              }
            }
          })
          .get()

        return Promise.all(businessDailyPromises)
      })

    // Fetch news from tuko.co.ke
    const tukoPromise = await axios
      .get('https://www.tuko.co.ke/business-economy/money/?page=2')
      .then((tukoResponse) => {
        const tukoHtml = tukoResponse.data
        const $tuko = cheerio.load(tukoHtml)
        const tukoArticles = $tuko('.js-articles article')

        const tukoPromises = tukoArticles
          .map(async (_index, element) => {
            let imageUrl = $tuko(element).find('img').attr('src')
            if (!imageUrl) {
              imageUrl = $tuko(element).find('img').attr('data-src')
            }

            const horizontalSection = $tuko(element).find(
              '.c-article-card-horizontal__container',
            )
            const title = horizontalSection.find('span').text().trim()
            const description = horizontalSection.find('p').text().trim()
            const link = horizontalSection.find('a').attr('href')

            if (title && description && imageUrl && link) {
              const mainNews = await axios.get(link)
              const mainHtml = mainNews.data
              const $main = cheerio.load(mainHtml)
              const date = $main(
                '.c-article-info__time.c-article-info__time--clock',
              )
                .first()
                .text()
                .replace('Updated', '')
                .split(' at')[0]
                .trim()

              if (date) {
                news.push({
                  title,
                  description,
                  imageUrl: imageUrl.replace('width=245', 'width=1080'),
                  link,
                  date,
                })
              }
            }
          })
          .get()

        return Promise.all(tukoPromises)
      })

    // Wait for both promises to resolve
    await Promise.all([businessDailyPromise, tukoPromise])

    // Sort the news articles in descending order based on date
    news.sort((a, b) => {
      const dateA = new Date(a.date || '')
      const dateB = new Date(b.date || '')
      return dateB.getTime() - dateA.getTime()
    })

    return news
  } catch (error) {
    console.error('Error:', error)
    return news
  }
}
