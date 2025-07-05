import { NextConfig } from 'next';

// next.config.ts
const nextConfig: NextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.(wgsl,glsl|vert|frag|vs|fs)$/,
      use: ['raw-loader'],
    });
    return config;
  },

  turbopack: {
    rules: {
      '*.{wgsl,glsl,vert,frag,vs,fs}': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
