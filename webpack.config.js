module.exports = {
    resolve: {
        alias: {
            fs: 'pdfkit/js/virtual-fs.js'
        }
    },
    target: 'async-node',
    node: {
        fs: "empty"
    }
}
