import puppeteer, { Browser } from 'puppeteer'
import { prisma } from './../graphql/context'

class Article {
  imageUrl: string | null
  headline: string | null
  articleUrl: string | null
  time: string | null
  fullContent: any

  constructor(
    imageUrl: string | null,
    headline: string | null,
    articleUrl: string | null,
    time: string | null,
  ) {
    this.imageUrl = imageUrl
    this.headline = headline
    this.articleUrl = articleUrl
    this.time = time
    this.fullContent = null
  }
}

class ArticleScraper {
  private browser!: Browser

  async init() {
    this.browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
  }

  async scrapeFullArticle(articleUrl: string): Promise<any> {
    const page = await this.browser.newPage()
    await page.goto(articleUrl)

    // Wait for the article content to load
    await page.waitForSelector('article.post__main')

    // Extract the article content
    const articleData = await page.evaluate(() => {
      const articleElement = document.querySelector('article.post__main')

      // Extracting headline
      const headline =
        articleElement
          ?.querySelector('h1.c-main-headline')
          ?.textContent?.trim() || null

      // Extracting publication time
      const time =
        articleElement
          ?.querySelector('time.c-article-info__time')
          ?.getAttribute('datetime') || null

      // Extracting author details
      const authorElement = articleElement?.querySelector(
        'span.c-article-info__author a',
      )
      const author = authorElement?.textContent?.trim() || null
      const authorUrl = authorElement?.getAttribute('href') || null

      // Extracting expert details (if available)
      const expertElement = articleElement?.querySelector(
        'span.c-article-info__expert a',
      )
      const expert = expertElement?.textContent?.trim() || null
      const expertUrl = expertElement?.getAttribute('href') || null

      // Extracting content paragraphs
      const paragraphs = Array.from(
        articleElement?.querySelectorAll(
          'div.post__content p, div.post__content ul, div.post__content h2, div.post__content blockquote',
        ) || [],
      ).map((element) => element.textContent?.trim() || '')

      // Extracting images with captions
      const images = Array.from(
        articleElement?.querySelectorAll('figure.article-image') || [],
      ).map((figure) => {
        const imgElement = figure.querySelector('img')
        const caption =
          figure.querySelector('figcaption')?.textContent?.trim() || null
        return {
          src: imgElement?.getAttribute('src') || null,
          caption,
        }
      })

      return {
        headline,
        time,
        author,
        authorUrl,
        expert,
        expertUrl,
        paragraphs,
        images,
      }
    })

    await page.close()
    return articleData
  }

  async getLatestAboutMoney(): Promise<Article[]> {
    const page = await this.browser.newPage()
    await page.goto('https://www.tuko.co.ke/business-economy/money/')

    const title = await page.title()
    console.log(title)

    // Wait for the articles to load
    await page.waitForSelector('article.c-article-card-no-border')

    let articleList: Array<any> = []
    // Extract information from all articles
    let rawArticles = await page.evaluate(() => {
      const articleElements = document.querySelectorAll(
        'article.c-article-card-no-border',
      )

      return Array.from(articleElements).map((articleElement) => {
        const imageElement = articleElement.querySelector(
          'img.thumbnail-picture__img',
        )
        const headlineElement = articleElement.querySelector(
          'a.c-article-card-no-border__headline',
        )
        const timeElement = articleElement.querySelector(
          'time.c-article-info__time',
        )

        // Handling src or srcset
        let imageUrl = null
        if (imageElement) {
          imageUrl = imageElement.getAttribute('src')
          if (!imageUrl) {
            // If src is not available, fallback to srcset
            const srcset = imageElement.getAttribute('srcset')
            if (srcset) {
              // Select the first image URL in the srcset
              imageUrl = srcset.split(',')[0].split(' ')[0]
            }
          }
        }

        const headline = headlineElement
          ? headlineElement.textContent?.trim()
          : null
        const articleUrl = headlineElement
          ? headlineElement.getAttribute('href')
          : null
        const time = timeElement ? timeElement.getAttribute('datetime') : null

        return {
          imageUrl,
          headline,
          articleUrl,
          time,
        }
      })
    })

    // more articles
    // Wait for the articles to load
    await page.waitForSelector('article.c-article-card-horizontal')

    // console.log('Second Articles')

    // Extract information from all articles
    const secondArticles = await page.evaluate(() => {
      const articleElements = document.querySelectorAll(
        'article.c-article-card-horizontal',
      )

      return Array.from(articleElements).map((articleElement) => {
        const imageElement = articleElement.querySelector(
          'img.thumbnail-picture__img',
        )
        const headlineElement = articleElement.querySelector(
          'a.c-article-card-horizontal__headline',
        )
        const descriptionElement = articleElement.querySelector(
          'p.c-article-card-horizontal__description',
        )

        // Handling src or srcset for image
        let imageUrl = null
        if (imageElement) {
          imageUrl = imageElement.getAttribute('src')
          if (!imageUrl) {
            const srcset = imageElement.getAttribute('srcset')
            if (srcset) {
              imageUrl = srcset.split(',')[0].split(' ')[0]
            }
          }
        }

        const headline = headlineElement?.textContent?.trim() || null
        const articleUrl = headlineElement?.getAttribute('href') || null
        const description = descriptionElement?.textContent?.trim() || null

        return {
          imageUrl,
          headline,
          articleUrl,
          description,
        }
      })
    })

    articleList = [...rawArticles, ...secondArticles]

    // Convert raw article data to Article instances and scrape full content
    const articles: Article[] = []
    for (const rawArticle of articleList) {
      const article = new Article(
        rawArticle.imageUrl,
        rawArticle.headline!,
        rawArticle.articleUrl,
        rawArticle.time,
      )
      try {
        if (article.articleUrl) {
          article.fullContent = await this.scrapeFullArticle(article.articleUrl)
        }
      } catch (error) {
        console.error(`Failed to scrape full article: ${article.articleUrl}`)
      }
      articles.push(article)
    }

    await page.close()

    // console.log('Scrapped Data', articles)
    return articles
  }

  async close() {
    await this.browser.close()
  }
}

// Usage
export const getLatestAboutMoney = async () => {
  const cat = await prisma.category.findFirst({
    where: { name: 'Money' },
  })
  const scraper = new ArticleScraper()
  await scraper.init()
  const articles = await scraper.getLatestAboutMoney()

  // Save the articles to the database
  for (const article of articles) {
    if (article.fullContent) {
      const exists = await prisma.feed.findFirst({
        where: { title: article.headline! },
      })

      if (!exists) {
        await prisma.feed.create({
          data: {
            title: article.headline!,
            content: article.fullContent.paragraphs.join('\n'),
            photo: article.imageUrl!,
            creator: `
              <a href="${article.fullContent?.authorUrl}"> ${article.fullContent?.author}</a>`,
            owner: 'Tuko News',
            category: {
              connect: {
                id: cat?.id,
              },
            },
          },
        })
      }
    }
  }
  // save the articles to the database
  await scraper.close()
}
