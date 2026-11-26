
"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import "./articles.scss";

const articles = [
  {
    title: "Pest Control for Commercial Kitchens",
    slug: "pest-control-commercial-kitchens",
    category: "Pest Control",
    description:
      "Discover why regular pest control is essential for maintaining hygiene and safety in commercial kitchens.",
    image: "/images/pest-control-article.jpg",
  },
  {
    title: "Importance of Electrical Audits",
    slug: "importance-of-electrical-audits",
    category: "Electrical Audit",
    description:
      "Learn how scheduled electrical audits help identify risks and improve electrical safety.",
    image: "/images/electrical-audit-article.jpg",
  },
  {
    title: "Commercial Water Tank Cleaning",
    slug: "commercial-water-tank-cleaning",
    category: "Water Tank Cleaning",
    description:
      "Understand the importance of regular water tank cleaning and maintenance for businesses.",
    image: "/images/commercial-water-tank-article.jpg",
  },
  {
    title: "Fire Extinguisher Maintenance",
    slug: "fire-extinguisher-maintenance",
    category: "Fire Safety",
    description:
      "Explore the importance of periodic fire extinguisher inspection, servicing and refilling.",
    image: "/images/FireExtinguisher-article.jpg",
  },
  {
    title: "Why Restaurants Need an AMC",
    slug: "why-restaurants-need-amc",
    category: "Annual Maintenance",
    description:
      "Find out how an annual maintenance contract supports restaurant safety and uninterrupted operations.",
    image: "/images/amcImg.png",
  },
];

export default function AMCArticlesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = [
    "All",
    ...new Set(articles.map((item) => item.category)),
  ];

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(search.toLowerCase()) ||
        article.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || article.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  return (
    <main className="amcArticles">

      <section className="articlesHero">
        <div className="articlesHeroContent">
          <span className="heroLabel">LIAISON BANK / AMC INSIGHTS</span>

          <h1>
            Insights & <span>Articles</span>
          </h1>

          <p>
            Expert guidance, practical knowledge and maintenance
            insights to help businesses operate safely and efficiently.
          </p>
        </div>
      </section>

      <section className="articlesSection">

        <div className="articlesHeading">
          <div>
            <span className="sectionLabel">KNOWLEDGE CENTRE</span>
            <h2>Explore Our Latest Articles</h2>
            <p>
              Explore useful insights about AMC, fire safety,
              electrical audits and business maintenance.
            </p>
          </div>

          {/* <span className="articleCount">
            {filteredArticles.length} Articles
          </span> */}
        </div>

        <div className="articleFilters">
          <div className="articleSearch">
            <i className="bi bi-search" />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="articlesGrid">
          {filteredArticles.map((article) => (
            <article className="articleCard" key={article.slug}>
              <Link
                href={`/articles/${article.slug}`}
                className="articleImage"
              >
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <span className="articleCategory">
                  {article.category}
                </span>
              </Link>

              <div className="articleContent">
                <h3>
                  <Link href={`/articles/${article.slug}`}>
                    {article.title}
                  </Link>
                </h3>

                <p>{article.description}</p>

                <Link
                  href={`/articles/${article.slug}`}
                  className="readArticle"
                >
                  Read Full Article
                  <i className="bi bi-arrow-up-right" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="noArticles">
            <i className="bi bi-journal-x" />
            <h3>No Articles Found</h3>
            <p>Try searching with a different keyword.</p>
          </div>
        )}

      </section>
    </main>
  );
}
