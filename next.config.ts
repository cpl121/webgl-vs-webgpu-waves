import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.(glsl|vert|frag|vs|fs)$/,
      use: ['raw-loader'],
    });
    return config;
  },

  turbopack: {
    rules: {
      '*.{glsl,vert,frag,vs,fs}': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
