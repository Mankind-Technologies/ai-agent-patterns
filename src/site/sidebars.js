/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  patternsSidebar: [
    {
      type: 'category',
      label: 'Introduction',
      items: [
        'intro',
        'getting-started',
      ],
    },
    {
      type: 'category',
      label: 'Patterns',
      items: [
        'patterns/overview',
        'patterns/tool-budget',
        'patterns/embedded-explaining',
        'patterns/tap-actions',
        'patterns/agent-switch',
        'patterns/on-demand-context-retrieval',
        'patterns/countdown-timer',
        'patterns/countdown-turns',
        'patterns/surrender-task',
        // Add more patterns as they are created
      ],
    },
  ],
};

export default sidebars; 