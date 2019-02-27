config = {
    partial: 'layouts/partials/site-favicon.html',
    logo: 'art/logo/lantern.svg',
    design: {
        ios: {
            pictureAspect: 'backgroundAndMargin',
            backgroundColor: '#93cdb9',
            margin: '14%',
            assets: {
                ios6AndPriorIcons: false,
                ios7AndLaterIcons: false,
                precomposedIcons: false,
                declareOnlyDefaultIcon: true
            }
        },
        desktopBrowser: {},
        windows: {
            pictureAspect: 'whiteSilhouette',
            backgroundColor: '#3c6a5f',
            onConflict: 'override',
            assets: {
                windows80Ie10Tile: false,
                windows10Ie11EdgeTiles: {
                    small: false,
                    medium: true,
                    big: false,
                    rectangle: false
                }
            }
        },
        androidChrome: {
            pictureAspect: 'shadow',
            themeColor: '#93cdb9',
            manifest: {
                name: 'Lantern',
                display: 'standalone',
                orientation: 'notSet',
                onConflict: 'override',
                declared: true
            },
            assets: {
                legacyIcon: false,
                lowResolutionIcons: false
            }
        },
        safariPinnedTab: {
            pictureAspect: 'silhouette',
            themeColor: '#93cdb9'
        }
    }
};