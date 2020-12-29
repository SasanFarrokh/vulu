module.exports = {
    lang: 'en-US',
    title: 'Vulu Docs',
    description: 'Validations has never been easier!',

    themeConfig: {
        repo: 'vuejs/vitepress',
        docsDir: 'docs',

        editLinks: true,
        editLinkText: 'Contribute on this page on GitHub',
        // lastUpdated: 'Last Updated',

        // algolia: {
        //     apiKey: 'c57105e511faa5558547599f120ceeba',
        //     indexName: 'vitepress'
        // },

        // carbonAds: {
        //     carbon: 'CEBDT27Y',
        //     custom: 'CKYD62QM',
        //     placement: 'vuejsorg'
        // },

        nav: [
            { text: 'Guide', link: '/' },
            // { text: 'Config Reference', link: '/config/basics' },
        ],
        sidebar: {
            '/guide': [
                {
                    text: 'Guide',
                    children: [
                        { text: 'Overview', link: '/guide/' },
                        { text: 'Installation', link: '/guide/installation' },
                        { text: 'Getting Started', link: '/guide/getting-started' },
                        { text: 'Configuration', link: '/guide/configuration' },
                        { text: 'Asset Handling', link: '/guide/assets' },
                        { text: 'Markdown Extensions', link: '/guide/markdown' },
                        { text: 'Deploying', link: '/guide/deploy' }
                    ]
                },
                {
                    text: 'Advanced',
                    children: [
                        { text: 'Integration with component libraries', link: '/guide/astnc' },
                        { text: 'Async Validation', link: '/guide/astnc' },
                        { text: 'UX Interactions', link: '/guide/astnc' },
                        { text: 'Accessibility (a11y)', link: '/guide/astnc' },
                    ]
                },
                {
                    text: 'Examples',
                    children: [
                        { text: 'Simple Input', link: '/guide/examples/simple-input' },
                    ]
                },
            ]
        }
    }
}