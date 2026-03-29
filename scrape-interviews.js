const { chromium } = require('playwright');
const { KEYWORDS, OUTPUT_FILE } = require('./exports')
const fs = require('fs');

async function run() {
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    storageState: 'leetcode-auth.json'
  });

  const page = await context.newPage();

  let skip = 0;
  const first = 20;
  let hasNextPage = true;

  const visited = new Set();

  console.log("Crawler started...");
  console.log("Tracking keywords:", KEYWORDS);

  while (hasNextPage) {
    console.log(`Fetching batch skip=${skip}`);

    try {
      const response = await page.request.post(
        'https://leetcode.com/graphql/',
        {
          headers: { 'content-type': 'application/json' },
          data: {
            operationName: "discussPostItems",
            variables: {
              orderBy: "HOT",
              keywords: [""],
              tagSlugs: ["interview"],
              skip,
              first
            },
            query: `
              query discussPostItems($orderBy: ArticleOrderByEnum, $keywords: [String]!, $tagSlugs: [String!], $skip: Int, $first: Int) {
                ugcArticleDiscussionArticles(
                  orderBy: $orderBy
                  keywords: $keywords
                  tagSlugs: $tagSlugs
                  skip: $skip
                  first: $first
                ) {
                  pageInfo { hasNextPage }
                  edges {
                    node {
                      slug
                      title
                      topicId
                    }
                  }
                }
              }
            `
          }
        }
      );

      const json = await response.json();
      const data = json?.data?.ugcArticleDiscussionArticles;

      if (!data) {
        console.log("Invalid response. Stopping.");
        break;
      }

      hasNextPage = data.pageInfo.hasNextPage;

      for (const edge of data.edges) {
        const { slug, title, topicId } = edge.node;

        const url = `https://leetcode.com/discuss/post/${topicId}/${slug}`;

        if (visited.has(topicId)) continue;
        visited.add(topicId);

        let postPage;

        try {
          postPage = await context.newPage();
          await postPage.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 15000
          });

          const content = await postPage.content();
          const lowerContent = content.toLowerCase();

          const matchedKeyword = KEYWORDS.find(keyword =>
            lowerContent.includes(keyword.toLowerCase())
          );

          if (matchedKeyword) {
            console.log(`✅ MATCH FOUND (${matchedKeyword}) → ${url}`);

            fs.appendFileSync(
              OUTPUT_FILE,
              `[${matchedKeyword}] ${title}\n${url}\n\n`
            );
          }

        } catch (err) {
          console.log(`Error opening ${url}`);
        } finally {
          if (postPage) {
            await postPage.close().catch(() => {});
          }
        }
      }

      skip += first;

      await new Promise(res => setTimeout(res, 1500));

    } catch (err) {
      console.log("GraphQL Error:", err.message);
      break;
    }
  }

  console.log("Crawling finished.");
  await browser.close();
}

run();
