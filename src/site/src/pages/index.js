import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Get Started - 5min ⏱️
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            to="/docs/patterns/tool-budget">
            View Tool Budget Pattern
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="A collection of proven patterns for building AI agents that work in production">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        
        <section className={styles.patternShowcase}>
          <div className="container">
            <div className="row">
              <div className="col col--12">
                <Heading as="h2" className="text--center margin-bottom--lg">
                  Featured Patterns
                </Heading>
              </div>
            </div>
            <div className="row">
              <div className="col col--6">
                <div className="pattern-card">
                  <h3>Tool Budget Pattern</h3>
                  <div className="badges">
                    <span className="badge badge--tool">Resource Management</span>
                    <span className="badge badge--budget">Cost Control</span>
                  </div>
                  <p>
                    Implement hard limits on expensive tool usage while maintaining agent effectiveness.
                    Perfect for controlling costs in production environments.
                  </p>
                  <Link
                    className="button button--primary"
                    to="/docs/patterns/tool-budget">
                    Learn More
                  </Link>
                </div>
              </div>
              <div className="col col--6">
                <div className="pattern-card">
                  <h3>More Patterns Coming Soon</h3>
                  <div className="badges">
                    <span className="badge badge--pattern">In Development</span>
                  </div>
                  <p>
                    We're continuously adding new patterns based on real-world AI agent implementations.
                    Stay tuned for more proven solutions.
                  </p>
                  <Link
                    className="button button--outline button--primary"
                    to="/docs/patterns/overview">
                    View All Patterns
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
} 