import axios from "axios";

interface NewsAPIArticle {
  title: string;
  url: string;
  publishedAt: string;
  source: { name: string };
}

interface NewsAPIResponse {
  status: string;
  articles: NewsAPIArticle[];
}

export async function fetchTopHeadlines(date: string): Promise<NewsAPIArticle[]> {
  const from = `${date}T00:00:00`;
  const to = `${date}T23:59:59`;

  const response = await axios.get<NewsAPIResponse>(
    "https://newsapi.org/v2/everything",
    {
      params: {
        q: "(politics OR economy OR world OR president OR government OR war OR climate OR technology)",
        from,
        to,
        language: "en",
        sortBy: "popularity",
        pageSize: 20,
        apiKey: process.env.NEWS_API_KEY,
      },
    }
  );

  if (response.data.status !== "ok") {
    throw new Error("NewsAPI returned non-ok status");
  }

  return response.data.articles.filter(
    (a) => a.title && a.title !== "[Removed]" && a.url
  );
}
