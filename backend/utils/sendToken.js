export default (user, statusCode, res) => {
  // Create JWT Token
  const token = user.getJwtToken();

  // Options for cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // Check User-Agent header
  const userAgent = res.req.headers["user-agent"];

  if (
    userAgent &&
    (userAgent.includes("Mobile") ||
      userAgent.includes("Android") ||
      userAgent.includes("iPhone"))
  ) {
    // Send token in response body for mobile clients
    res.status(statusCode).json({ token, success: true });
  } else {
    // Set httpOnly cookie for web clients
    res
      .status(statusCode)
      .cookie("token", token, options)
      .json({ token, success: true });
  }
};
