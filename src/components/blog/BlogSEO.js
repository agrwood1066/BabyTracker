import React from 'react';
import { Helmet } from 'react-helmet-async';

const BlogSEO = ({ 
  title, 
  description, 
  slug, 
  image, 
  publishedAt, 
  modifiedAt,
  tags = [],
  author = 'Baby Steps Planner',
  type = 'article' 
}) => {
  const baseUrl = window.location.origin;
  const fullUrl = `${baseUrl}/blog/${slug}`;
  const siteName = 'Baby Steps Planner';
  
  // Structured data for search engines
  const structuredData = {
    "@context": "https://schema.org",
    "@type": type === 'website' ? 'WebSite' : 'BlogPosting',
    "headline": title,
    "description": description,
    "url": fullUrl,
    "datePublished": publishedAt,
    "dateModified": modifiedAt || publishedAt,
    "author": {
      "@type": "Organization",
      "name": author,
      "url": baseUrl
    },
    "publisher": {
      "@type": "Organization",
      "name": siteName,
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo-192x192.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": fullUrl
    }
  };

  // Add image to structured data if provided
  if (image) {
    structuredData.image = {
      "@type": "ImageObject",
      "url": image,
      "width": 1200,
      "height": 630
    };
  }

  // Add keywords if tags provided
  if (tags.length > 0) {
    structuredData.keywords = tags.join(', ');
  }

  // Article-specific structured data
  if (type === 'article') {
    structuredData["@type"] = "Article";
    structuredData.articleSection = "Pregnancy Planning";
    structuredData.wordCount = description ? description.split(' ').length * 10 : 500; // Estimate
  }

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title} | Baby Steps Planner</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type === 'website' ? 'website' : 'article'} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_GB" />
      
      {image && (
        <>
          <meta property="og:image" content={image} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:alt" content={title} />
        </>
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      
      {/* Article specific tags */}
      {type === 'article' && (
        <>
          <meta property="article:published_time" content={publishedAt} />
          {modifiedAt && <meta property="article:modified_time" content={modifiedAt} />}
          <meta property="article:section" content="Pregnancy Planning" />
          {tags.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Pinterest */}
      <meta name="pinterest-rich-pin" content="true" />
      
      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      
      {/* Breadcrumb structured data for blog posts */}
      {type === 'article' && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": baseUrl
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Blog",
                "item": `${baseUrl}/blog`
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": title,
                "item": fullUrl
              }
            ]
          })}
        </script>
      )}
    </Helmet>
  );
};

// SEO component for blog listing page
export const BlogListingSEO = () => (
  <BlogSEO
    title="Expert Pregnancy Planning Tips & Interactive Tools"
    description="Discover expert pregnancy planning advice, interactive budget calculators, and essential tips for expecting parents. Free guides for your pregnancy journey."
    slug=""
    type="website"
    image={`${window.location.origin}/images/blog-og-image.jpg`}
  />
);

// SEO component for individual blog posts
export const BlogPostSEO = ({ post }) => (
  <BlogSEO
    title={post.title}
    description={post.meta_description || post.excerpt}
    slug={post.slug}
    image={post.featured_image_url || `${window.location.origin}/images/blog-og-image.jpg`}
    publishedAt={post.published_at}
    modifiedAt={post.updated_at}
    tags={post.tags || []}
    type="article"
  />
);

export default BlogSEO;