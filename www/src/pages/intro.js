/* eslint-disable @typescript-eslint/no-var-requires,import/no-unresolved */
import React from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function Intro() {
  const siteConfig = useDocusaurusContext();

  return (
    <Layout title={siteConfig.title}>
      <Head>
        <script async defer src="https://buttons.github.io/buttons.js"></script>
        <title />
      </Head>
    </Layout>
  );
}
