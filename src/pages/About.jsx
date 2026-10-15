import React, { useEffect, useMemo, useState } from 'react';
import { m as Motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ABOUT_BODY,
  ABOUT_BODY_ZH,
  CONTACT_EMAIL,
  getCameraIndex,
  getFranchiseIndex,
} from '../data/siteContent';
import { getCachedPhotos, loadPhotos } from '../lib/gallery';
import { Bi, SpecimenLabel } from '../components/Specimen';
import { CountUp, Reveal } from '../lib/motion';

const ABOUT_PHOTO = 'r0003845';

const About = () => {
  const reduceMotion = useReducedMotion();
  const [photos, setPhotos] = useState(() => getCachedPhotos() || []);

  useEffect(() => {
    let active = true;
    loadPhotos()
      .then((data) => { if (active) setPhotos(data); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const photo = photos.find((item) => item.slug === ABOUT_PHOTO)
    || photos.find((item) => item.featured && item.category === 'Toys')
    || photos[0];
  const franchises = useMemo(() => getFranchiseIndex(photos), [photos]);
  const cameras = useMemo(() => getCameraIndex(photos), [photos]);
  const pets = photos.filter((item) => item.category === 'Pets').length;
  const inventory = [
    { zh: '藏品', en: 'Items', value: photos.length },
    { zh: '玩具', en: 'Toys', value: photos.length - pets },
    { zh: '宠物', en: 'Pets', value: pets },
    { zh: '已编目', en: 'Catalogued', value: photos.filter((item) => item.catalogued).length },
    { zh: '系列', en: 'Series', value: franchises.length },
  ];

  return (
    <Motion.div
      className="about-page page-pad"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.3 }}
    >
      <header className="about-heading">
        <span className="section-no">00</span>
        <h1><Bi zh="关于" en="About" /></h1>
      </header>

      <div className="about-grid">
        <section className="about-copy">
          <div className="about-statement">
            {ABOUT_BODY_ZH.map((paragraph) => <p key={paragraph} className="about-zh">{paragraph}</p>)}
          </div>
          <div className="about-statement" lang="en">
            {ABOUT_BODY.map((paragraph) => <p key={paragraph} className="about-en">{paragraph}</p>)}
          </div>

          <dl className="about-facts">
            <div>
              <dt><Bi zh="联系" en="Contact" /></dt>
              <dd><a href={`mailto:${CONTACT_EMAIL}`} className="text-link">{CONTACT_EMAIL}</a></dd>
            </div>
            <div>
              <dt><Bi zh="器材" en="Cameras" /></dt>
              <dd>
                <ul className="plain-list" lang="en">
                  {cameras.map(([camera, count]) => (
                    <li key={camera}><span>{camera}</span><span className="specimen-no">{count}</span></li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </section>

        <aside className="about-side">
          <div className="inventory">
            <span className="sheet-heading">清单 <span lang="en">Inventory</span></span>
            <dl>
              {inventory.map((item) => (
                <div key={item.en}>
                  <dt><Bi zh={item.zh} en={item.en} /></dt>
                  <dd className="specimen-no">{photos.length ? <CountUp value={item.value} pad={3} /> : '—'}</dd>
                </div>
              ))}
            </dl>
          </div>

          {photo ? (
            <Reveal>
            <Link
              to={`/works?photo=${encodeURIComponent(photo.slug)}`}
              className="specimen-card about-photo"
              style={{ '--frame-color': `var(--color-${photo.frameColor || 'cobalt'}-frame)` }}
              aria-label={`No.${photo.no} ${photo.displayTitle}`}
            >
              <span className="specimen-frame">
                <img src={photo.src} alt="" width={photo.width} height={photo.height} decoding="async" />
              </span>
              <SpecimenLabel photo={photo} />
            </Link>
            </Reveal>
          ) : null}
        </aside>
      </div>
    </Motion.div>
  );
};

export default About;
