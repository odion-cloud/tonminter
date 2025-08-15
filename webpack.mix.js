const mix = require('laravel-mix');
const path = require('path');

mix.setPublicPath('client/build');

// Vue.js setup
mix.js('client/src/main.js', 'client/build/js')
   .vue();

// Tailwind CSS
mix.postCss('client/src/styles/app.css', 'client/build/css/app.css', [
  require('tailwindcss'),
  require('autoprefixer'),
]);

mix.webpackConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client', 'src'),
      '@shared': path.resolve(__dirname, 'shared'),
      '@assets': path.resolve(__dirname, 'attached_assets'),
    },
    extensions: ['.js', '.vue', '.json'],
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer")
    }
  },
  output: {
    publicPath: '',
  },
  devtool: mix.inProduction() ? false : 'source-map',
  plugins: [
    new (require('webpack')).ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
});

if (!mix.inProduction()) {
  mix.sourceMaps();
} 