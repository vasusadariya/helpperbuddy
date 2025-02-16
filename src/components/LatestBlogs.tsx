"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

const articles = [
  {
    id: 1,
    title: "Ultimate care guide how to wash, maintain, and extend the life of your bedding",
    category: "Essentials",
    date: "Nov 27, 2024",
    image: "https://cdn.zyrosite.com/cdn-ecommerce/store_01JCYZKF09EKDA2HS3ZXYAX2G1%2Fassets%2F1734721775540-1_4gthwYkzwqGIBjRkYKBlCQ.webp",
    featured: true
  },
  {
    id: 2,
    title: "The perfect bedroom retreat a guide to choosing luxurious bedding & linens",
    category: "Bedroom",
    image: "https://cdn.zyrosite.com/cdn-cgi/image/format=auto,w=328,h=184,fit=crop,q=100/cdn-ecommerce/store_01JCYZKF09EKDA2HS3ZXYAX2G1%2Fassets%2F1734722248276-v2-5urj8-u354l.webp"
  },
  {
    id: 3,
    title: "The science of sleep how quality bedding can make a big difference in your rest",
    category: "Wellness",
    image: "https://cdn.zyrosite.com/cdn-cgi/image/format=auto,w=656,h=492,fit=crop/cdn-ecommerce/store_01JCYZKF09EKDA2HS3ZXYAX2G1%2Fassets%2F1734723329486-store_01JCYZKF09EKDA2HS3ZXYAX2G1_assets_1732005612216-AC-Uninstallation-or-Dismantling-Indoor-Unit.webp"
  },
  {
    id: 4,
    title: "Refresh your bedroom with sustainable and eco-friendly bedding choices for a greener home",
    category: "Essentials",
    image: "https://cdn.zyrosite.com/cdn-cgi/image/format=auto,w=656,h=492,fit=crop/cdn-ecommerce/store_01JCYZKF09EKDA2HS3ZXYAX2G1%2Fassets%2F1734723844901-image4.webp"
  }
];

const LatestArticles = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div className="space-y-2">
            <div className="text-sm font-medium uppercase tracking-wider">BLOGS</div>
            <h2 className="text-4xl font-bold">Latest Articles</h2>
          </div>
          <Link 
            href="/blogs" 
            className="flex items-center gap-2 text-sm font-medium hover:opacity-80 hover:underline transition-opacity"
          >
            VIEW ALL
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Featured Article */}
          <Link href={`/blogs/${articles[0].id}`} className="relative group">
            <div className="relative h-[600px] overflow-hidden rounded-2xl">
              <Image
                src={articles[0].image}
                alt={articles[0].title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                height={600}
                width={1200}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 p-8 text-white">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-sm">{articles[0].category}</span>
                  <span className="w-1 h-1 bg-white rounded-full" />
                  <span className="text-sm">{articles[0].date}</span>
                </div>
                <h3 className="text-2xl font-semibold leading-tight mb-4">
                  {articles[0].title}
                </h3>
              </div>
            </div>
          </Link>

          {/* Other Articles */}
          <div className="flex flex-col justify-between h-[600px]">
            {articles.slice(1).map((article) => (
              <Link 
                key={article.id} 
                href={`/blogs/${article.id}`} 
                className="flex gap-6 group hover:bg-white rounded-xl p-3 transition-colors"
              >
                <div className="w-1/3 h-[120px] overflow-hidden rounded-xl flex-shrink-0">
                  <Image
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    height={120}
                    width={120}
                  />
                </div>
                <div className="w-2/3 space-y-3">
                  <span className="text-sm font-medium">{article.category}</span>
                  <h3 className="text-lg font-semibold leading-tight">
                    {article.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LatestArticles;