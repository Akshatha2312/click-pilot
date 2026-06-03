const logger = (req, res, next) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    const userId = req.user?.id || "anonymous";

    console.log(
      `[LOG] METHOD=${req.method} URL=${req.originalUrl} TIME=${new Date().toISOString()} USER_ID=${userId} DURATION_MS=${durationMs}`
    );
  });

  next();
};

module.exports = logger;