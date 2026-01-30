import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'NextShop V2',
        short_name: 'NextShop',
        description: 'An awesome e-commerce application',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: '/logo/01.png',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    }
}
