module.exports = {
  title: 'Shyft · A server-side framework for building powerful GraphQL APIs',
  url: 'https://www.shyft.dev',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon/favicon.ico',
  organizationName: 'Chris Kalmar', // Usually your GitHub org/user name.
  projectName: 'shyft', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: 'Shyft',
      logo: {
        alt: 'My Site Logo',
        src: 'img/shyft-logo-white.svg',
      },
      items: [
        {
          label: 'Intro',
          to: '/intro',
        },
        {
          to: 'docs/api',
          label: 'API',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          items: [
            {
              label: 'API',
              to: '/docs/api',
            },
            {
              label: 'Intro',
              to: '/guides',
            },
          ],
        },
        {
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/chriskalmar/shyft',
            },
            {
              html: `
                <a
                 class="github-button"
                 href="https://github.com/chriskalmar/shyft"
                 data-color-scheme="no-preference: light; light: light; dark: dark;"
                 data-icon="octicon-star"
                 data-size="large"
                 data-show-count="true"
                 aria-label="Star chriskalmar/shyft on GitHub"
                >
                  Star
                 </a>
              `,
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Chris Kalmar. Built with Docusaurus.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/chriskalmar/shyft',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  plugins: [
    [
      'docusaurus-plugin-typedoc',
      // Plugin / TypeDoc options
      {
        entryPoints: ['../src/index.ts'],
        tsconfig: '../tsconfig.json',
        readme: 'none',
        exclude: '**/*+(index|.spec|.e2e).ts',
        excludePrivate: true,
        excludeExternals: true,
        includeVersion: true,
      },
    ],
  ],
};
