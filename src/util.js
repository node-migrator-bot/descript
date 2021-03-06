// ----------------------------------------------------------------------------------------------------------------- //
// ds.util
// ----------------------------------------------------------------------------------------------------------------- //

ds.util = {};

// ----------------------------------------------------------------------------------------------------------------- //

/**
    @param {!Object} dest
    @param {...!Object} srcs
    @return {!Object}
*/
ds.util.extend = function(dest, srcs) {
    for (var i = 1, l = arguments.length; i < l; i++) {
        var src = arguments[i];
        for (var key in src) {
            dest[key] = src[key];
        }
    }

    return dest;
};

// ----------------------------------------------------------------------------------------------------------------- //

ds.util.resolveFilename = function(dirname, filename) {
    var root = ds.config['rootdir'];

    if (/^\//.test(filename)) { // Absolute path.
        filename = node.path.join(root, filename);
    } else {
        filename = node.path.resolve(dirname, filename);
        // FIXME: Проверить, что путь не вышел за пределы root'а.
    }

    return filename;
};

// ----------------------------------------------------------------------------------------------------------------- //

ds.util.compileString = function(string) {
    var parts = string.split(/{\s*([^\s}]*)\s*}/g);

    var body = [];
    for (var i = 0, l = parts.length; i < l; i++) {
        var part = parts[i];

        if (i % 2) {
            var r = part.match(/^(state|config)\.(.*)$/);
            if (r) {
                body.push('(' + r[1] + '["' + r[2] + '"] || "")'); // TODO: Нужно уметь еще и { config.blackbox.url }.
            } else {
                body.push('( params["' + part + '"] || "")');
            }
        } else {
            body.push('"' + part + '"');
        }
    }

    return new Function('context', 'params', 'var state = context.state, config = context.config; return ' + body.join('+'));
};

ds.util.compileJPath = function(string) {
    var parts = string.split(/\./g);

    var body = '';
    for (var i = 0, l = parts.length; i < l; i++) {
        var r = parts[i].match(/^(.+?)(\[\d+\])?$/);
        body += 'if (!r) return; r = r["' + r[1] + '"];';
        if (r[2]) {
            body += 'if (!r) return; r = r' + r[2] + ';';
        }
    }

    return new Function('r', body + 'return r;');
};

// ----------------------------------------------------------------------------------------------------------------- //

ds.util.parseCookies = function(cookie) {
    var cookies = {};

    var parts = cookie.split(';');
    for (var i = 0, l = parts.length; i < l; i++) {
        var r = parts[i].match(/^\s*([^=]+)=(.*)$/);
        if (r) {
            cookies[ r[1] ] = r[2];
        }
    }

    return cookies;
};

// ----------------------------------------------------------------------------------------------------------------- //

ds.util.duration = function(s) {
    if (typeof s === 'number') {
        return s;
    }

    var parts = s.split(/(\d+)([dhms])/);
    var d = 0;

    for (var i = 0, l = parts.length; i < l; i += 3) {
        var n = +parts[i + 1];

        switch (parts[i + 2]) {
            case 'd':
                d += n * (60 * 60 * 24);
                break;
            case 'h':
                d += n * (60 * 60);
                break;
            case 'm':
                d += n * (60);
                break;
            case 's':
                d += n;
                break;
        }
    }

    return d * 1000;
};

// ----------------------------------------------------------------------------------------------------------------- //

