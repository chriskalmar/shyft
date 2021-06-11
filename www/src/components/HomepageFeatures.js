/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    title: 'Source of Truth',
    Svg: require('../../static/img/features/undraw_source.svg').default,
    description: (
      <>
        Keep type definitions, validation rules, permissions settings and
        documentation in one place - the model.
      </>
    ),
  },
  {
    title: 'Generators',
    Svg: require('../../static/img/features/undraw_generators.svg').default,
    description: (
      <>
        Generate a strict GraphQL layer and persistence layer from the same
        model.
      </>
    ),
  },
  {
    title: 'Permissions',
    Svg: require('../../static/img/features/undraw_permissions.svg').default,
    description: (
      <>
        Shyft comes with a powerful permission framework. From simple role-based
        access to complex data-driven access rules - Shyft has got you covered.
      </>
    ),
  },

  {
    title: 'Filters',
    Svg: require('../../static/img/features/undraw_filter.svg').default,
    description: (
      <>
        Combine `AND` and `OR` filters, apply deeply nested selectors or write
        your own pre-filtering code - Shyft has it all.
      </>
    ),
  },
  {
    title: 'Workflows',
    Svg: require('../../static/img/features/undraw_workflow.svg').default,
    description: (
      <>
        Build complex business workflows with fine-grained control over access
        and input fields.
      </>
    ),
  },
  {
    title: 'Pagination',
    Svg: require('../../static/img/features/undraw_pagination.svg').default,
    description: (
      <>
        Go with a traditional limit/offset-based approach or jump onto the
        cursor-based pagination train.
      </>
    ),
  },

  {
    title: 'Hooks',
    Svg: require('../../static/img/features/undraw_hook.svg').default,
    description: (
      <>Define your own hooks on input and output to modify data as needed.</>
    ),
  },
  {
    title: 'Performance',
    Svg: require('../../static/img/features/undraw_performance.svg').default,
    description: (
      <>
        Shyft uses the popular
        [DataLoader](https://github.com/graphql/dataloader) utility to fetch
        data in a performant manner.
      </>
    ),
  },
  {
    title: 'CRUD+',
    Svg: require('../../static/img/features/undraw_mutations.svg').default,
    description: (
      <>
        Every entity is equipped with standard mutations. Replace them or add
        new ones - it's up to you.
      </>
    ),
  },

  {
    title: 'Validation',
    Svg: require('../../static/img/features/undraw_validation.svg').default,
    description: (
      <>
        Shyft lets you bring your own validation framework to check input
        fields.
      </>
    ),
  },
  {
    title: 'I18n Inside',
    Svg: require('../../static/img/features/undraw_i18n.svg').default,
    description: (
      <>We baked internationalization into Shyft right from the start.</>
    ),
  },
  {
    title: 'TypeScript',
    Svg: require('../../static/img/features/undraw_type.svg').default,
    description: <>Enjoy an awesome DX powered by TypeScript.</>,
  },

  {
    title: 'Actions',
    Svg: require('../../static/img/features/undraw_action.svg').default,
    description: (
      <>
        For more complex data fetching and mutation jobs Shyft provides a place
        to build your own queries and mutations.
      </>
    ),
  },
  {
    title: 'Relay Connections',
    Svg: require('../../static/img/features/undraw_connection.svg').default,
    description: (
      <>
        Move inside the graph from relation to relation using the convenient
        Relay standard.
      </>
    ),
  },
  {
    title: 'More',
    Svg: require('../../static/img/features/undraw_more.svg').default,
    description: (
      <>
        There is even more: hidden fields, dynamic field resolvers, mock data,
        migrations, ...
      </>
    ),
  },
];

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>
          <span>{title}</span>
        </h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="intro">
          <h2>How can Shyft help you and your project?</h2>
          <p>
            Shyft was developed 🖥 and battle-tested ⚔️ alongside numerous
            real-life projects. Features were build 🏗 based on actual use-cases
            💼. Shyft takes care of the simple and the complex parts in your
            project so you can focus 🔬 on the actual task at hand 🤘.
          </p>
        </div>
        <div className="row feature-grid">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
        <section className={styles.attribution}>
          Images by <a href="https://undraw.co/">unDraw</a>
        </section>
      </div>
    </section>
  );
}
