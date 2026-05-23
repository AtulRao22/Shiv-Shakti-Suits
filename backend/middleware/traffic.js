let visitors = 0;

const trackTraffic = (req, res, next) => {

    // Ignore static files
    if (
        req.url.includes(".css") ||
        req.url.includes(".js") ||
        req.url.includes(".png") ||
        req.url.includes(".jpg")
    ) {
        return next();
    }

    // Count once per session
    if (!req.session.visited) {

        visitors++;

        req.session.visited = true;

        req.app.locals.visitors = visitors;
    }

    next();
};

module.exports = trackTraffic;