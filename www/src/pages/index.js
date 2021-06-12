/* eslint-disable @typescript-eslint/no-var-requires,import/no-unresolved */
import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import HomepageFeatures from '../components/HomepageFeatures';

function HomepageHeader() {
  const Svg = require('../../static/img/shyft-logo-white.svg').default;
  return (
    <>
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <div className="hero">
            <Svg className={styles.logo} alt="Shyft Logo" />
            <h1 className="title">Shyft</h1>
            <h2>A server-side framework for building powerful GraphQL APIs</h2>
            <div>
              <Link className={styles.buttons} to="/intro">
                Getting Started
              </Link>
              <Link className={styles.buttons} to="/docs/api">
                API reference
              </Link>
            </div>
          </div>
        </div>
      </header>
      <div className={styles.announcement}>
        🚨 Shyft API is still undergoing changes 🚨
      </div>
    </>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title}>
      <Head>
        <script async defer src="https://buttons.github.io/buttons.js"></script>
        <title />
      </Head>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
