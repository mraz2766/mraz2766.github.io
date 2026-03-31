import React from 'react';
import { motion as Motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  getSeriesContent,
  HOME_HERO_TITLE,
  SITE_TAGLINE,
  SITE_TITLE,
} from '../data/siteContent';

const Home = () => {
  const pets = getSeriesContent('Pets');
  const toys = getSeriesContent('Toys');
  const entries = [
    { href: '/works/pets', content: pets },
    { href: '/works/toys', content: toys },
  ];

  return (
    <div className="editorial-home">
      <section className="editorial-home-lead">
        <div className="editorial-home-minimal">
          <Motion.div
            className="editorial-home-copy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="editorial-home-copy-stack">
              <span className="editorial-kicker">{SITE_TAGLINE}</span>
              <h1 className="editorial-home-brand">{SITE_TITLE}</h1>
              <p className="editorial-home-tagline">{HOME_HERO_TITLE}</p>
            </div>

            <div className="editorial-home-actions">
              <Link to="/works" className="editorial-link-primary">进入作品</Link>
              <Link to="/about" className="editorial-link-secondary">阅读作者自述</Link>
            </div>
          </Motion.div>
        </div>
      </section>

      <section className="editorial-entry-list" aria-label="专题列表">
        {entries.map(({ href, content }, index) => (
          <article key={href} className="editorial-entry">
            <div className="editorial-entry-copy">
              <div className="editorial-entry-meta">
                <span>{content.issue}</span>
                <span>{content.byline}</span>
                <span>{String(index + 1).padStart(2, '0')}</span>
              </div>

              <h3 className="editorial-entry-title">
                <Link to={href}>{content.archiveTitle}</Link>
              </h3>

              <p className="editorial-entry-body">{content.archiveSummary}</p>

              <div className="editorial-entry-actions">
                <Link to={href} className="editorial-text-link">
                  {content.readLabel || '继续阅读'}
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

export default Home;
