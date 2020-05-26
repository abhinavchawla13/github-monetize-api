module.exports = function handleError(res, err) {
  console.error(err)
  if (err && err.message) {
    return res.status(400).send({ error: err.message })
  }
  return res.status(400).send({ error: `${err}` });
};
