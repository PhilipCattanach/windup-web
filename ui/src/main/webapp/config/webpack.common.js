// var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// var ContextReplacementPlugin = webpack.ContextReplacementPlugin;
// var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var helpers = require('./helpers');
const path = require('path');

// const nodeModules = path.join(process.cwd(), 'node_modules');
// const genDirNodeModules = path.join(process.cwd(), 'src', '$$_gendir', 'node_modules');

module.exports = {
    mode: "development",
    
    entry: {
        'polyfills': './src/polyfills.ts',
        'vendor': './src/vendor.ts',
        'app': './src/main.ts'
    },

    resolve: {
        extensions: ['.js', '.ts']
    },

    watchOptions: {
        ignored: /node_modules/
    },
    
    module: {
        rules: [
            {
                test: /\.html$/,
                use: [
                    {loader: 'html-loader'}
                ]
            },
            {
                test: /\.(json|ftl)$/,
                exclude: /index\.html\.ftl/,
                use:[
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]'
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'assets/[name].[hash].[ext]'
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                exclude: [helpers.root('src', 'app'), helpers.root('node_modules', '@swimlane')],
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                          publicPath: '../'
                        }
                    },
                    // { loader: 'style-loader' },
                    { loader: 'css-loader', options: { sourceMap: true } }
                ]
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: [
                    { loader: 'raw-loader' },
                    { loader: 'sass-loader' }
                ] // sass-loader not scss-loader
//                include: helpers.root('src', 'app'),
//                loader: 'sass-loader'
            },
            {
                test: /\.css$/,
                include: [helpers.root('src', 'app'), helpers.root('node_modules', '@swimlane')],
                use: [
                    { loader: 'raw-loader' }
                ]
            },
            // All the sh*t for jQuery and other global plugins
            // jQuery needs to be exposed in window.jQuery and window.$ because of plugins dependencies
            // I'm not even sure if this helped, I had to expose jQuery manually anyway
            {
                test: '/jquery/',
                exclude: /\.css/,
                use: [
                    {
                        loader: 'expose-loader',
                        options: '$'
                    },
                    {
                        loader: 'expose-loader',
                        options: 'jQuery'
                    }
                ]
            },
            // Force those plugins to be loaded into global scope
            // They can load using AMD or CommonJS, but it doesn't work properly
            // They depend on global jQuery variable
            {
                test: /dataTables*\.js|jquery*\.js|colVis*\.js|colReorder*\.js|jstree\.js/,
                use: [
                    { loader: "imports-loader?define=>false" },
                    { loader: "imports-loader?exports=>false" }
                ]
            },
            {
                test: /jstree\.js/,
                use: [
                    { loader: 'imports-loader?define=>false' },
                    { loader: 'imports-loader?exports=>false' },
                    { loader: 'imports-loader?module=>false' }
                ]
            }
        ]
    },

    plugins: [
        // Cannot be used until this is solved: https://github.com/webpack/webpack/issues/2644
        // new DedupePlugin(),
        new HtmlWebpackPlugin({
            template: 'text-loader!src/index.html.ftl',
            filename: 'index.html.ftl',
            /**
             * This is workaround for bug with chunk ordering
             * (see https://github.com/jantimon/html-webpack-plugin/issues/481)
             *
             * @param a
             * @param b
             * @returns {number}
             */
            chunksSortMode: function(a, b) {
                const orders = ['polyfills', 'vendor', 'app'];
                const order1 = orders.indexOf(a.names[0]);
                const order2 = orders.indexOf(b.names[0]);

                if (order1 > order2) {
                    return 1;
                } else if (order1 < order2) {
                    return -1;
                } else {
                    return 0;
                }
            }
        }),
        // TODO exclude this plugin until this is fixed:
        // https://github.com/angular/angular-cli/issues/4431
        // https://github.com/angular/angular-cli/issues/6518

        // This is needed to suppress warning caused by some angular issue
        // see https://github.com/angular/angular/issues/11580
        /*
        new ContextReplacementPlugin(
            // The (\\|\/) piece accounts for path separators in *nix and Windows
            /angular(\\|\/)core(\\|\/)@angular/,
            helpers.root('./src'), // location of your src
            {} // a map of your routes
        )
        */
    ],
    // TODO: Find out if it helps,
    // tried this to get jquery externally loaded into global scope using <script> tag
/*    externals: {
        'jquery': 'jQuery'
    }
*/
};
