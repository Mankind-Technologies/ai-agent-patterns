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
        // Add more patterns as they are created
      ],
    },
  ],

  librariesSidebar: [
    {
      type: 'category',
      label: 'Supported Libraries',
      items: [
        'libraries/overview',
        'libraries/openai-agent-sdk-ts',
      ],
    },
    {
      type: 'category',
      label: 'Implementation Examples',
      items: [
        'examples/tool-budget-openai-ts',
        'examples/embedded-explaining-openai-ts',
        'examples/tap-actions-openai-ts',
        'examples/agent-switch-openai-ts',
        'examples/on-demand-context-retrieval-openai-ts',
      ],
    },
  ],
};

export default sidebars; 